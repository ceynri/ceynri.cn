import { LOOP_SECONDS } from './config';
import type { FloatMotion, FloatPose, Harmonic } from './types';

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;

/** 取小数部分（负数同样落在 [0, 1)） */
function fract(value: number) {
  return value - Math.floor(value);
}

/** 按循环相位叠加一组正弦分量 */
function sumHarmonics(harmonics: readonly Harmonic[], theta: number) {
  let sum = 0;
  for (const [amplitude, cycles, phase] of harmonics) {
    sum += amplitude * Math.sin(cycles * theta + TAU * phase);
  }
  return sum;
}

/**
 * 单次起伏的波形，返回 [0, 1] 的高度
 * @param p 起伏相位 [0, 1)：0 为最低点（快速回弹的尖角），0.5 为最高点（圆润）
 * @param sharpness 0 为正弦，1 为弹跳曲线
 */
export function bobShape(p: number, sharpness: number) {
  const smooth = 0.5 - 0.5 * Math.cos(TAU * p);
  const bounce = Math.sin(Math.PI * p);
  return smooth + (bounce - smooth) * sharpness;
}

/**
 * 计算浮漂在 t 秒时的姿态
 * @param motion 运动参数
 * @param t 时间（秒），画面以 LOOP_SECONDS 为周期无缝循环
 */
export function getFloatPose(motion: FloatMotion, t: number): FloatPose {
  const theta = (TAU * t) / LOOP_SECONDS;
  const p = fract((motion.bobCycles * t) / LOOP_SECONDS + motion.bobPhase);

  const amplitude = motion.bobAmplitude * (1 + sumHarmonics(motion.bobModulation, theta));
  const lift = (bobShape(p, motion.bobSharpness) - 0.5) * 2 * amplitude;

  return {
    dx: sumHarmonics(motion.sway, theta),
    dy: sumHarmonics(motion.drift, theta) - lift,
    // 浪底（p=0）时被压入水中最深
    sink: motion.heaveAmplitude * Math.cos(TAU * p),
    tilt: (motion.tiltBase + motion.tiltAmplitude * Math.sin(TAU * p)) * DEG,
  };
}
