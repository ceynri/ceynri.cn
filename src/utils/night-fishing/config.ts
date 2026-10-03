import { FLOAT_SHAPE } from './float-shape';
import type { FloatConfig, LayoutPreset } from './types';

/**
 * 场景复刻自《Sonny Boy》第 5 话 12:35~12:44 的夜钓镜头。
 * 下列几何、配色与运动幅度均取自原片 1080p 逐帧测量，长度单位为「参考像素」（原画面中的像素）。
 */

/** 动画循环周期（秒）：所有周期分量都是它的整数次谐波，t 与 t + LOOP_SECONDS 的画面完全一致 */
export const LOOP_SECONDS = 24;

/** 作画帧率：原片为一拍二（12fps），设为 0 则按屏幕刷新率平滑绘制 */
export const STEP_FPS = 12;

/** 渲染分辨率上限（devicePixelRatio 上限） */
export const MAX_DPR = 2;

/**
 * 鼠标靠近时的轻微吸力。位移叠在原有浮沉之上，并且只在作画换帧时积分，
 * 不单独提高刷新率，避免把一拍二的质感抹平。
 */
export const POINTER_ATTRACT = {
  /** 超过这个距离（CSS 像素）不再产生吸力 */
  radius: 150,
  /** 鼠标贴在浮漂上时的最大位移（CSS 像素） */
  maxShift: 26,
  /** 弹簧刚度与阻尼，按 1/STEP_FPS 的步长调过，换帧时不会一下弹飞 */
  stiffness: 36,
  damping: 12,
};

/** 色块边缘的柔化宽度（参考像素）：按原片尺度柔化，高分屏上不会比原片更锐利 */
export const EDGE_SOFTNESS = 1.5;

/** 浮漂本体沿水面接触处渐隐的宽度（参考像素） */
export const WATERLINE_FEATHER = 14.0;

/** 调色板：原片为赛璐珞平涂 */
export const PALETTE = {
  /** 夜海底色 */
  sea: '#030911',
  /** 发光部位外圈的平涂光晕 */
  halo: '#380e15',
  /** 浮漂杆 */
  stick: '#eb1b1e',
  /** 浮漂杆右侧的暗色描线 */
  stickLine: '#1f0306',
  /** 顶端发光头的红色外圈 */
  tipRing: '#fa2c2e',
  /** 顶端发光头的亮芯 */
  tipCore: '#f6c4ae',
  /** 浮体的珊瑚色外圈 */
  coral: '#f35a49',
  /** 浮体的奶油色亮芯 */
  cream: '#fad6c3',
  /** 浮体身旁被照亮的水面 */
  glint: '#be2619',
  /** 浮体下缘贴着水面、被映深的珊瑚红 */
  contact: '#e1462f',
  /** 浮体倒影上半截 */
  reflectionNear: '#a01410',
  /** 浮体倒影下半截 */
  reflectionMid: '#701010',
  /** 细杆倒影碎片 */
  reflectionFar: '#581008',
  /** 绷紧时被照亮的钓鱼线 */
  line: '#8b878c',
  /** 提竿时溅起的水花 */
  splash: '#573b29',
} as const;

/**
 * 浮漂几何（原点位于水线处的浮漂中轴，y 轴向上）。浮漂本体的轮廓见 float-shape.ts，这里只有着色参数与关键尺寸。
 */
export const FLOAT_GEOMETRY = {
  /** 水上部分总高度（发光头顶端到水线），也是钓鱼线的挂点 */
  height: 240,
  /** 旋转与拖影拉伸的中心（浮体中部） */
  pivot: 65,
  /** 发光头一段的红色偏橙：在此高度区间内由杆色过渡到发光头色 */
  tipTint: { y0: 185, y1: 200 },
  /** 高于此处的亮芯用发光头亮芯色 */
  tipCoreFrom: 150,
  /** 细杆右侧暗色描线的高度区间与宽度 */
  stickLine: { y0: 108, y1: 200, width: 2 },
  /** 光晕平涂带外侧逐渐淡出的余晖长度 */
  haloTail: 11,
  /**
   * 浮体与水面交界处被照亮的一圈水面：环绕浮体下部、略偏右的扁椭圆，叠一个贴着右缘、时大时小的小瓣；
   * 大部分藏在浮体之下，露出左侧 2~4 的一道细边与右缘 2~17 厚的一条，偶尔从浮体底下露出一道（原片：最宽处约 60，比浮体宽约 12，中心偏右约 5）
   */
  glint: { x: 3, y: 27, rx: 33, ry: 13, lobe: { x: 25, y: 30, rx: 7, ry: 12 } },
} as const;

