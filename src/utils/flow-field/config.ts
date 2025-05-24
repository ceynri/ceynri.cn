import type { AppOptionsRange, ColorMode } from './types';

/**
 * 背景颜色
 */
export const BG_COLOR = '#000000';

/**
 * 颜色模式选项
 */
export const COLOR_MODES: ColorMode[] = ['normal', 'grayscale', 'linear-gradient', 'radial-gradient', 'splice'];

/**
 * 小屏设备配置选项范围
 */
export const rangeForSm: AppOptionsRange = {
  maxLife: [6, 12],
  nums: [200, 400],
  size: [1.5, 2.5],
  noiseScale: [300, 1200],
};

/**
 * 大屏设备配置选项范围
 */
export const rangeForLg: AppOptionsRange = {
  maxLife: [15, 25],
  nums: [400, 800],
  size: [2, 3.5],
  noiseScale: [400, 2000],
};

/**
 * 超大屏设备配置选项范围
 */
export const rangeFor2xl: AppOptionsRange = {
  maxLife: [20, 30],
  nums: [600, 1000],
  size: [2.5, 4],
  noiseScale: [600, 2500],
};

/**
 * 粒子生成与消亡边界偏移量
 */
export const BOUNDARY_OFFSET = 80;

/**
 * 粒子淡入淡出分别占整个生命周期的比例
 */
export const FADE_LIFE_RATIO = 1 / 5;

/**
 * 迭代次数范围
 */
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
