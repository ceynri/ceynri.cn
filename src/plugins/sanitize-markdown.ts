import type { Html, Image, Link, Root, RootContent } from 'mdast';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

import { isLocalImageAssetUrl } from './content-assets';

export interface SanitizeMarkdownOptions {
  /**
   * 是否剥掉正文首个 H1。
   * 作者习惯在 frontmatter.title 之外，正文开头再写一个同名 H1；
   * 孪生已用 frontmatter.title 重建了 H1，故剥掉正文首 H1 以避免标题重复。
   */
  stripLeadingHeading?: boolean;
  /**
   * 本地图片解析函数：把正文原始相对路径解析为可访问的优化图绝对 URL。
   * 返回 null 表示解析失败（查不到映射/不适合优化），此时降级为文本占位。
   * 由调用方注入（生产用 content-image-resolver，测试用 mock），保持本模块可独立单测。
   */
  resolveImage?: (src: string) => Promise<string | null>;
}

/**
 * 内联 HTML 标签处理策略（ruby 单独走状态机处理，不在此表）。
 * - preserve：原样保留（语义明确、不干扰阅读，Agent 也能理解其语义）
 * - drop-tag：标签本身无内容意义，直接丢弃（不影响相邻文本）
 * - unwrap：拆掉标签、保留内部内容
 *
 * 注意：ruby 及其子标签由 processChildren 的状态机单独处理，不在此表。
 */
const TAG_POLICY: Record<string, 'preserve' | 'drop-tag' | 'unwrap'> = {
  details: 'preserve',
  summary: 'preserve',
  u: 'preserve',
  kbd: 'preserve',
  br: 'drop-tag',
  center: 'unwrap',
};

/** 匹配注释、doctype、CDATA、处理指令等非标签节点（直接删除） */
const NON_TAG_HTML_RE = /^\s*(<!--|<!|<\?)/;

/** 单个标签节点的解析结果 */
interface TagToken {
  tag: string;
  isClose: boolean;
  isComment: boolean;
  raw: string;
}

/** 把一个 html 节点值解析为标签 token；非标签（文本混杂）返回 null */
function parseTag(value: string): TagToken | null {
  const raw = value.trim();
  if (raw.startsWith('<!--')) {
    return { tag: '', isClose: false, isComment: true, raw };
  }
  const m = raw.match(/^<(\/?)([a-zA-Z][a-zA-Z0-9]*)[^>]*>$/);
  if (!m) return null;
  return { tag: m[2].toLowerCase(), isClose: m[1] === '/', isComment: false, raw };
}

/** 去掉字符串里的所有标签，保留文本 */
function stripTags(s: string): string {
  return s.replace(/<[^>]*>/g, '');
}

interface RubyState {
  active: boolean;
  /** 当前文本归属段：base 主体 / rt 注音 / rp 降级括号 */
  segment: 'base' | 'rt' | 'rp';
  base: string;
  rt: string;
  rp: string[];
}

/** 处理一个 children 数组，按策略改写其中的 html 节点（含 ruby 状态机） */
function processChildren(children: RootContent[]): void {
  const ruby: RubyState = { active: false, segment: 'base', base: '', rt: '', rp: [] };

  const flushRuby = (node: Html) => {
    const open = ruby.rp[0] ?? '(';
    const close = ruby.rp[1] ?? ')';
    node.value = ruby.rt ? `${ruby.base}${open}${ruby.rt}${close}` : ruby.base;
    ruby.active = false;
    ruby.segment = 'base';
    ruby.base = '';
    ruby.rt = '';
    ruby.rp = [];
  };

  for (const node of children) {
    if (node.type !== 'html') {
      if (ruby.active && node.type === 'text') {
        // 收集文本到对应段落后清空原节点，避免序列化时与降级结果重复
        if (ruby.segment === 'rt') ruby.rt += node.value;
        else if (ruby.segment === 'rp') ruby.rp.push(node.value);
        else ruby.base += node.value;
        node.value = '';
      }
      continue;
    }

    const htmlNode = node as Html;
    const token = parseTag(htmlNode.value);

    // 非纯标签（文本与标签混杂的块级 html）
    if (!token) {
      if (ruby.active) {
        ruby.base += stripTags(htmlNode.value);
        htmlNode.value = '';
      } else {
        htmlNode.value = degradeInlineHtml(htmlNode.value);
      }
      continue;
    }

    // ruby 状态机
    if (token.tag === 'ruby' && !token.isClose) {
      ruby.active = true;
      ruby.segment = 'base';
      htmlNode.value = '';
      continue;
    }
    if (token.tag === 'ruby' && token.isClose) {
      if (ruby.active) flushRuby(htmlNode);
      else htmlNode.value = '';
      continue;
    }
    if (ruby.active) {
      if (token.tag === 'rt') {
        ruby.segment = token.isClose ? 'base' : 'rt';
        htmlNode.value = '';
        continue;
      }
      if (token.tag === 'rp') {
        ruby.segment = token.isClose ? 'base' : 'rp';
        htmlNode.value = '';
        continue;
      }
      // ruby 内的其他标签忽略
      htmlNode.value = '';
      continue;
    }

    // 注释 / doctype 等：删除
    if (token.isComment || NON_TAG_HTML_RE.test(htmlNode.value)) {
      htmlNode.value = '';
      continue;
    }

    // 普通标签按策略
    const policy = TAG_POLICY[token.tag];
    if (policy === 'drop-tag' || policy === 'unwrap') {
      htmlNode.value = '';
    }
    // preserve 或未知标签：保留原样
  }
}

