/**
 * 阅读时长估算（分钟）。
 *
 * 统计方式：中文字符按「字」计、英文/数字按「词」计；正文里的代码、文字都计入，
 * 只剥掉 frontmatter（元数据）与图片语法（图片改为单独按秒计入）。
 *
 * 阅读速度取自阅读研究而非经验拍脑袋：
 * - 中文默读约 260 字/分钟（C-READ、Brussee 等汉语阅读研究，多个研究落在 255–273 字/分）
 * - 英文默读约 238 词/分钟（Brysbaert 2019 元分析，190 项研究，非小说类）
 * 另加少量起步冗余，模拟读者进入阅读状态前的慢热，也避免短文被算成瞬间读完。
 */

// 中文默读速度（字/分钟）
const CJK_CHARS_PER_MIN = 260;
// 英文默读速度（词/分钟）
const LATIN_WORDS_PER_MIN = 238;
// 每张图片的停留时长（秒）：多数人扫图不停留，取略作停留与一扫而过之间的折中
const SECONDS_PER_IMAGE = 5;
// 起步冗余（秒）：进入阅读状态前的慢热时间
const WARMUP_SECONDS = 30;

/**
 * 估算阅读时长（分钟，四舍五入，至少 1 分钟）。
 * @param markdown 文章正文 Markdown 原文
 */
export function readingMinutes(markdown: string): number {
  // 只去 frontmatter（元数据，非正文）。
  // post.body 已不含 frontmatter；正文里可能含 `---` 水平线。
  // 故仅当首行是完整定界线、且次行形似 YAML 键值时才按 frontmatter 剥离，
  // 避免把「以水平线开头的正文」误吞。
  const hasFrontmatter = /^---[ \t]*\r?\n[\w-]+\s*:/.test(markdown);
  const body = hasFrontmatter ? markdown.replace(/^---[\s\S]*?^---[ \t]*\r?\n/m, '') : markdown;

  // 图片：单独按秒计，语法本身不算字。覆盖 Markdown 与 HTML 两种写法
  const imageCount = (body.match(/!\[[^\]]*\]\([^)]*\)/g) || []).length + (body.match(/<img\b/gi) || []).length;

  // 剥掉「非内容」的语法符号，但保留文字与代码内容本身：
  const text = body
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // 图片整体去掉（含 URL）
    .replace(/<img\b[^>]*>/gi, '') // HTML img 标签
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // 链接保留文字、去 URL
    .replace(/```[^\n]*\n?/g, '') // 代码块围栏（保留块内代码）
    // 仅剥离合法 HTML 标签，避免误删正文里的比较符（a < b > c）或 <词语> 这类强调
    .replace(/<\/?[a-zA-Z][a-zA-Z0-9-]*(\s[^>]*)?\/?>/g, '');

  // 中文字符按字计（含日文假名，避免日文词汇完全漏算）
  const cjkRe = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\u3040-\u30ff]/g;
  const cjkCount = (text.match(cjkRe) || []).length;
  // 剔除中文与全角标点后，英文/数字按词计
  const nonCJK = text.replace(cjkRe, ' ').replace(/[\u3000-\u303f\uff00-\uffef]/g, ' ');
  const wordCount = (nonCJK.match(/[a-zA-Z0-9]+/g) || []).length;

  const totalSeconds =
    (cjkCount / CJK_CHARS_PER_MIN) * 60 +
    (wordCount / LATIN_WORDS_PER_MIN) * 60 +
    imageCount * SECONDS_PER_IMAGE +
    WARMUP_SECONDS;

  return Math.max(1, Math.round(totalSeconds / 60));
}
