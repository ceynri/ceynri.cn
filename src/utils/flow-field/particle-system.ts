import type P5 from 'p5';
import type { Color } from 'p5';

import type { AppOptions } from './types';

import { BG_COLOR, diluteConfig } from './config';
import { Palette } from './palette';
import { Particle } from './particle';

/**
 * 粒子系统类
 * 管理场景中所有粒子的创建、更新和渲染
 */
export class ParticleSystem {
  /** 粒子数组 */
  private particles: Particle[] = [];
  /** p5实例 */
  private p5: P5;
  /** 配置选项 */
  private options: AppOptions;
  /** 背景颜色对象 */
  private bgColor: Color;

  /**
   * 创建一个新的粒子系统
   * @param p5 p5实例
   * @param options 配置选项
   */
  constructor(p5: P5, options: AppOptions) {
    this.p5 = p5;
    this.options = options;
    this.bgColor = this.p5.color(BG_COLOR);
    this.initParticles();
  }

  /**
   * 初始化粒子数组
   */
  public initParticles() {
    this.particles = [];
    const palette = new Palette(this.p5, this.options);
    for (let i = 0; i < this.options.nums; i++) {
      this.particles[i] = new Particle(this.p5, this.options, i, palette);
    }
  }

  /**
   * 更新粒子系统
   */
  public update() {
    // 每 n 帧绘制一次半透明背景以实现痕迹淡化
    if (this.p5.frameCount % diluteConfig.perFrame === 0) {
      const ratio = diluteConfig.ratio;
      this.p5.background(
        this.p5.red(this.bgColor),
        this.p5.green(this.bgColor),
        this.p5.blue(this.bgColor),
        255 * ratio,
      );
    }

    for (let i = 0; i < this.options.nums; i++) {
      const particle = this.particles[i];

      // 检查粒子是否超出边界
      particle.checkEdge();

      // 更新粒子位置
      particle.move();

      // 渲染粒子
      particle.display();
    }
  }

  /**
   * 设置新的配置选项
   * @param options 新的配置选项
   */
  public updateOptions(options: AppOptions) {
    this.options = options;
    this.initParticles();
  }
}