/** 处理混杂文本与标签的 html 块：删注释、按策略降级标签 */
function degradeInlineHtml(html: string): string {
  return html.replace(/<!--[\s\S]*?-->/g, '').replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g, (raw, tag: string) => {
    const policy = TAG_POLICY[tag.toLowerCase()];
    if (policy === 'drop-tag' || policy === 'unwrap') return '';
    return raw;
  });
}

/**
 * 净化 Markdown 正文：面向 AI 阅读的 Markdown 孪生。
 *
 * 在 mdast 上操作（而非正则处理整段文本）：HTML 节点按标签策略降级/保留/删除，
 * ruby 通过状态机用作者写好的 <rp> 降级括号输出「主体（注音）」，
 * 本地图片引用转为绝对原图 URL，最后重新序列化为干净 Markdown。
 */
export async function sanitizeMarkdown(body: string, options: SanitizeMarkdownOptions): Promise<string> {
  const processor = unified().use(remarkParse).use(remarkGfm).use(remarkStringify, {
    bullet: '-',
    fences: true,
    // 主题分隔线输出 ---，与作者正文习惯一致（默认是 ***）
    rule: '-',
  });

  const tree = processor.parse(body) as Root;

  // 剥掉正文首个 H1（如需）：作者习惯正文开头再写一遍与 frontmatter.title 同名的 H1，
  // 孪生已用 title 重建 H1，故去掉正文首 H1 避免重复。只处理位于首位的 heading，
  // 不影响正文中间可能出现的同名小节标题。
  if (options.stripLeadingHeading) {
    const firstBlock = tree.children.find((n) => !(n.type === 'html' && !(n as Html).value.trim()));
    if (firstBlock?.type === 'heading' && (firstBlock as { depth?: number }).depth === 1) {
      tree.children = tree.children.filter((n) => n !== firstBlock);
    }
  }

  // 先处理 HTML（含 ruby 状态机）。
  // 注意：必须在「直接持有 inline 节点」的容器（paragraph/heading/tableCell 等）
  // 上按序扫描一次，否则 ruby 状态机会跨容器重复跑、把降级文本拼多次。
  visit(tree, (node) => {
    const parent = node as { children?: RootContent[] };
    if (!Array.isArray(parent.children)) return;
    const holdsInline = parent.children.some(
      (c) => c.type === 'html' || c.type === 'text' || c.type === 'image' || c.type === 'link',
    );
    if (holdsInline) {
      processChildren(parent.children);
    }
  });

  // 再处理图片与图片类链接。
  // 本地图片经注入的 resolveImage 解析为可访问的优化图 URL；解析失败/未注入时降级为
  // 文本占位（不产出会 404 的原图 URL）。远程图不受影响、保持不变。
  // 先收集所有本地图片节点与其 src，批量 await 解析后再统一替换（visit 同步、解析异步）。
  const imageJobs: Array<{ node: Image | Link; parent: RootContent[]; index: number; kind: 'image' | 'link' }> = [];
  visit(tree, (node, index, parent) => {
    if (!parent || typeof index !== 'number') return;
    if (node.type === 'image' && isLocalImageAssetUrl((node as Image).url)) {
      imageJobs.push({
        node: node as Image,
        parent: (parent as { children: RootContent[] }).children,
        index,
        kind: 'image',
      });
    } else if (node.type === 'link' && isLocalImageAssetUrl((node as Link).url)) {
      imageJobs.push({
        node: node as Link,
        parent: (parent as { children: RootContent[] }).children,
        index,
        kind: 'link',
      });
    }
  });

  /** alt 里可能带 ?size= 这类图片处理指令，剥离后只留可读描述 */
  const cleanAlt = (alt: string | null | undefined) => (alt ?? '').split('?')[0].trim() || '图片';
  /** 链接文字（用于图片链接降级/替换） */
  const linkText = (link: Link) => (link.children ?? []).map((c) => (c.type === 'text' ? c.value : '')).join('');

  for (const job of imageJobs) {
    const src = job.node.url ?? '';
    const resolved = options.resolveImage ? await options.resolveImage(src) : null;

    if (job.kind === 'image') {
      const img = job.node as Image;
      const alt = cleanAlt(img.alt);
      if (resolved) {
        // 解析成功 → 指向优化图 URL 的图片（用全角括号注释的 alt 保留可读描述）
        job.parent[job.index] = { type: 'image', url: resolved, alt } as RootContent;
      } else {
        // 解析失败 → 文本占位（用全角括号，避免方括号被 remark 转义）
        job.parent[job.index] = { type: 'text', value: `（图：${alt}）` } as RootContent;
      }
    } else {
      const link = job.node as Link;
      const text = linkText(link);
      if (resolved) {
        // 图片链接（查看大图）→ 指向优化图 URL 的链接
        job.parent[job.index] = { ...link, url: resolved } as RootContent;
      } else {
        // 解析失败 → 去链接留文字
        job.parent[job.index] = { type: 'text', value: text } as RootContent;
      }
    }
  }

  const result = processor.stringify(tree);
  return String(result).trim();
}
