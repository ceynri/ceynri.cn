import { BITE_DURATION, type BiteFrame, getBiteFrame } from './bite';
import { FLOAT_GEOMETRY, FLOATS, LINE, LOOP_SECONDS, MAX_DPR, STEP_FPS } from './config';
import { computeLayout } from './layout';
import { getFloatPose } from './motion';
import { NightFishingRenderer } from './renderer';
import { buildShapeAtlas } from './shape-atlas';
import type { FloatAnchor, FloatConfig } from './types';

export interface NightFishingOptions {
  /** 固定在某一时刻（秒）静止渲染，便于截图与调参 */
  frozenTime?: number;
  /** 配合 frozenTime，把指定浮漂定格在咬钩动画的某一时刻（秒） */
  frozenBite?: { index: number; tau: number };
  /** 首帧绘制完成的回调 */
  onReady?: () => void;
}

export interface NightFishingController {
  /**
   * 命中测试
   * @param x 视口坐标（CSS 像素）
   * @param y 视口坐标（CSS 像素）
   * @returns 命中的浮漂序号，未命中返回 -1
   */
  hitTest: (x: number, y: number) => number;
  /** 触发指定浮漂的咬钩动画 */
  bite: (index: number) => void;
  /** 暂停渲染循环（主题切走、页面隐藏时避免空跑） */
  pause: () => void;
  /** 恢复渲染循环 */
  resume: () => void;
  /** 停止动画并释放监听 */
  destroy: () => void;
}

/** 命中框：以浮漂水线中心为基准的矩形（CSS 像素） */
interface HitBox {
  x: number;
  top: number;
  bottom: number;
  halfWidth: number;
}

/** 单支浮漂在某一时刻的几何状态（CSS 像素） */
interface FloatFrame {
  /** 随海面漂动、但不含咬钩位移的水线中心 x（钓鱼线坐标以此为基准） */
  baseX: number;
  /** 浮漂水线处原点的 x */
  originX: number;
  /** 水线 y */
  waterY: number;
  /** 下沉量（参考像素） */
  sink: number;
  /** 倾角（弧度） */
  tilt: number;
  /** 轴向拉伸 */
  stretch: number;
  /** 旋转中心 */
  pivotX: number;
  pivotY: number;
  /** 发光头顶端 */
  tipX: number;
  tipY: number;
  /** 咬钩动画状态，未在咬钩时为 null */
  bite: BiteFrame | null;
}

const DEG = Math.PI / 180;
/** 关闭倒影时传给着色器的下沉量 */
const NO_REFLECTION = 1e4;

/**
 * 叠加海面起伏与咬钩动画，求浮漂的几何状态
 * @param loopTime 循环内的时间（秒）
 * @param tau 距咬钩触发的时间（秒），不在咬钩时传负数
 */
function computeFloatFrame(
  config: FloatConfig,
  anchor: FloatAnchor,
  scale: number,
  loopTime: number,
  tau: number,
): FloatFrame {
  const { height, pivot } = FLOAT_GEOMETRY;
  const pose = getFloatPose(config.motion, loopTime);
  const bite = tau >= 0 && tau < BITE_DURATION ? getBiteFrame(tau, config.rodOffset > 0) : null;

  const sink = pose.sink + (bite ? bite.sink * height : 0);
  const tilt = pose.tilt + (bite ? bite.tilt * DEG : 0);
  const stretch = bite?.stretch ?? 1;
  const baseX = anchor.x + pose.dx * scale;
  const originX = baseX + (bite?.dx ?? 0) * scale;
  const waterY = anchor.y + (pose.dy + (bite?.drop ?? 0)) * scale;
  const originY = waterY + sink * scale;

  const sin = Math.sin(tilt);
  const cos = Math.cos(tilt);
  const pivotX = originX - sin * pivot * scale;
  const pivotY = originY - cos * pivot * scale;
  const reach = (height - pivot) * stretch * scale;
  return {
    baseX,
    originX,
    waterY,
    sink,
    tilt,
    stretch,
    pivotX,
    pivotY,
    tipX: pivotX - sin * reach,
    tipY: pivotY - cos * reach,
    bite,
  };
}

/**
 * 在 canvas 上初始化夜钓背景
 * @returns 设备不支持 WebGL 时返回 null，此时 canvas 保持空白（由外层底色兜底）
 */