/** 浮漂轮廓距离场图集：覆盖范围（参考像素，含光晕余晖）、每参考像素的纹素数、距离编码范围 */
export const SHAPE_ATLAS = {
  bounds: { x0: -58, x1: 58, y0: -14, y1: 262 },
  texelsPerUnit: 2,
  spread: 16,
} as const;

/**
 * 倒影：只有露出水面的部分才有倒影。
 * 平静时浮漂上高度 y 的部位映到水线下深度 mirror(y)：浮体一段被压扁成一块实色倒影，细杆与发光头一段被拉长、碎成团块。
 * 浮漂下沉时，浮体倒影失去没入水中的一段并贴住水线，细杆碎片随之上移；倒影总长度按露出高度由 reach 决定。
 */
export const REFLECTION = {
  /** 平静时浮漂部位高度 → 倒影深度：[高度, 深度]（参考像素，高度从浮漂底端算起） */
  mirror: [
    [0, 0],
    [19, 2],
    [108, 50],
    [240, 500],
  ],
  /** 露出水面的高度 → 倒影总长度（原片：轻啄时露出约 144 长约 230，下沉时露出约 108 长约 130） */
  reach: [
    [0, 0],
    [108, 130],
    [240, 500],
  ],
  /** 水线以上（离开水面）的间隙在倒影中的压缩比例 */
  gapScale: 0.5,
  /**
   * 浮体倒影：自上而下 blobs 团圆润色块（平静时的深度范围 y、横向半径 rx、纵向半径 ry 均为首团 → 末团），
   * 各团左右错开 step；整串的长度每张作画在 stack 倍之间随机（时而收拢、时而拉长断开）；浮漂上高于 top 的部分（细杆）不再计入浮体倒影
   */
  block: { top: 108, blobs: 3, y: [16, 50], rx: [27, 21], ry: [14, 11], step: 6, stack: [0.85, 1.75] },
  /** 倾斜时倒影随部位高度横移的比例（原片中斜插入水时倒影仍大致聚在入水点下方） */
  lean: 0.3,
  /** 整片倒影随波纹左右摆动的幅度 */
  sway: 12,
  /**
   * 逐张重绘：原片倒影是 15 张作画一循环的手绘，相邻两张的重合度与任意两张相当，只有整体位置与疏密保持稳定。
   * 色块形状每张作画重新随机；横向错位每 hold 张换一组并在其间插值（相邻作画部分相关），同时以 drift（参考像素 / 张）缓缓下漂。
   * LOOP_SECONDS × 作画帧率须为 hold 的整数倍，循环才能无缝
   */
  boil: { hold: 1.5, drift: 2.5 },
  /**
   * 纵向连贯的横向错位：同一张作画里各深度的倒影沿一条平滑曲线左右错开，相邻碎片因此连成一串
   * （原片同帧内横向位置的相关长度约 20：相隔 16 相关 0.55、相隔 32 相关 0.4）。length 为曲线起伏的尺度，near / far 为近处 / 远处幅度
   */
  wave: { length: 22, near: 5, far: 22 },
  /** 碎片行距 */
  rowPitch: 20,
  /** 碎片起始深度（平静时） */
  fragmentStart: 56,
  /** 此深度之后碎片进一步稀疏 */
  fadeDepth: 250,
  /** 中段 / 远处碎片的稀疏度（0~1，越大越稀疏） */
  midSparsity: 0.25,
  farSparsity: 0.72,
  /** 近处 / 远处碎片各自独立的横向抖动幅度（叠加在纵向连贯的错位之上） */
  jitterNear: 4,
  jitterFar: 24,
  /** 近处 / 远处碎片的基准半宽 */
  halfWidthNear: 28,
  halfWidthFar: 34,
  /** 近处碎片的厚度倍数（原片浮体倒影下方的碎片是厚团块，常与浮体倒影连成一串；深处才是扁平的细条） */
  thickNear: 1.8,
  /** 碎片自身的最大倾斜（水平错位 / 竖直高度）；纵向错位曲线还会把碎片进一步扭斜 */
  slant: 0.9,
  /** 带错位小团、连成 Z 字形的碎片比例 */
  zigzag: 0.45,
  /** 水面受扰动时倒影被打碎：碎片抖动增幅、宽度缩减、稀疏度增量，浮体倒影宽度缩减与两侧起伏增幅 */
  agitation: { jitter: 0.6, shrink: 0.35, sparsity: 0.25, blockShrink: 0.3, wobble: 1.5 },
} as const;

/**
 * 落水涟漪：沿水线下一个扩张的扁椭圆排布的涂抹团块（原片落水后约 4 张作画可见）。
 * 下缘的团块宽而扁、连成一条断续的横带，入水一侧的一列连到水面，另一侧只剩零星小团；与浮体倒影相接处略亮。
 */
