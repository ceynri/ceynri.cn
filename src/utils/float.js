import { gsap } from 'gsap';
import { throttle } from '~/utils';

/**
 * Make element floatable
 */
export class Float {
  constructor() {
    this.initProp();
    this.initEvent();
    this.registerEffect();
  }

  initProp() {
    this.clientWidth = document.documentElement.clientWidth;
    this.clientHeight = document.documentElement.clientHeight;
  }

  initEvent() {
    window.addEventListener('resize', () => {
      this.clientWidth = document.documentElement.clientWidth;
      this.clientHeight = document.documentElement.clientHeight;
    });

    // 监听鼠标移动
    document.addEventListener(
      'mousemove',
      throttle((e) => {
        this.clientX = e.clientX;
        this.clientY = e.clientY;
      }, 20),
      {
        passive: true,
      }
    );
  }

  registerEffect() {
    gsap.registerEffect({
      name: 'float',
      effect: (targets, config) => {
        return gsap.to(targets, {
          duration: config.duration,
          x: config.x,
          y: config.y,
        });
      },
      defaults: { duration: 1 },
      extendTimeline: true,
    });
  }

  /**
   * make element floaty
   * @param {object} elems HTMLElement array or HTMLElement
   * @param {object | Number} scale float effective scale (percent)
   */
  apply(elems, scale) {
    if (typeof scale === 'number') {
      scale = {
        float: scale,
      };
    }
    const frame = () => {
      try {
        const shiftX = this.clientWidth / 2 - this.clientX;
        const shiftY = this.clientHeight / 2 - this.clientY;
        const shiftDist = Math.abs(shiftX) + Math.abs(shiftY);
        gsap.effects.float(elems, {
          x: shiftX * scale.float,
          y: shiftY * scale.float,
        });
      } catch (e) {}
    };
    this.applyAnimation(frame);
  }

  applyAnimation(frame) {
    const loopFrame = () => {
      frame();
      requestAnimationFrame(loopFrame);
    };
    requestAnimationFrame(loopFrame);
  }
}
