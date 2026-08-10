#!/usr/bin/env node
/**
 * 首次发布时间回写脚本
 *
 * 扫描内容源中 `published: true` 且缺少 `publishedAt` 的博客文章，
 * 将当前时刻（秒级、带时区的 ISO 8601）写入其 frontmatter，实现「首次发布时间」的自动捕获。
 *
 * 特性：
 * - 幂等：一旦写入 `publishedAt`，后续重跑不再改写。
 * - 零依赖：仅用 Node 内置模块，单行插入不重排 frontmatter 其余字节。
 * - 支持 --dry-run：仅打印将改动的文件，不写盘。
 *
 * 用法：
 *   node scripts/backfill-published-at.mjs [--dry-run] [--base <内容根目录>]
 *
 * 内容根目录解析优先级：--base 参数 > CONTENT_BASE 环境变量 > 默认 ./content
 *
 * 时区：由进程 TZ 环境变量决定（CI 中设为 Asia/Shanghai），默认取系统时区。
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const SKIP_DIR_NAMES = new Set(['assets', 'node_modules', '.git']);

/** 解析命令行参数 */
function parseArgs(argv) {
  const args = { dryRun: false, base: undefined };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--dry-run') {
      args.dryRun = true;
    } else if (arg === '--base') {
      args.base = argv[i + 1];
      i += 1;
    } else if (arg.startsWith('--base=')) {
      args.base = arg.slice('--base='.length);
    }
  }
  return args;
}

/**
 * 生成秒级、带时区偏移的 ISO 8601 时间戳，形如 2026-08-10T15:42:07+08:00
 * 不依赖 toISOString（其恒为 UTC），而是按进程 TZ 取本地时间分量。
 */
function formatLocalIsoSeconds(date) {
  const pad = (n) => String(n).padStart(2, '0');
  const y = date.getFullYear();
  const mo = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const h = pad(date.getHours());
  const mi = pad(date.getMinutes());
  const s = pad(date.getSeconds());
  // getTimezoneOffset 返回「UTC 减本地」的分钟数，符号与时区偏移相反
  const offsetMin = -date.getTimezoneOffset();
  const sign = offsetMin >= 0 ? '+' : '-';
  const oh = pad(Math.floor(Math.abs(offsetMin) / 60));
  const om = pad(Math.abs(offsetMin) % 60);
  return `${y}-${mo}-${d}T${h}:${mi}:${s}${sign}${oh}:${om}`;
}

/** 递归收集 dir 下所有 .md 文件（跳过 SKIP_DIR_NAMES 与下划线开头的文件） */
function collectMarkdownFiles(dir, base, acc = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const entry of entries) {
    if (entry.name.startsWith('.') || SKIP_DIR_NAMES.has(entry.name)) {
      continue;
    }
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      collectMarkdownFiles(full, base, acc);
    } else if (entry.isFile() && entry.name.endsWith('.md') && !entry.name.startsWith('_')) {
      acc.push(full);
    }
  }
  return acc;
}

/** 提取 frontmatter 块及其在原文中的区间；无 frontmatter 返回 null */
function extractFrontmatter(content) {
  if (!content.startsWith('---')) {
    return null;
  }
  const endIndex = content.indexOf('\n---', 3);
  if (endIndex === -1) {
    return null;
  }
  const block = content.slice(0, endIndex + 4); // 含收尾 ---
  return { block, end: endIndex + 4 };
}

/**
 * 在 frontmatter 块内注入 publishedAt。
 * 优先锚定 createdAt 行，其次 date 行，否则插入到收尾 --- 之前。
 * 返回注入后的完整文件内容；若无需注入返回 null。
 */
function injectPublishedAt(content, isoTimestamp) {
  const fm = extractFrontmatter(content);
  if (!fm) {
    return null;
  }
  const { block } = fm;

  // 已有 publishedAt：幂等跳过
  if (/^publishedAt\s*:/m.test(block)) {
    return null;
  }
  // 未发布（published: false）：跳过
  if (/^published\s*:\s*false\s*$/m.test(block)) {
    return null;
  }
  // 显式 published: true，或未声明 published（schema 默认 true）才继续
  const newLine = `publishedAt: ${isoTimestamp}\n`;

  let newBlock;
  if (/^createdAt\s*:.*$/m.test(block)) {
    newBlock = block.replace(/^(createdAt\s*:.*)$/m, `$1\n${newLine.trimEnd()}`);
  } else if (/^date\s*:.*$/m.test(block)) {
    newBlock = block.replace(/^(date\s*:.*)$/m, `$1\n${newLine.trimEnd()}`);
  } else {
    // 插入到收尾 --- 之前
    newBlock = block.replace(/\n---\s*$/, `\n${newLine.trimEnd()}\n---`);
  }

  if (newBlock === block) {
    return null;
  }
  return newBlock + content.slice(fm.end);
}

/** 检测 frontmatter 中疑似 publishedAt 的形近笔误键（如 pubclishedAt），用于提示脏数据 */
function detectTypoKey(block) {
  const match = block.match(/^(pub\w*At)\s*:/m);
  if (match && match[1] !== 'publishedAt') {
    return match[1];
  }
  return null;
}

function main() {
  const { dryRun, base } = parseArgs(process.argv.slice(2));
  const contentBase = resolve(base || process.env.CONTENT_BASE || './content');
  const blogDir = join(contentBase, 'blog');
  const isoTimestamp = formatLocalIsoSeconds(new Date());

  const files = collectMarkdownFiles(blogDir, contentBase);
  const changed = [];
  const typoWarned = [];

  for (const file of files) {
    const original = readFileSync(file, 'utf8');
    const fm = extractFrontmatter(original);
    if (fm) {
      const typo = detectTypoKey(fm.block);
      if (typo) {
        typoWarned.push({ file, typo });
      }
    }
    const updated = injectPublishedAt(original, isoTimestamp);
    if (updated !== null) {
      changed.push({ file, updated });
    }
  }

  const rel = (f) => relative(process.cwd(), f) || f;

  for (const { file, typo } of typoWarned) {
    console.warn(`⚠️  ${rel(file)} 存在疑似笔误的字段 \`${typo}\`（应为 publishedAt?），请人工确认。`);
  }

  if (changed.length === 0) {
    console.log('✅ 没有需要回写 publishedAt 的文章。');
    return;
  }

  console.log(`🕐 使用时间戳: ${isoTimestamp}`);
  for (const { file } of changed) {
    console.log(`  ${dryRun ? '[dry-run] ' : ''}写入 -> ${rel(file)}`);
  }

  if (dryRun) {
    console.log(`\n[dry-run] 共 ${changed.length} 篇将写入 publishedAt，未做实际修改。`);
    return;
  }

  for (const { file, updated } of changed) {
    writeFileSync(file, updated, 'utf8');
  }
  console.log(`\n✅ 已为 ${changed.length} 篇文章写入 publishedAt。`);
}

main();
