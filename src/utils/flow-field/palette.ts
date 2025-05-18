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

  /**
   * 创建一个新的颜色管理器
   * @param p5 p5实例
   * @param options 配置选项
   */
  constructor(p5: P5, options: AppOptions) {
    this.p5 = p5;
    this.options = options;
    this.direction = this.initDirection();
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
      return this.p5.color(this.options.color1);
    }
    else if (particleIndex % 3 === 1) {
      return this.p5.color(this.options.color2);
    }
    else { return this.p5.color(this.options.color3); }
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
    const fromLin: Color = this.p5.color(this.options.color1);
    const middleLin: Color = this.p5.color(this.options.color2);
    const toLin: Color = this.p5.color(this.options.color3);
    const between1Lin: Color = this.p5.lerpColor(fromLin, middleLin, percent1Lin);
    const between2Lin: Color = this.p5.lerpColor(middleLin, toLin, percent2Lin);

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
    const fromRad: Color = this.p5.color(this.options.color1);
    const middleRad: Color = this.p5.color(this.options.color2);
    const toRad: Color = this.p5.color(this.options.color3);
    const between1Rad: Color = this.p5.lerpColor(fromRad, middleRad, percent1Rad);
    const between2Rad: Color = this.p5.lerpColor(middleRad, toRad, percent2Rad);

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
        return this.p5.color(20);
      }
      else if (particleIndex % 3 === 1) {
        return this.p5.color(100);
      }
      else { return this.p5.color(220); }
    }

    // 原色
    if (pos <= twoThirds) {
      return this.getNormalColor(particleIndex);
    }

    // 反色
    if (particleIndex % 3 === 0) {
      const c1: Color = this.p5.color(this.options.color1);
      return this.p5.color(255 - this.p5.red(c1), 255 - this.p5.green(c1), 255 - this.p5.blue(c1));
    }
    else if (particleIndex % 3 === 1) {
      const c2: Color = this.p5.color(this.options.color2);
      return this.p5.color(255 - this.p5.red(c2), 255 - this.p5.green(c2), 255 - this.p5.blue(c2));
    }
    else {
      const c3: Color = this.p5.color(this.options.color3);
      return this.p5.color(255 - this.p5.red(c3), 255 - this.p5.green(c3), 255 - this.p5.blue(c3));
    }
  }
}
