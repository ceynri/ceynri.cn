import type { Box, CompositionPreset, Frame, SelectedComposition } from './types';

/** 画框相对视口较短边的内缩边距比例（装裱 / 顶窗类使用） */
const MARGIN_RATIO = 0.06;
/** 上下横向画框占据视口高度的比例 */
const BAND_RATIO = 0.5;
/** 左右纵向画框占据视口宽度的比例 */
const SPLIT_RATIO = 0.5;
/** 顶部窗口画框占据视口高度的比例 */
const TOP_WINDOW_RATIO = 0.6;

/**
 * 主视觉「安全区」内缩（px）：避让四角固定 chrome（站名 / 社交图标 / 头像 / 版权）。
 * 这些 chrome 是绝对尺寸、与屏幕大小无关，故此处用常量而非比例——文案被约束在安全区内，
 * 任何屏幕尺寸下都不会与四角元素冲突，无需针对具体尺寸打补丁。
 */
const SAFE_TOP = 64;
const SAFE_BOTTOM = 96;

/**
 * 将数值约束到区间内
 */
function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/**
 * 画框内缩边距（px），随视口较短边缩放并做上下限约束
 */
function margin(vw: number, vh: number) {
  return Math.round(clamp(Math.min(vw, vh) * MARGIN_RATIO, 24, 72));
}

/**
 * 主视觉安全区：视口减去四角 chrome 的内缩后剩余的矩形。左右内缩随视口略微缩放，
 * 上下为清除四角元素所需的固定像素。所有构图共用同一安全区，仅靠对齐方式决定文案落点。
 */
function safeRegion(vw: number, vh: number): Box {
  const side = Math.round(clamp(vw * MARGIN_RATIO, 24, 100));
  return { left: side, top: SAFE_TOP, width: vw - side * 2, height: vh - SAFE_TOP - SAFE_BOTTOM };
}

/**
 * 首页构图预设列表：每个预设是一组搭配好的「背景画框 + 文案落点」。
 *
 * 设计模型：
 * - 文案统一落在「安全区」内（见 safeRegion），从根本上避免与四角固定 chrome 冲突；
 * - 背景画框（frame）是一块艺术性矩形，允许与文案重叠——重叠时靠 text-shadow 保证可读；
 * - 每个预设仅通过 heroWrapClass 的对齐方式决定文案锚定在安全区的哪个边 / 角：
 *   背景不覆盖该锚点时自然形成「留白分离」，屏幕过小放不下时优雅降级为「叠加」；
 * - 垂直几何居中（items-center）的预设额外加 mt 做光学校正，把视觉重心从几何中心略微上提；
 * - 间距 / 字号统一用 clamp(vw) 表达，随视口等比例缩放并在两端设限，保证各屏宽下比例一致。
 * 说明：heroWrapClass / heroBlockClass 以字面量形式列在此处供 Tailwind 静态提取。
 */
