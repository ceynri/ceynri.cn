/**
 * blog-toc 核心计算逻辑：纯函数、零依赖、不触碰 DOM，可独立单测。
 *
 * 坐标约定：
 * - 文档坐标系：以文档顶部为原点的纵向像素（= getBoundingClientRect().top + scrollY）。
 * - 线条比例：单条轨道线内 0=章首、1=章末。
 * - 轨道内容坐标系：以轨道内容（线条列表）顶部为原点的纵向像素。
 */

/** 目录项（已按 maxDepth 过滤、不含 H1） */
export interface TocItem {
  /** 标题层级，2=H2、3=H3 */
  depth: number;
  /** 标题锚点 id */
  slug: string;
  /** 标题文字 */
  text: string;
}

/** 章节在文档中的纵向区间（文档坐标系，像素） */
export interface SectionRange {
  slug: string;
  /** 章节顶（该标题的文档偏移） */
  top: number;
  /** 章节底（下一标题的文档偏移，末章取正文底） */
  bottom: number;
}

/** 单条线上的高亮子区段，start/end ∈ [0,1]，0=章首、1=章末；start==end 表示零宽（隐形） */
export interface LineFill {
  slug: string;
  start: number;
  end: number;
}

/** 单条轨道线在轨道内容坐标系中的几何 */
export interface LineGeometry {
  slug: string;
  /** 线条顶在轨道内容中的偏移（px） */
  top: number;
  /** 线条高度（px） */
  height: number;
}

/** 将值钳制到 [min, max] */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** 将值钳制到 [0, 1] */
export function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

/**
 * 由各标题的纵向偏移构造章节区间。
 * 章节 i 的区间 = [offset_i, offset_{i+1})，末章右界取正文底。
 * @param offsets 按文档顺序排列的标题偏移 {slug, top}（文档坐标系）
 * @param bodyBottom 正文底部的文档坐标
 */
export function buildSections(offsets: { slug: string; top: number }[], bodyBottom: number): SectionRange[] {
  return offsets.map((cur, i) => {
    const next = offsets[i + 1];
    const rawBottom = next ? next.top : bodyBottom;
    return {
      slug: cur.slug,
      top: cur.top,
      // 防御：保证 bottom ≥ top，避免标题偏移异常导致负高度
      bottom: Math.max(rawBottom, cur.top),
    };
  });
}

/**
 * 为【每一条线】计算窗口投影后的高亮子区段——纯函数、无状态，每帧每条都给确定值。
 *
 * 单一公式（坐标系：文档像素）：
 *   start = clamp01((viewTop - top) / height)
 *   end   = clamp01((viewBottom - top) / height)
 *
 * 由这一个公式自然涌现所有情形，无需对「相交/不相交」分支特判：
 * - 与视口相交：得到 [start, end] 子区段（左=章首、右=章末），含「同屏多段各按可见比例高亮」「超长章节子区段左→右移动」；
 * - 视口上方（已滚过）的章节：start、end 同时被钳到 1 → 收敛为 [1,1]（贴右端、零宽 → 隐形）；
 * - 视口下方（未抵达）的章节：start、end 同时被钳到 0 → 收敛为 [0,0]（贴左端、零宽 → 隐形）。
 *
 * 因此每条线在任意滚动位置都有确定值：**不需要 opacity 显隐、也不需要冻结上次位置**。
 * 离场是连续收敛到本侧边缘（不会从右滑到左）；仅当滚动位置「瞬间大跳变」时，
 * 各线的 [start,end] 会从旧值一步跳到新值，配合 CSS 过渡呈现一次快速扫过——
 * 这是窗口带模型在瞬间突变下的物理一致表现，属可接受的极端情形。
 *
 * @param sections 章节区间（文档坐标系）
 * @param viewTop 视口顶的文档坐标（scrollY）
 * @param viewBottom 视口底的文档坐标（scrollY + innerHeight）
 */
export function computeLineFills(sections: SectionRange[], viewTop: number, viewBottom: number): LineFill[] {
  return sections.map((s) => {
    const height = s.bottom - s.top;
    if (height <= 0) return { slug: s.slug, start: 0, end: 0 };
    return {
      slug: s.slug,
      start: clamp01((viewTop - s.top) / height),
      end: clamp01((viewBottom - s.top) / height),
    };
  });
}

/**
 * 由高亮涉及的线条几何计算高亮带中点（轨道内容坐标系）。
 * 取首条与末条高亮线之间的整体跨度中点。
 * @param lines 按顺序排列的线条几何
 * @param highlightedSlugs 当前高亮的 slug 集合
 * @returns 中点偏移；无任何高亮线时返回 null
 */
export function computeBandCenter(lines: LineGeometry[], highlightedSlugs: Set<string>): number | null {
  const active = lines.filter((l) => highlightedSlugs.has(l.slug));
  if (active.length === 0) return null;
  const first = active[0];
  const last = active[active.length - 1];
  return (first.top + (last.top + last.height)) / 2;
}

/**
 * 计算轨道内容的纵向位移（translateY）：令高亮带中点在轨道可视区垂直居中，
 * 并钳制在 [minOffset, 0]——开头阶段钉顶（offset=0，高亮自然落上半），
 * 结尾阶段沉底（offset=minOffset，高亮自然落下半）。内容不超过可视区时恒为 0（不滚动）。
 * @param bandCenter 高亮带中点（轨道内容坐标系）；为 null 时返回 0
 * @param viewportH 轨道可视区高度
 * @param contentH 轨道内容总高度
 */
export function computeTrackOffset(bandCenter: number | null, viewportH: number, contentH: number): number {
  if (bandCenter === null) return 0;
  const desired = viewportH / 2 - bandCenter;
  const minOffset = Math.min(0, viewportH - contentH);
  return clamp(desired, minOffset, 0);
}

/**
 * 整篇阅读百分比 ∈ [0,1]：以视口垂直中线为阅读焦点、以正文范围为基准。
 * 焦点到达正文顶 → 0；到达正文底 → 1。基准排除封面/顶栏/评论/页脚等非正文元素，
 * 由调用方传入正文范围保证。
 * @param scrollY 当前滚动位置
 * @param innerHeight 视口高度
 * @param bodyTop 正文顶的文档坐标
 * @param bodyBottom 正文底的文档坐标
 */
export function computeProgress(scrollY: number, innerHeight: number, bodyTop: number, bodyBottom: number): number {
  const span = bodyBottom - bodyTop;
  if (span <= 0) return 0;
  const focus = scrollY + innerHeight / 2;
  return clamp01((focus - bodyTop) / span);
}
