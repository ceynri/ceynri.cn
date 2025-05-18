/**
 * 颜色模式类型
 */
export type ColorMode = 'normal' | 'linear-gradient' | 'radial-gradient' | 'splice';

/**
 * 方向类型
 */
export type Direction = 'auto' | 'horizontal' | 'vertical';

/**
 * 应用配置选项接口
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
