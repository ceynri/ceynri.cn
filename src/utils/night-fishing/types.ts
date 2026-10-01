/**
 * 正弦分量：[振幅, 每个动画循环内的周期数（须为整数，保证无缝循环）, 初相（单位：圈，0~1）]
 */
export type Harmonic = readonly [amplitude: number, cycles: number, phase: number];

/**
 * 浮漂随海面起伏的运动参数（长度单位均为参考像素，即原作 1080p 画面中的像素）
 */
export interface FloatMotion {
  /** 上下起伏的单边振幅 */
  bobAmplitude: number;
  /** 每个动画循环内的起伏次数（整数） */
  bobCycles: number;
  /** 起伏初相（圈） */
  bobPhase: number;
  /** 起伏波形的尖锐度：0 为正弦；1 为弹跳曲线（最低点快速回弹、最高点圆润） */
  bobSharpness: number;
  /** 起伏振幅的相对调制，让每一次起伏高低不一 */
  bobModulation: readonly Harmonic[];
  /** 起伏基线的缓慢漂移 */
  drift: readonly Harmonic[];
  /** 左右摇摆 */
  sway: readonly Harmonic[];
  /** 浮漂相对水面的升沉幅度：浪底时被压入水中、浪顶时多露出一截 */
  heaveAmplitude: number;
  /** 基础倾角（度，正值为顶端偏左） */
  tiltBase: number;
  /** 倾角随起伏的摆动幅度（度） */
  tiltAmplitude: number;
}

/**
 * 浮漂轮廓：各层为若干闭合环，环内点按 [x0, y0, x1, y1, ...] 平铺（参考像素，x 向右、y 向上、水线处为 0）
 */
export interface FloatShape {
  /** 光晕平涂带的外缘 */
  halo: readonly (readonly number[])[];
  /** 红色剪影（发光头、细杆与浮体连成一体） */
  silhouette: readonly (readonly number[])[];
  /** 发光区（浮体的珊瑚色部分、发光头亮芯外的一圈） */
  lit: readonly (readonly number[])[];
  /** 奶油色亮芯（浮体与发光头各一处） */
  cream: readonly (readonly number[])[];
}

/**
 * 单支浮漂配置
 */
export interface FloatConfig {
  /** 名称，便于调试 */
  name: string;
  /** 倒影碎片的随机种子，不同浮漂取不同值以免倒影同步 */
  seed: number;
  /** 竿梢相对浮漂锚点的水平偏移（参考像素）：负值在左上方，咬钩时浮漂朝这一侧被提起 */
  rodOffset: number;
  /** 轮廓 */
  shape: FloatShape;
  /** 运动参数 */
  motion: FloatMotion;
}

/**
 * 浮漂在某一时刻相对锚点的姿态（参考像素 / 弧度）
 */
export interface FloatPose {
  /** 水平偏移（向右为正） */
  dx: number;
  /** 竖直偏移（屏幕坐标，向下为正） */
  dy: number;
  /** 浮漂相对水线的下沉量（向下为正） */
  sink: number;
  /** 倾角（弧度，逆时针即顶端偏左为正） */
  tilt: number;
}

/**
 * 浮漂锚点：浮漂水线中心的位置
 */
export interface FloatAnchor {
  x: number;
  y: number;
}

/**
 * 构图预设：按横竖屏分别给出浮漂锚点（视口宽高的比例）与缩放规则
 */
export interface LayoutPreset {
  /** 与 FLOATS 一一对应的锚点 */
  anchors: readonly FloatAnchor[];
  /** 由视口尺寸计算缩放（CSS 像素 / 参考像素） */
  scale: (vw: number, vh: number) => number;
}

/**
 * 当前视口下的场景布局（CSS 像素）
 */
export interface SceneLayout {
  /** CSS 像素 / 参考像素 */
  scale: number;
  /** 各浮漂水线中心的视口坐标 */
  anchors: FloatAnchor[];
}
