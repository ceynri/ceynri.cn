import type { Color } from 'p5';
import type P5 from 'p5';

import type { AppOptions, Direction } from './types';

/**
 * 颜色管理器类
 * 处理粒子颜色的生成和管理
 */
export class Palette {
  private p5: P5;
  private options: AppOptions;
  private direction: Direction;

  // 缓存的颜色对象，避免重复创建
  private color1: Color;
  private color2: Color;
  private color3: Color;

  private grayColors: {
    color1: Color;
    color2: Color;
    color3: Color;
  };

  private invertedColors: {
    color1: Color;
    color2: Color;
    color3: Color;
  };

  /**
   * 创建一个新的颜色管理器
   * @param p5 p5实例
   * @param options 配置选项
   */
  constructor(p5: P5, options: AppOptions) {
    this.p5 = p5;
    this.options = options;
    this.direction = this.initDirection();

    // 缓存颜色对象
    this.color1 = this.p5.color(this.options.color1);
    this.color2 = this.p5.color(this.options.color2);
    this.color3 = this.p5.color(this.options.color3);

    // 缓存灰度颜色
    this.grayColors = {
      color1: this.p5.color(this.getGrayscaleValue(this.color1)),
      color2: this.p5.color(this.getGrayscaleValue(this.color2)),
      color3: this.p5.color(this.getGrayscaleValue(this.color3)),
    };

    // 缓存反色
    this.invertedColors = {
      color1: this.p5.color(255 - this.p5.red(this.color1), 255 - this.p5.green(this.color1), 255 - this.p5.blue(this.color1)),
      color2: this.p5.color(255 - this.p5.red(this.color2), 255 - this.p5.green(this.color2), 255 - this.p5.blue(this.color2)),
      color3: this.p5.color(255 - this.p5.red(this.color3), 255 - this.p5.green(this.color3), 255 - this.p5.blue(this.color3)),
    };
  }

  /**
   * 获取粒子颜色
   * @param particleIndex 粒子索引
   * @param xPos 粒子X坐标
   * @param yPos 粒子Y坐标
   * @returns 颜色值
   */
  public getParticleColor(particleIndex: number, xPos: number, yPos: number): Color {
    switch (this.options.colorMode) {
      case 'normal':
        return this.getNormalColor(particleIndex);

      case 'grayscale':
        return this.getGrayscaleColor(particleIndex);

      case 'linear-gradient':
        return this.getLinearGradientColor(xPos, yPos);

      case 'radial-gradient':
        return this.getRadialGradientColor(xPos, yPos);

      case 'splice':
        return this.getSpliceColor(xPos, yPos, particleIndex);

      default:
        return this.p5.color(128);
    }
  }

  /**
   * 初始化方向
   * @returns 计算得到的实际方向
   */
  private initDirection(): Direction {
    // 如果指定了方向且不是auto，则使用指定的方向
    if (this.options.direction !== 'auto') {
      return this.options.direction;
    }

    // 自动判断方向：宽度大于高度为横屏，否则为竖屏
    return this.p5.width >= this.p5.height ? 'horizontal' : 'vertical';
  }

  /**
   * 根据粒子索引获取普通颜色
   * @param particleIndex 粒子索引
   * @returns 颜色值
   */
  private getNormalColor(particleIndex: number): Color {
    if (particleIndex % 3 === 0) {
      return this.color1;
    }
    if (particleIndex % 3 === 1) {
      return this.color2;
    }
    return this.color3;
  }

  /**
   * 根据粒子索引获取灰度颜色
   * @param particleIndex 粒子索引
   * @returns 灰度颜色值
   */
  private getGrayscaleColor(particleIndex: number): Color {
    if (particleIndex % 3 === 0) {
      return this.grayColors.color1;
    }
    if (particleIndex % 3 === 1) {
      return this.grayColors.color2;
    }
    return this.grayColors.color3;
  }

  /**
   * 计算颜色的灰度值
   * @param color 颜色对象
   * @returns 灰度值（0-255）
   */
  private getGrayscaleValue(color: Color): number {
    const r = this.p5.red(color);
    const g = this.p5.green(color);
    const b = this.p5.blue(color);
    // 使用加权平均算法获得更自然的灰度值
    return r * 0.299 + g * 0.587 + b * 0.114;
  }

  /**
   * 获取线性渐变颜色
   * @param xPos 粒子X坐标
   * @param yPos 粒子Y坐标
   * @returns 颜色值
   */
  private getLinearGradientColor(xPos: number, yPos: number): Color {
    const isHorizontal = this.direction === 'horizontal';

    // 根据方向选择适当的坐标和尺寸
    const pos = isHorizontal ? xPos : yPos;
    const dimension = isHorizontal ? this.p5.width : this.p5.height;
    const halfDimension = dimension / 2;

    const percent1Lin = this.p5.norm(pos, 0, halfDimension);
    const percent2Lin = this.p5.norm(pos, halfDimension, dimension);
    const between1Lin: Color = this.p5.lerpColor(this.color1, this.color2, percent1Lin);
    const between2Lin: Color = this.p5.lerpColor(this.color2, this.color3, percent2Lin);

    if (pos > 0 && pos < halfDimension) {
      return between1Lin;
    }
    return between2Lin;
  }

  /**
   * 获取径向渐变颜色
   * @param xPos 粒子X坐标
   * @param yPos 粒子Y坐标
   * @returns 颜色值
   */
  private getRadialGradientColor(xPos: number, yPos: number): Color {
    const distance = this.p5.dist(xPos, yPos, this.p5.width / 2, this.p5.height / 2);
    const size = this.p5.max(this.p5.width / 2, this.p5.height / 2);
    const gradientRadius1 = size / 2;
    const gradientRadius2 = size / 1;
    const percent1Rad = this.p5.norm(distance, 0, gradientRadius1);
    const percent2Rad = this.p5.norm(distance, gradientRadius1, gradientRadius2);
    const between1Rad: Color = this.p5.lerpColor(this.color1, this.color2, percent1Rad);
    const between2Rad: Color = this.p5.lerpColor(this.color2, this.color3, percent2Rad);

    if (distance < gradientRadius1) {
      return between1Rad;
    }
    return between2Rad;
  }

  /**
   * 获取分段颜色
   * @param xPos 粒子X坐标
   * @param yPos 粒子Y坐标
   * @param particleIndex 粒子索引
   * @returns 颜色值
   */
  private getSpliceColor(xPos: number, yPos: number, particleIndex: number): Color {
    const isHorizontal = this.direction === 'horizontal';

    // 根据方向选择适当的坐标和尺寸
    const pos = isHorizontal ? xPos : yPos;
    const dimension = isHorizontal ? this.p5.width : this.p5.height;

    const oneThird = dimension / 3;
    const twoThirds = (dimension / 3) * 2;

    // 灰度
    if (pos < oneThird) {
      if (particleIndex % 3 === 0) {
        return this.grayColors.color1;
      }
      if (particleIndex % 3 === 1) {
        return this.grayColors.color2;
      }
      return this.grayColors.color3;
    }

    // 原色
    if (pos <= twoThirds) {
      return this.getNormalColor(particleIndex);
    }

    // 反色
    if (particleIndex % 3 === 0) {
      return this.invertedColors.color1;
    }
    if (particleIndex % 3 === 1) {
      return this.invertedColors.color2;
    }
    return this.invertedColors.color3;
  }
}
