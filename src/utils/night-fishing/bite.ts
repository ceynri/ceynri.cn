type Easing = (x: number) => number;

/** 关键帧：[作画张数（每张 1/12 秒）, 数值, 从上一帧过渡到本帧的缓动（缺省为线性）] */
type Keyframe = readonly [drawing: number, value: number, easing?: Easing];

const easeInOut: Easing = (x) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2);

/** 原片一拍二，每张作画 1/12 秒 */
const DRAWING = 1 / 12;

/**
 * 咬钩动画，逐张对应原片 12:38 起左侧浮漂的作画（第 n 张 ≈ 原片 12fps 序列第 36+n 张）：
 * 两次轻啄 → 上跳 → 被拖入水中 → 钓鱼线绷紧 → 提竿出水（按住两张的拖影）→ 翻转飞出画面
 * → 抛竿落回、斜插入水 → 向另一侧摆过头 → 回正。
 * 横移与倾角按「竿梢在左上方」编排，竿梢在右侧时镜像。
 */
const TRACKS = {
  /** 下沉量（相对浮漂水上高度的比例；>1 完全没入，负值为离开水面） */
  sink: [
    [0, 0],
    [1, 0.4],
    [2, 0.1],
    [3, 0.26],
    [4, 0.05],
    [5, -0.14],
    [6, 0.55],
    [7, 0.85],
    [8, 0.85],
    [9, 1.35],
    [14, 1.35],
    [15, -1.68],
    [16, -1.68],
    [17, -2.68],
    [18, -7],
    [36, -7],
    [37, -3.04],
    [38, -1.62],
    [39, 0],
    [40, 0.05],
    [41, 0.25],
    [42, 0.15],
    [43, 0.07],
    [44, 0],
    [47, -0.03, easeInOut],
    [52, 0, easeInOut],
  ],
  /** 横向位移（参考像素） */
  dx: [
    [0, 0],
    [5, 0],
    [6, -6],
    [9, -14],
    [14, -18],
    [15, -66],
    [16, -66],
    [17, -255],
    [18, -380],
    [36, -380],
    [37, -235],
    [38, -77],
    [39, -60],
    [40, -57],
    [41, -60],
    [42, -41],
    [43, -20],
    [44, -2],
    [45, 3],
    [46, 7],
    [47, 12],
    [48, 16],
    [49, 18],
    [50, 21],
    [51, 25],
    [56, 0, easeInOut],
  ],
  /** 附加倾角（度，正值为顶端偏左）：提竿时浮漂倒着被拽出水面（浮体在上、发光头拖在下方），翻转飞走；落回时从倒立被线拉成斜插，再向另一侧摆过头 */
  tilt: [
    [0, 0],
    [14, 0],
    [15, 194],
    [16, 194],
    [17, 238],
    [18, 238],
    [36, 135],
    [37, 45],
    [38, -32],
    [39, 45],
    [40, 16],
    [41, 8],
    [42, 0],
    [43, -10],
    [44, -17],
    [45, -14.5],
    [46, -11],
    [47, -9],
    [48, -5.7],
    [49, -4.5],
    [50, -1.7],
    [51, 0],
    [56, 0],
  ],
  /** 沿浮漂轴向的拉伸：上跳、出水、落水时的拖影 */
  stretch: [
    [0, 1],
    [4, 1],
    [5, 1.3],
    [6, 1],
    [14, 1],
    [15, 1.55],
    [16, 1.55],
    [17, 1.5],
    [18, 1],
    [36, 1],
    [37, 1.5],
    [38, 1],
    [39, 1],
  ],
  /**
   * 水面整体下移（参考像素）：抛竿落在比原位低一截的水面上，随后水面先被压下、再回弹，
   * 浮漂与其倒影、涟漪一同移动（由原片落水后各帧倒影起点推算水线）
   */
  drop: [
    [0, 0],
    [36, 0],
    [37, 85],
    [39, 85],
    [40, 115],
    [41, 105],
    [42, 65],
    [43, 28],
    [44, 30],
    [45, 24],
    [46, 15],
    [48, 5],
    [52, 0, easeInOut],
  ],
  /** 速度线长度（参考像素）：从浮体朝远离发光头的方向拉出 */
  trail: [
    [0, 0],
    [4, 0],
    [5, 60],
    [6, 0],
    [14, 0],
    [15, 320],
    [16, 320],
    [17, 220],
    [18, 0],
    [36, 0],
    [37, 200],
    [38, 230],
    [39, 0],
  ],
  /** 空中倒影的强度：提竿出水与抛竿落回途中，空中的浮漂映在水面上（原片提竿时没画，这里补上） */
  air: [
    [0, 0],
    [14, 0],
    [15, 1],
    [16, 1],
    [17, 0.7],
    [18, 0],
    [36, 0],
    [37, 1],
    [38, 1],
    [39, 0],
  ],
  /** 空中倒影的散开程度：0 为一串竖长的团块，1 为散开的一簇 */
  airSpread: [
    [0, 0],
    [16, 0],
    [17, 1],
    [36, 1],
    [37, 0],
    [38, 1],
  ],
  /** 是否有倒影：离开水面期间没有 */
  reflection: [
    [0, 1],
    [14, 1],
    [15, 0],
    [38, 0],
    [39, 1],
  ],
} as const satisfies Record<string, readonly Keyframe[]>;

