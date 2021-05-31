import { gsap } from 'gsap';
import { throttle } from '~/utils';

/**
 * Make elements perspective in full screen
 *
 */
export class Perspective {
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
    gsap.registerEffect({
      name: 'blur',
      effect: (targets, config) => {
        return gsap.to(targets, {
          duration: config.duration,
          filter: `blur(${config.blur}px)`,
        });
      },
      defaults: {
        duration: 1,
        blur: 8,
      },
    });
  }

  /**
   * make element perspective
   * @param {(Object|string)} elems - HTMLElement array or HTMLElement
   * @param {(Object|number)} scale - float (and blur) effective scale (percent)
   * @param {number} scale.float - float effective scale (percent)
   * @param {number} scale.blur - blur effective scale (percent)
   */
  apply(elems, scale) {
    if (typeof scale === 'number') {
      scale = { float: scale };
    }
    const frame = () => {
      const shiftX = this.clientWidth / 2 - this.clientX;
      const shiftY = this.clientHeight / 2 - this.clientY;
      const shiftDist = Math.abs(shiftX) + Math.abs(shiftY);
      gsap.effects.float(elems, {
        x: shiftX * scale.float,
        y: shiftY * scale.float,
      });
      if (scale.blur) {
        let blur = 0;
        if (scale.blur > 0) {
          blur = shiftDist * scale.blur;
        } else {
          const maxDist = Math.max(this.clientWidth, this.clientHeight) / 2;
          const reverseDist = maxDist - shiftDist;
          blur = Math.max(reverseDist * -scale.blur, 0);
        }
        gsap.effects.blur(elems, { blur });
      }
    };
    this.applyAnimation(frame);
  }

  applyAnimation(frame) {
    const loopFrame = () => {
      try {
        frame();
        requestAnimationFrame(loopFrame);
      } catch (e) {
        console.error('loopFrameError', e);
      }
    };
    requestAnimationFrame(loopFrame);
  }
}