export function initNightFishing(
  canvas: HTMLCanvasElement,
  options: NightFishingOptions = {},
): NightFishingController | null {
  const atlas = buildShapeAtlas(FLOATS.map((config) => config.shape));
  let renderer = NightFishingRenderer.create(canvas, atlas);
  if (!renderer) {
    return null;
  }

  const { frozenTime, frozenBite, onReady } = options;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const uniforms = {
    pose: new Float32Array(FLOATS.length * 4),
    water: new Float32Array(FLOATS.length * 4),
    event: new Float32Array(4),
    trail: new Float32Array(4),
    lineA: new Float32Array(4),
    lineB: new Float32Array(4),
    lineC: new Float32Array(4),
    ripple: new Float32Array(4),
    air: new Float32Array(4),
  };
  const hitBoxes: HitBox[] = FLOATS.map(() => ({ x: 0, top: 0, bottom: 0, halfWidth: 0 }));
  // 同一时刻只有一支浮漂在咬钩
  let activeBite: { index: number; startedAt: number } | null =
    frozenTime !== undefined && frozenBite && FLOATS[frozenBite.index]
      ? { index: frozenBite.index, startedAt: frozenTime - frozenBite.tau }
      : null;
  // 随机起始相位，每次打开看到的画面略有不同
  const clockOffset = Math.random() * LOOP_SECONDS;
  const startedAt = performance.now();

  let layout = computeLayout(canvas.clientWidth, canvas.clientHeight);
  let dpr = 1;
  let lastStep = Number.NaN;
  let rafId = 0;
  let ready = false;

  const isStatic = () => frozenTime !== undefined || reducedMotion.matches;
  const now = () => frozenTime ?? (performance.now() - startedAt) / 1000 + clockOffset;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    renderer?.resize(Math.round(width * dpr), Math.round(height * dpr));
    layout = computeLayout(width, height);
    lastStep = Number.NaN;
  };

  /** 写入第 i 支浮漂的 uniform 数据，咬钩中的浮漂同时写入事件槽 */
  const updateFloat = (i: number, time: number, loopTime: number) => {
    const config = FLOATS[i];
    const anchor = layout.anchors[i];
    const { scale } = layout;
    const tau = activeBite?.index === i ? time - activeBite.startedAt : -1;
    const frame = computeFloatFrame(config, anchor, scale, loopTime, tau);
    const { bite } = frame;
    const offset = i * 4;

    uniforms.pose.set([frame.pivotX * dpr, frame.pivotY * dpr, scale * dpr, frame.tilt], offset);
    // 离开水面期间没有倒影：把下沉量置为极大值，让整支浮漂都落在倒影范围之外
    const sink = (bite?.reflection ?? 1) > 0.5 ? frame.sink : NO_REFLECTION;
    uniforms.water.set([frame.originX * dpr, frame.waterY * dpr, sink, config.seed], offset);

    hitBoxes[i] = {
      x: frame.originX,
      top: frame.waterY + (frame.sink - FLOAT_GEOMETRY.height - 30) * scale,
      bottom: frame.waterY + 20 * scale,
      halfWidth: Math.max(50 * scale, 24),
    };

    if (!bite) {
      return;
    }

    // 速度线：从浮体朝远离发光头的方向拉出
    const tipDx = frame.tipX - frame.pivotX;
    const tipDy = frame.tipY - frame.pivotY;
    const tipLength = Math.hypot(tipDx, tipDy) || 1;
    const trailLength = bite.trail * scale;
    const trailX = frame.pivotX - (tipDx / tipLength) * trailLength;
    const trailY = frame.pivotY - (tipDy / tipLength) * trailLength;
    const trail = bite.trail > 1 ? 1 : 0;
    let splashAge = -1;
    let splashX = 0;
    let splashY = 0;
    if (bite.splashAt !== null) {
      splashAge = tau - bite.splashAt;
      const origin = computeFloatFrame(config, anchor, scale, loopTime - splashAge, bite.splashAt);
      splashX = origin.originX;
      splashY = origin.waterY;
    }
    uniforms.event.set([i, frame.stretch, trail, splashAge]);
    uniforms.trail.set([trailX * dpr, trailY * dpr, splashX * dpr, splashY * dpr]);

    if (bite.rippleAt !== null) {
      const age = tau - bite.rippleAt;
      // 圆心横向停在落水处，纵向随水面一同起伏
      const origin = computeFloatFrame(config, anchor, scale, loopTime - age, bite.rippleAt);
      uniforms.ripple.set([origin.originX * dpr, frame.waterY * dpr, age, bite.agitation]);
    } else {
      uniforms.ripple.set([0, 0, -1, bite.agitation]);
    }

    // 空中倒影：落在水线中心附近
    uniforms.air.set([frame.baseX * dpr, frame.waterY * dpr, bite.air, bite.airSpread]);

    const { line } = bite;
    if (!line) {
      uniforms.lineC.set([0, 0, 0, 0]);
      return;
    }
    // 竿梢在视口上沿之外；其余坐标相对浮漂锚点（参考像素，y 向上）
    const toScreen = ([x, y]: readonly [number, number]) => [
      (frame.baseX + x * scale) * dpr,
      (frame.waterY - y * scale) * dpr,
    ];
    const end =
      line.end === 'tip'
        ? [frame.tipX * dpr, frame.tipY * dpr]
        : line.end === 'trail'
          ? [trailX * dpr, trailY * dpr]
          : toScreen(line.end);
    const tail = line.tail ? toScreen(line.tail) : end;
    uniforms.lineA.set([(frame.baseX + line.rodX * scale) * dpr, -LINE.rodHeight * scale * dpr, end[0], end[1]]);
    uniforms.lineB.set([tail[0], tail[1], line.bow, line.tailBow ?? 0]);
    uniforms.lineC.set([line.alpha, line.gap?.[0] ?? 2, line.gap?.[1] ?? 2, line.tail ? 1 : 0]);
  };

  /** 绘制时钟 clock（秒）对应的画面；与上一张作画相同时跳过 */
  const renderAt = (clock: number) => {
    if (!renderer) {
      return;
    }
    const step = STEP_FPS > 0 ? Math.floor(clock * STEP_FPS) : clock;
    if (step === lastStep) {
      return;
    }
    lastStep = step;

    const time = STEP_FPS > 0 ? step / STEP_FPS : clock;
    const loopTime = time % LOOP_SECONDS;
    if (activeBite && time - activeBite.startedAt >= BITE_DURATION && frozenTime === undefined) {
      activeBite = null;
    }
    uniforms.event.set([-1, 1, 0, -1]);
    uniforms.lineC.set([0, 0, 0, 0]);
    uniforms.ripple.set([0, 0, -1, 0]);
    uniforms.air.set([0, 0, 0, 0]);
    for (let i = 0; i < FLOATS.length; i++) {
      updateFloat(i, time, loopTime);
    }

    renderer.render({
      time: loopTime,
      grainSeed: Math.floor(time * (STEP_FPS || 60)) % (LOOP_SECONDS * (STEP_FPS || 60)),
      scale: layout.scale * dpr,
      ...uniforms,
    });

    if (!ready) {
      ready = true;
      onReady?.();
    }
  };

  const tick = () => {
    rafId = requestAnimationFrame(tick);
    renderAt(now());
  };

  const start = () => {
    cancelAnimationFrame(rafId);
    lastStep = Number.NaN;
    if (isStatic()) {
      renderAt(now());
    } else {
      tick();
    }
  };

  const resizeObserver = new ResizeObserver(() => {
    resize();
    renderAt(now());
  });

  const onContextLost = (event: Event) => {
    event.preventDefault();
    cancelAnimationFrame(rafId);
    renderer = null;
  };
  const onContextRestored = () => {
    renderer = NightFishingRenderer.create(canvas, atlas);
    resize();
    start();
  };

  resize();
  resizeObserver.observe(canvas);
  reducedMotion.addEventListener('change', start);
  canvas.addEventListener('webglcontextlost', onContextLost);
  canvas.addEventListener('webglcontextrestored', onContextRestored);
  start();

  return {
    hitTest(x, y) {
      return hitBoxes.findIndex((box) => Math.abs(x - box.x) <= box.halfWidth && y >= box.top && y <= box.bottom);
    },
    bite(index) {
      if (isStatic() || !FLOATS[index] || activeBite) {
        return;
      }
      const time = now();
      activeBite = { index, startedAt: STEP_FPS > 0 ? Math.floor(time * STEP_FPS) / STEP_FPS : time };
    },
    pause() {
      cancelAnimationFrame(rafId);
    },
    resume() {
      start();
    },
    destroy() {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      reducedMotion.removeEventListener('change', start);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
    },
  };
}