/**
 * 钓鱼线逐张作画的形态（按住不补间，与原片一样整条弹出、甩动、断开消失）。
 * 坐标为相对浮漂锚点的参考像素（y 向上）；bow 为相对弦长的弯曲，正值向下行方向的右侧鼓出。
 */
export interface LinePose {
  /** 不透明度 */
  alpha: number;
  /** 竿梢的水平偏移（竿梢在视口上沿之外） */
  rodX: number;
  /** 上段终点：连到发光头、速度线末端（浮漂底端拖出的那头），或停在某个入水点 */
  end: 'tip' | 'trail' | readonly [x: number, y: number];
  /** 上段弯曲 */
  bow: number;
  /** 被一并带出水面的下段终点 */
  tail?: readonly [x: number, y: number];
  /** 下段弯曲 */
  tailBow?: number;
  /** 上段断开的曲线参数区间（0 为竿梢，1 为终点），只留两端 */
  gap?: readonly [from: number, to: number];
}

const LINE_POSES: readonly (readonly [drawing: number, pose: LinePose | null])[] = [
  // 沉底时看不到线；提竿前一张突然绷紧，从画面上方斜插入水
  [14, { alpha: 1, rodX: 210, end: [229, 390], bow: 0.13 }],
  // 提竿：浮漂左侧一条贯穿画面的直线（原片按住两张）
  [15, { alpha: 1, rodX: -165, end: [-274, -400], bow: 0 }],
  // 浮漂飞出画面，线向左甩开
  [17, { alpha: 1, rodX: -400, end: [-342, -400], bow: 0.08 }],
  [18, null],
  // 抛竿：一道长弧从画面上方扫向左下
  [37, { alpha: 1, rodX: 55, end: [-465, -160], bow: 0.21 }],
  // 浮漂在空中，线连着速度线末端（浮漂底端），继续垂入水中
  [38, { alpha: 1, rodX: -235, end: 'trail', bow: -0.2, tail: [-43, -80], tailBow: 0 }],
  // 落水后线松弛：先从中间断开，只剩发光头附近一小段，随后消失
  [39, { alpha: 1, rodX: -350, end: 'tip', bow: 0, gap: [0.42, 0.9] }],
  [40, { alpha: 0.45, rodX: -350, end: 'tip', bow: 0, gap: [0, 0.88] }],
  [41, null],
];

/** 水花起始的作画张数：只有出水时溅起（原片落水时没有水花） */
const SPLASH_DRAWINGS = [15] as const;

/** 水花在出水那一张里已经飞散开的时长（秒） */
const SPLASH_LEAD = 0.15;

/** 落水涟漪起始的作画张数 */
const RIPPLE_DRAWING = 39;

/** 扰动水面的冲击：[作画张数, 强度]，倒影碎片随之加剧抖动后平复 */
const IMPULSES = [
  [1, 0.7],
  [3, 0.5],
  [5, 0.4],
  [6, 0.8],
  [39, 1],
] as const;

