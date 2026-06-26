import type P5 from 'p5';
import { throttle } from '~/utils';
import { BG_COLOR } from './config';
import { ParticleSystem } from './particle-system';
import type { AppOptions } from './types';
import { generateRandomOptions } from './utils';

export function sketch(p5: P5, container: HTMLElement) {
  let particleSystem: ParticleSystem;
  let bgColor: P5.Color;

  // 禁用 P5 的友好错误提示以提升性能
  p5.disableFriendlyErrors = true;

  p5.setup = () => {
    const canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight);
    const canvasElement = canvas.elt as HTMLElement;

    canvasElement.setAttribute('aria-label', '基于柏林噪声的流场背景动画');
    canvasElement.setAttribute('role', 'img');

    p5.resizeCanvas(container.clientWidth, container.clientHeight);

    // 禁用抗锯齿
    p5.smooth();
    // 禁用描边
    p5.noStroke();

    particleSystem = new ParticleSystem(p5, generateRandomOptions());

    bgColor = p5.color(BG_COLOR);
    p5.background(bgColor);
  };

  p5.draw = () => {
    particleSystem.update();
  };

  // 窗口尺寸变化时重置画布并重建粒子，加节流避免 resize 高频触发
  p5.windowResized = throttle(() => {
    p5.resizeCanvas(container.clientWidth, container.clientHeight);
    particleSystem.initParticles();
    p5.background(bgColor);
  }, 200);

  window.refreshFlowField = () => {
    const options: AppOptions = generateRandomOptions();
    particleSystem = new ParticleSystem(p5, options);
    p5.background(bgColor);
  };
}
