import type P5 from 'p5';
import { throttle } from '~/utils';
import { pickComposition } from './composition';
import { BG_COLOR } from './config';
import { ParticleSystem } from './particle-system';
import type { Frame, HomeComposition, SelectedComposition } from './types';
import { generateRandomOptions } from './utils';

export function sketch(p5: P5, container: HTMLElement) {
  let particleSystem: ParticleSystem;
  let bgColor: P5.Color;
  let canvasEl: HTMLCanvasElement;
  let composition: SelectedComposition;

  // 禁用 P5 的友好错误提示以提升性能
  p5.disableFriendlyErrors = true;

  // 将画框几何应用到画布元素：画布在容器内绝对定位，画框以外区域即为容器的纯黑留白
  const applyFrame = (frame: Frame) => {
    p5.resizeCanvas(frame.width, frame.height);
    canvasEl.style.left = `${frame.left}px`;
    canvasEl.style.top = `${frame.top}px`;
  };

  // 广播当前构图，供首页主视觉根据画框协调排版
  const emitComposition = () => {
    const detail: HomeComposition = {
      name: composition.name,
      heroRegion: composition.heroRegion,
      heroWrapClass: composition.heroWrapClass,
      heroBlockClass: composition.heroBlockClass,
    };
    window.__flowFieldComposition = detail;
    window.dispatchEvent(new CustomEvent('flowfield:composition', { detail }));
  };

  // 重掷整套构图：重选画框 + 重建粒子 + 广播新布局，配合淡入淡出过渡
  const reroll = () => {
    composition = pickComposition();
    applyFrame(composition.frame);
    particleSystem = new ParticleSystem(p5, generateRandomOptions());
    p5.background(bgColor);
    emitComposition();
  };

  p5.setup = () => {
    const canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight);
    canvasEl = canvas.elt as HTMLCanvasElement;

    canvasEl.setAttribute('aria-label', '基于柏林噪声的流场背景动画');
    canvasEl.setAttribute('role', 'img');
    // 画布在容器内绝对定位，容器铺满视口且背景为纯黑
    canvasEl.style.position = 'absolute';
    canvasEl.style.transition = 'opacity 0.6s ease';
    canvasEl.style.opacity = '0';
    container.style.backgroundColor = BG_COLOR;

    // 禁用抗锯齿
    p5.smooth();
    // 禁用描边
    p5.noStroke();

    bgColor = p5.color(BG_COLOR);
    reroll();

    // 首次绘制后淡入
    requestAnimationFrame(() => {
      canvasEl.style.opacity = '1';
    });
  };

  p5.draw = () => {
    particleSystem.update();
  };

  // 窗口尺寸变化时按当前构图重算画框与主视觉区域并重建粒子，加节流避免 resize 高频触发
  p5.windowResized = throttle(() => {
    const { frame, region } = composition.recompute(window.innerWidth, window.innerHeight);
    composition = { ...composition, frame, heroRegion: region };
    applyFrame(composition.frame);
    particleSystem.initParticles();
    p5.background(bgColor);
    emitComposition();
  }, 200);

  window.refreshFlowField = () => {
    // 先淡出（同时通知主视觉一起淡出），在不可见状态下重掷并重定位，再淡入，避免可见的位移跳动
    canvasEl.style.opacity = '0';
    window.dispatchEvent(new Event('flowfield:fadeout'));
    window.setTimeout(() => {
      reroll();
      canvasEl.style.opacity = '1';
    }, 250);
  };
}
