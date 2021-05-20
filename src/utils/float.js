import {
  TweenLite,
  Power1,
  CSSPlugin,
  // AttrPlugin,
} from 'gsap/all';

// to prevent tree shaking
const plugins = [
  CSSPlugin,
  // AttrPlugin,
];

/**
 * Make element floatable
 */
export class Float {
  constructor() {
    this.initProp();
    this.initEvent();
  }
  initProp() {
    this.clientWidth = document.documentElement.clientWidth;
    this.clientHeight = document.documentElement.clientHeight;
    this.SPEED = 1;
  }
  initEvent() {
    window.addEventListener('resize', () => {
      this.clientWidth = document.documentElement.clientWidth;
      this.clientHeight = document.documentElement.clientHeight;
    });

    // 监听鼠标移动
    document.addEventListener(
      'mousemove',
      (e) => {
        this.clientX = e.clientX;
        this.clientY = e.clientY;
      },
      {
        passive: true,
      }
    );
  }
  addFloat(elems, level) {
    if (!Array.isArray(elems)) {
      this.float(elems, level);
    } else {
      elems.forEach((elem) => {
        this.float(elem, level);
      });
    }
    // 连缀语法
    return this;
  }
  float(elem, level) {
    const frame = () => {
      try {
        TweenLite.to(elem, this.SPEED, {
          x: (this.clientWidth / 2 - this.clientX) * level * 0.01,
          y: (this.clientHeight / 2 - this.clientY) * level * 0.01,
          ease: Power1.easeOut,
        });
        requestAnimationFrame(frame);
      } catch (e) {}
    };
    requestAnimationFrame(frame);
  }
}