/** 冲击后扰动衰减的时间常数（秒） */
const AGITATION_DECAY = 0.35;

/** 咬钩动画总时长（秒） */
export const BITE_DURATION = 56 * DRAWING;

/** 咬钩动画在某一时刻的状态 */
export interface BiteFrame {
  /** 下沉比例（相对浮漂水上高度） */
  sink: number;
  /** 横向位移（参考像素） */
  dx: number;
  /** 附加倾角（度） */
  tilt: number;
  /** 轴向拉伸 */
  stretch: number;
  /** 速度线长度（参考像素） */
  trail: number;
  /** 空中倒影强度 */
  air: number;
  /** 空中倒影散开程度 */
  airSpread: number;
  /** 水面整体下移（参考像素） */
  drop: number;
  /** 是否有倒影（0 / 1） */
  reflection: number;
  /** 钓鱼线形态，未露出时为 null（已按竿梢方向镜像） */
  line: LinePose | null;
  /** 最近一次水花的起始时刻（秒），尚未溅起时为 null */
  splashAt: number | null;
  /** 落水涟漪的起始时刻（秒），尚未落水时为 null */
  rippleAt: number | null;
  /** 水面扰动强度（0~1） */
  agitation: number;
}

function sample(keyframes: readonly Keyframe[], tau: number) {
  const drawing = tau / DRAWING;
  if (drawing <= keyframes[0][0]) {
    return keyframes[0][1];
  }
  for (let i = 1; i < keyframes.length; i++) {
    const [at, value, easing] = keyframes[i];
    if (drawing <= at) {
      const [prevAt, prevValue] = keyframes[i - 1];
      const progress = (drawing - prevAt) / (at - prevAt);
      return prevValue + (value - prevValue) * (easing ?? ((x: number) => x))(progress);
    }
  }
  return keyframes[keyframes.length - 1][1];
}

/** 当前作画张对应的钓鱼线形态 */
function currentLine(tau: number) {
  const drawing = Math.floor(tau / DRAWING + 1e-6);
  let pose: LinePose | null = null;
  for (const [at, value] of LINE_POSES) {
    if (at > drawing) {
      break;
    }
    pose = value;
  }
  return pose;
}

function mirrorLine(pose: LinePose | null, side: number): LinePose | null {
  if (!pose || side === 1) {
    return pose;
  }
  return {
    ...pose,
    rodX: -pose.rodX,
    end: typeof pose.end === 'string' ? pose.end : [-pose.end[0], pose.end[1]],
    bow: -pose.bow,
    tail: pose.tail && [-pose.tail[0], pose.tail[1]],
    tailBow: pose.tailBow === undefined ? undefined : -pose.tailBow,
  };
}

/**
 * 咬钩动画在触发后 tau 秒时的状态
 * @param tau 距触发的时间（秒）
 * @param mirror 竿梢在右侧时传 true，横移、倾角与钓鱼线左右镜像
 */
export function getBiteFrame(tau: number, mirror = false): BiteFrame {
  const side = mirror ? -1 : 1;
  const started = SPLASH_DRAWINGS.filter((drawing) => drawing * DRAWING <= tau);
  let agitation = 0;
  for (const [drawing, strength] of IMPULSES) {
    const since = tau - drawing * DRAWING;
    if (since >= 0) {
      agitation = Math.max(agitation, strength * Math.exp(-since / AGITATION_DECAY));
    }
  }
  return {
    sink: sample(TRACKS.sink, tau),
    dx: sample(TRACKS.dx, tau) * side,
    tilt: sample(TRACKS.tilt, tau) * side,
    stretch: sample(TRACKS.stretch, tau),
    trail: sample(TRACKS.trail, tau),
    air: sample(TRACKS.air, tau),
    airSpread: sample(TRACKS.airSpread, tau),
    drop: sample(TRACKS.drop, tau),
    reflection: sample(TRACKS.reflection, tau),
    line: mirrorLine(currentLine(tau), side),
    splashAt: started.length ? started[started.length - 1] * DRAWING - SPLASH_LEAD : null,
    rippleAt: tau >= RIPPLE_DRAWING * DRAWING ? RIPPLE_DRAWING * DRAWING : null,
    agitation,
  };
}