export const RIPPLE = {
  /** 持续时间（秒） */
  life: 0.45,
  /** 椭圆横向半径：起始 → 结束（参考像素） */
  radius: [95, 135],
  /** 纵横比 */
  aspect: 0.4,
  /** 团块数量 */
  daubs: 11,
  /** 团块沿切线 / 法线方向的半径：两侧 → 下缘 */
  side: [12, 8],
  bottom: [34, 14],
} as const;

/** 落水时浮体身旁被照亮的水面放大：持续时间（秒）、半径倍数与中心偏移（参考像素） */
export const GLINT_BOOST = { life: 0.4, scale: 1.6, offset: [14, 4] } as const;

/**
 * 水下发光：浮体刚没入水面时，它的光把细杆周围的一小片水面照亮，跨在水线上下。
 * 下沉比例在 range 区间内可见（相对浮漂水上高度），内外两层分别为亮红、暗红椭圆。
 */
export const UNDERWATER_GLOW = {
  range: [0.42, 0.55, 0.72, 0.92],
  center: [0, -6],
  outer: [30, 16],
  inner: [20, 9],
} as const;

/** 钓鱼线 */
export const LINE = {
  /** 线宽（参考像素） */
  width: 3.2,
  /** 竿梢在视口上沿之外的高度（参考像素） */
  rodHeight: 160,
} as const;

/** 提竿与落水时溅起的水花 */
export const SPLASH = {
  /** 水滴数量（着色器循环上限随之生成） */
  count: 24,
  /** 持续时间（秒） */
  life: 0.75,
  /** 重力加速度（参考像素 / 秒²） */
  gravity: 2600,
  /** 水平初速度范围（参考像素 / 秒） */
  spread: 1100,
  /** 竖直初速度范围 */
  speedMin: 200,
  speedMax: 1700,
  /** 水滴半径范围 */
  radiusMin: 4,
  radiusMax: 14,
} as const;

/** 画面质感 */
export const TEXTURE = {
  /** 胶片颗粒幅度（色阶，0~255） */
  grain: 2.8,
  /** 海面涌浪明暗带的幅度（色阶）；原片中几乎不可见，保留极弱的层次 */
  swell: 1.2,
  /** 涌浪带间距（参考像素） */
  swellSpacing: 250,
} as const;

/** 浮漂列表：右侧浮漂在原画面中位置更高；左侧浮漂相位领先约 0.3 秒，像同一道涌浪先后推过 */
export const FLOATS: readonly FloatConfig[] = [
  {
    name: 'right',
    seed: 1.7,
    rodOffset: 260,
    shape: FLOAT_SHAPE,
    motion: {
      bobAmplitude: 55,
      bobCycles: 8,
      bobPhase: 0,
      bobSharpness: 0.55,
      bobModulation: [
        [0.22, 1, 0.3],
        [0.12, 3, 0.7],
      ],
      drift: [
        [14, 1, 0.1],
        [6, 2, 0.6],
      ],
      sway: [
        [9, 3, 0],
        [4, 5, 0.35],
      ],
      heaveAmplitude: 10,
      tiltBase: 2.5,
      tiltAmplitude: 1,
    },
  },
  {
    name: 'left',
    seed: 4.3,
    rodOffset: -300,
    shape: FLOAT_SHAPE,
    motion: {
      bobAmplitude: 32,
      bobCycles: 8,
      bobPhase: 0.11,
      bobSharpness: 0.5,
      bobModulation: [
        [0.18, 1, 0.8],
        [0.1, 2, 0.2],
      ],
      drift: [
        [7, 1, 0.55],
        [5, 3, 0.15],
      ],
      sway: [
        [7, 2, 0.5],
        [4, 5, 0.1],
      ],
      heaveAmplitude: 10,
      tiltBase: 2.5,
      tiltAmplitude: 1.2,
    },
  },
];

/** 构图预设：横屏还原原片构图，竖屏把浮漂下移、给上方文案留出空间 */
export const LAYOUTS: Record<'landscape' | 'portrait', LayoutPreset> = {
  landscape: {
    anchors: [
      { x: 0.752, y: 0.437 },
      { x: 0.251, y: 0.607 },
    ],
    scale: (vw, vh) => Math.min(vh / 1080, vw / 1536),
  },
  portrait: {
    anchors: [
      { x: 0.76, y: 0.64 },
      { x: 0.24, y: 0.78 },
    ],
    scale: (vw, vh) => Math.min(vh / 1080, vw / 600),
  },
};
