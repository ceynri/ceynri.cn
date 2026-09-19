import fs from 'node:fs';
import path from 'node:path';

import sharp from 'sharp';

import { resolveContentBase } from '~/plugins/content-assets';

/**
 * OG 卡片封面处理：把文章封面去噪后做成右侧圆角图版（data URI），
 * 供 satori 当「配图」贴到浅色卡片右侧。封面仅轻度去饱和/调亮，
 * 保持可辨识又不与白底卡片风格冲突。
 */

// 处理结果缓存：同一封面在一轮构建里只处理一次
const coverCache = new Map<string, string>();

/**
 * 从 markdown 源文件 frontmatter 里抽出 cover_image 原始引用字符串。
 * glob loader 会把 cover_image 转成 ImageMetadata（原相对路径丢失），
 * OG 需要原图本地路径供 sharp 读取，故从 post.filePath 重新解析 frontmatter。
 */
export async function extractCoverSrcFromMarkdown(markdownFilePath: string): Promise<string | null> {
  try {
    const content = await fs.promises.readFile(markdownFilePath, 'utf8');
    // 只认文件开头的 frontmatter 块，避免误匹配正文
    if (!content.startsWith('---')) return null;
    const end = content.indexOf('\n---', 3);
    if (end === -1) return null;
    const frontmatter = content.slice(3, end);
    const m = frontmatter.match(/^cover_image:\s*(.+?)\s*$/m);
    if (!m) return null;
    // 去掉包裹的引号
    return m[1].replace(/^['"]|['"]$/g, '');
  } catch {
    return null;
  }
}

/** 把 frontmatter 的 cover_image 引用解析为内容源内的绝对路径 */
function resolveCoverSourcePath(coverSrc: string, markdownFilePath: string, contentBase: string): string | null {
  const normalizedBase = path.resolve(contentBase);
  const sourcePath = coverSrc.startsWith('/')
    ? path.join(normalizedBase, coverSrc.replace(/^\/+/, ''))
    : path.resolve(path.dirname(markdownFilePath), coverSrc);
  return fs.existsSync(sourcePath) ? sourcePath : null;
}

/**
 * 处理封面为右侧图版的 data URI（去噪、方形裁切）。
 * @param coverSrc frontmatter 里的 cover_image 原始引用（如 ./assets/slug/cover.jpg）
 * @param markdownFilePath 文章 markdown 绝对路径（post.filePath）
 * @param projectRoot 项目根（用于 resolveContentBase）
 * @returns 图版 data URI；封面缺失或处理失败时返回 null（降级为无封面卡片）
 */
export async function processCoverForOg(
  coverSrc: string,
  markdownFilePath: string,
  projectRoot: string,
): Promise<string | null> {
  const contentBase = resolveContentBase(projectRoot);
  const sourcePath = resolveCoverSourcePath(coverSrc, markdownFilePath, contentBase);
  if (!sourcePath) return null;

  const cached = coverCache.get(sourcePath);
  if (cached) return cached;

  try {
    // 方形居中裁切成右侧图版；轻度去饱和 + 微提亮，与白底卡片协调
    const processed = await sharp(sourcePath)
      .resize(800, 800, { fit: 'cover', position: 'center' })
      .modulate({ saturation: 0.6, brightness: 0.98 })
      .png({ quality: 85 })
      .toBuffer();
    const dataUri = `data:image/png;base64,${processed.toString('base64')}`;
    coverCache.set(sourcePath, dataUri);
    return dataUri;
  } catch {
    // 封面处理失败（损坏/格式异常）时降级为无封面卡片
    return null;
  }
}
