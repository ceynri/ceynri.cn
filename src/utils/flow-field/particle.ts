import type { Vector } from 'p5';
import type P5 from 'p5';

import type { Palette } from './palette';
import type { AppOptions } from './types';

import { BOUNDARY_OFFSET, FADE_LIFE_RATIO, ITERATIONS_RANGE, SPEED } from './config';

/**
 * 粒子类
 * 表示场景中的一个移动粒子
 */
export class Particle {
  /** 粒子位置 */
  public pos: Vector;
  /** 粒子剩余寿命 */
  public life: number;
  /** 粒子速度向量 */
  private vel: Vector;
  /** 粒子每次移动的迭代次数 */
  private iterations: number;
  /** p5实例 */
  private p5: P5;
  /** 配置选项 */
  private options: AppOptions;
  /** 粒子索引 */
  private index: number;
  /** 颜色管理器 */
  private palette: Palette;

  /**
   * 创建一个新的粒子
   * @param p5 p5实例
   * @param options 配置选项
   * @param index 粒子索引
   * @param palette 颜色管理器
   */
  constructor(p5: P5, options: AppOptions, index: number, palette: Palette) {
    this.p5 = p5;
    this.options = options;
    this.index = index;
    this.palette = palette;
    this.vel = p5.createVector(0, 0);
    this.pos = p5.createVector(
      p5.random(-BOUNDARY_OFFSET, p5.width + BOUNDARY_OFFSET),
      p5.random(-BOUNDARY_OFFSET, p5.height + BOUNDARY_OFFSET),
    );
    this.life = options.maxLife;
    this.iterations = p5.random(ITERATIONS_RANGE[0], ITERATIONS_RANGE[1]);
  }

  /**
   * 移动粒子
   */
  public move() {
    // 每帧减少生命值(约60fps)
    this.life -= 0.01666;
    if (this.life < 0) {
      this.respawn();
    }

    for (let i = this.iterations; i > 0; i--) {
      const angle = this.p5.noise(
        this.pos.x / this.options.noiseScale,
        this.pos.y / this.options.noiseScale,
      ) * this.p5.TWO_PI * this.options.noiseScale;

      this.vel.x = this.p5.cos(angle);
      this.vel.y = this.p5.sin(angle);
      this.vel.mult(SPEED);
      this.pos.add(this.vel);
    }
  }

  /**
   * 检查粒子是否超出边界，如果是则重生
   */
  public checkEdge() {
    if (
      this.pos.x > this.p5.width + BOUNDARY_OFFSET
      || this.pos.x < -BOUNDARY_OFFSET
      || this.pos.y > this.p5.height + BOUNDARY_OFFSET
      || this.pos.y < -BOUNDARY_OFFSET
    ) {
      this.respawn();
    }
  }

  /**
   * 显示粒子
   */
  public display() {
    this.setP5Color();
    this.p5.ellipse(this.pos.x, this.pos.y, this.options.size, this.options.size);
  }

  /**
   * 应用粒子颜色
   */
  private setP5Color() {
    // 获取粒子颜色
    const color = this.palette.getParticleColor(this.index, this.pos.x, this.pos.y);

    // 淡入淡出效果：淡入系数和淡出系数取最小值
    const fadeInRatio = this.life / (this.options.maxLife * FADE_LIFE_RATIO);
    const fadeOutRatio = (this.options.maxLife - this.life) / (this.options.maxLife * FADE_LIFE_RATIO);
    const fadeRatio = Math.min(fadeInRatio, fadeOutRatio, 1);

    this.p5.fill(
      this.p5.red(color),
      this.p5.green(color),
      this.p5.blue(color),
      255 * fadeRatio,
    );
  }

  /**
   * 重新生成粒子
   */
  private respawn() {
    this.pos.x = this.p5.random(-BOUNDARY_OFFSET, this.p5.width + BOUNDARY_OFFSET);
    this.pos.y = this.p5.random(-BOUNDARY_OFFSET, this.p5.height + BOUNDARY_OFFSET);
    this.life = this.options.maxLife;
  }
}
