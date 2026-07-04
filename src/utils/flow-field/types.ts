/**
 * 颜色模式类型
 */
export type ColorMode = 'normal' | 'grayscale' | 'linear-gradient' | 'radial-gradient' | 'splice';

/**
 * 方向类型
 */
export type Direction = 'auto' | 'horizontal' | 'vertical';

/**
 * 应用配置选项类型定义
 */
export interface AppOptions {
  /** 主要颜色1 */
  color1: string;
  /** 主要颜色2 */
  color2: string;
  /** 主要颜色3 */
  color3: string;
  /** 粒子寿命最大长度 */
  maxLife: number;
  /** 粒子数量 */
  nums: number;
  /** 粒子大小 */
  size: number;
  /** 噪声缩放比例 */
  noiseScale: number;
  /** 颜色模式 */
  colorMode: ColorMode;
  /** 渐变方向，仅对部分颜色模式有效 */
  direction: Direction;
}

/**
 * 配置选项范围类型定义
 */
export interface AppOptionsRange {
  maxLife: [number, number];
  nums: [number, number];
  size: [number, number];
  noiseScale: [number, number];
}

/**
 * 画框几何：背景动效实际渲染的矩形窗口
 */
export interface Frame {
  /** 画框宽度（px） */
  width: number;
  /** 画框高度（px） */
  height: number;
  /** 相对视口左上角的水平偏移（px） */
  left: number;
  /** 相对视口左上角的垂直偏移（px） */
  top: number;
}

/**
 * 矩形区域：以视口左上角为原点的定位盒
 */
export interface Box {
  /** 相对视口左上角的水平偏移（px） */
  left: number;
  /** 相对视口左上角的垂直偏移（px） */
  top: number;
  /** 宽度（px） */
  width: number;
  /** 高度（px） */
  height: number;
}

/**
 * 首页构图预设：一组搭配好的「背景画框 + 文案落点」。
 * 文案统一落在安全区（避让四角 chrome），仅通过对齐方式决定锚定在安全区的哪个边 / 角。
 */
export interface CompositionPreset {
  /** 预设名，用于调试与埋点 */
  name: string;
  /** 是否适用于窄屏（移动端 / 竖屏） */
  supportsMobile: boolean;
  /** 由视口尺寸计算背景画框几何 */
  frame: (vw: number, vh: number) => Frame;
  /** 主视觉外层定位类：在安全区内摆放整个文案块（决定锚定边 / 角） */
  heroWrapClass: string;
  /** 主视觉内层对齐类：块内标题 / 副标题 / 导航的对齐与尺寸 */
  heroBlockClass: string;
}

/**
 * 首页构图广播消息：背景脚本经 window 事件 / `__flowFieldComposition` 传给主视觉的排版信息，
 * 是 SelectedComposition 中与主视觉排版相关的子集（不含画框几何与 recompute）。
 * 作为跨脚本边界（sketch 生产 / index 消费 / window 全局声明）的唯一类型来源。
 */
export interface HomeComposition {
  /** 预设名 */
  name: string;
  /** 当前视口下的主视觉区域 */
  heroRegion: Box;
  /** 主视觉外层定位类 */
  heroWrapClass: string;
  /** 主视觉内层对齐类 */
  heroBlockClass: string;
}

/**
 * 一次随机选中的首页构图：在广播消息基础上附加画框几何与按视口重算的方法
 */
export interface SelectedComposition extends HomeComposition {
  /** 当前视口下的画框几何 */
  frame: Frame;
  /** 按新的视口尺寸重新计算画框与主视觉区域（用于窗口 resize） */
  recompute: (vw: number, vh: number) => { frame: Frame; region: Box };
}
