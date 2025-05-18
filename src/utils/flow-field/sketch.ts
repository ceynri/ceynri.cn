import type P5 from 'p5';

import type { AppOptions } from './types';

import { BG_COLOR, defaultOptions } from './config';
import { ParticleSystem } from './particle-system';
import { generateRandomOptions } from './utils';

export function sketch(p5: P5) {
  let particleSystem: ParticleSystem;
  let bgColor: P5.Color;

  let container: HTMLElement | null;

  p5.setup = () => {
    const canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight);
    const canvasElement = canvas.elt as HTMLElement;

    canvasElement.setAttribute('aria-label', '基于柏林噪声的流场背景动画');
    canvasElement.setAttribute('role', 'img');

    container = canvasElement.parentElement;

    if (container) {
      p5.resizeCanvas(container.clientWidth, container.clientHeight);
    }

    p5.smooth();
    p5.noStroke();

    particleSystem = new ParticleSystem(p5, defaultOptions);

    bgColor = p5.color(BG_COLOR);
    p5.background(bgColor);
  };

  p5.draw = () => {
    particleSystem.update();
  };

  p5.windowResized = () => {
    if (container) {
      p5.resizeCanvas(container.clientWidth, container.clientHeight);
    }
    else {
      p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    }
    particleSystem.initParticles();
    p5.background(bgColor);
  };

  window.refreshFlowField = () => {
    const options: AppOptions = generateRandomOptions();
    particleSystem.updateOptions(options);
    p5.background(bgColor);
  };
}
