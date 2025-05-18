import type { AppOptions } from './types';

/**
 * 背景颜色
 */
export const BG_COLOR = '#000000';

/**
 * 默认配置选项
 */
export const defaultOptions = {
  color1: '#d9e0e8',
  color2: '#808890',
  color3: '#24292e',
  maxLife: 15,
  nums: 600,
  size: 2,
  noiseScale: 1500,
  colorMode: 'normal',
  direction: 'auto',
} as const satisfies AppOptions;

export const range = {
  maxLife: [10, 30],
  nums: [400, 1200],
  size: [1.5, 4],
  noiseScale: [200, 3000],
  colorMode: ['normal', 'linear-gradient', 'radial-gradient', 'splice'],
} as const satisfies Partial<Record<keyof AppOptions, AppOptions[keyof AppOptions][]>>;

/**
 * 粒子生成与消亡边界偏移量
 */
export const BOUNDARY_OFFSET = 80;

/**
 * 粒子淡入淡出分别占整个生命周期的比例
 */
export const FADE_LIFE_RATIO = 1 / 5;

export const ITERATIONS_RANGE = [1, 4] as const;

/**
 * 粒子速度
 */
export const SPEED = 0.2;

/**
 * 粒子痕迹淡化配置
 */
export const diluteConfig = {
  /** 每 10 帧绘制一次 */
  perFrame: 10,
  /** 透明度比例 2% */
  ratio: 0.02,
} as const;