const PRESETS: CompositionPreset[] = [
  // 全屏铺满，文案居中叠加
  {
    name: 'fullbleed-center',
    supportsMobile: true,
    frame: (vw, vh) => ({ width: vw, height: vh, left: 0, top: 0 }),
    heroWrapClass: 'items-center justify-center',
    heroBlockClass: 'items-center text-center mt-[clamp(1.5rem,3vw,3rem)]',
  },
  // 装裱式：四周留黑边画框，文案居中叠加
  {
    name: 'poster-inset',
    supportsMobile: true,
    frame: (vw, vh) => {
      const m = margin(vw, vh);
      return { width: vw - m * 2, height: vh - m * 2, left: m, top: m };
    },
    heroWrapClass: 'items-center justify-center',
    heroBlockClass: 'items-center text-center mt-[clamp(1.5rem,3vw,3rem)]',
  },
  // 顶部窗口画框，文案落在窗口下方居中
  {
    name: 'top-window',
    supportsMobile: true,
    frame: (vw, vh) => {
      const m = margin(vw, vh);
      return { width: vw - m * 2, height: Math.round(vh * TOP_WINDOW_RATIO) - m, left: m, top: m };
    },
    heroWrapClass: 'items-end justify-center pb-[2vh]',
    heroBlockClass: 'items-center text-center',
  },
  // 上方横带，文案落在下方靠左；宽屏标题降档避免半屏高里过挤，lg: 限定不波及移动端字号
  {
    name: 'band-top',
    supportsMobile: true,
    frame: (vw, vh) => ({ width: vw, height: Math.round(vh * BAND_RATIO), left: 0, top: 0 }),
    heroWrapClass: 'items-end justify-start',
    heroBlockClass: 'items-start text-left lg:[&_.hero-title]:text-[clamp(1.5rem,3vw,3.5rem)]',
  },
  // 下方横带，文案垂直居中靠左、压在画框上边界，消除上下对半的割裂感，与 band-top 成套（仅宽屏）
  {
    name: 'band-bottom',
    supportsMobile: false,
    frame: (vw, vh) => {
      const h = Math.round(vh * BAND_RATIO);
      return { width: vw, height: h, left: 0, top: vh - h };
    },
    heroWrapClass: 'items-center justify-start',
    heroBlockClass:
      'items-start text-left mt-[clamp(1.5rem,3vw,3rem)] lg:[&_.hero-title]:text-[clamp(1.5rem,3vw,3.5rem)]',
  },
  // 左半屏画框，文案居右半屏（仅宽屏）
  {
    name: 'split-left',
    supportsMobile: false,
    frame: (vw, vh) => ({ width: Math.round(vw * SPLIT_RATIO), height: vh, left: 0, top: 0 }),
    heroWrapClass: 'items-center justify-end',
    heroBlockClass:
      'items-end text-right mt-[clamp(1.5rem,3vw,3rem)] max-w-[38vw] [&_.hero-title]:text-[clamp(1.5rem,2.4vw,2.75rem)]',
  },
  // 右半屏画框，文案居左半屏（仅宽屏）
  {
    name: 'split-right',
    supportsMobile: false,
    frame: (vw, vh) => {
      const w = Math.round(vw * SPLIT_RATIO);
      return { width: w, height: vh, left: vw - w, top: 0 };
    },
    heroWrapClass: 'items-center justify-start',
    heroBlockClass:
      'items-start text-left mt-[clamp(1.5rem,3vw,3rem)] max-w-[38vw] [&_.hero-title]:text-[clamp(1.5rem,2.4vw,2.75rem)]',
  },
];

/** localStorage 键：记录上一次随机选中的构图名，供下次刷新时排除，保证连续两次效果不同 */
const LAST_PRESET_KEY = 'flowfield:last-preset';

/**
 * 判断当前视口是否为窄屏（移动端 / 竖屏），此时排除左右分栏、下横带等宽屏专属构图
 */
function isNarrowScreen(vw: number, vh: number) {
  return vw < 640 || vw < vh;
}

/**
 * 读取 URL 中 `?layout=<预设名>` 指定的强制构图（用于预览 / 联调特定布局），无则返回 null
 */
function forcedPreset(): CompositionPreset | null {
  const name = new URLSearchParams(window.location.search).get('layout');
  return name ? (PRESETS.find((preset) => preset.name === name) ?? null) : null;
}

/**
 * 随机生成一个首页构图
 * @returns 选中的构图，含画框几何、主视觉区域与布局类，以及按视口重算的方法
 */
export function pickComposition(): SelectedComposition {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const pool = isNarrowScreen(vw, vh) ? PRESETS.filter((preset) => preset.supportsMobile) : PRESETS;

  let preset: CompositionPreset;
  const forced = forcedPreset();
  if (forced) {
    preset = forced;
  } else {
    // 随机选取：排除上一次的构图，保证连续两次刷新（含整页刷新）效果不同；
    // 排除后候选为空时（如构图池仅剩一个）回退到完整池，避免选不出。
    const lastName = localStorage.getItem(LAST_PRESET_KEY);
    const candidates = pool.filter((item) => item.name !== lastName);
    const finalPool = candidates.length > 0 ? candidates : pool;
    preset = finalPool[Math.floor(Math.random() * finalPool.length)];
    localStorage.setItem(LAST_PRESET_KEY, preset.name);
  }

  const recompute = (w: number, h: number): { frame: Frame; region: Box } => ({
    frame: preset.frame(w, h),
    region: safeRegion(w, h),
  });
  const { frame, region } = recompute(vw, vh);

  return {
    name: preset.name,
    frame,
    heroRegion: region,
    heroWrapClass: preset.heroWrapClass,
    heroBlockClass: preset.heroBlockClass,
    recompute,
  };
}
