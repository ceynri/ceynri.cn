import type P5 from 'p5';
import type { HomeComposition } from '~/utils/flow-field/types';
import type { HomeThemeClient } from '../types';

// 主视觉外层 / 内层的固定基础类：仅保留 opacity 过渡，不含位移动画（重定位瞬时完成）
const HERO_WRAP_BASE = 'absolute z-[1] flex transition-opacity duration-500 ease-out';
const HERO_BLOCK_BASE = 'flex flex-col text-shadow-lg';

let p5Instance: P5 | null = null;
let reroll = () => {};
let inited = false;
let active = false;
let rolling = false;

const INTERACTIVE = 'a, button, input, textarea, select, label';

/** 点在空白处才重抽构图。链接、按钮这类功能区不打断当前布局 */
const onBlankClick = (event: MouseEvent) => {
  if (!active || rolling) {
    return;
  }
  const target = event.target;
  if (!(target instanceof Element)) {
    return;
  }
  if (!target.closest('[data-home-theme-only="flow-field"]') || target.closest(INTERACTIVE)) {
    return;
  }
  rolling = true;
  const wrapEl = document.getElementById('hero');
  if (wrapEl) {
    wrapEl.style.opacity = '0';
  }
  window.setTimeout(() => {
    reroll();
    rolling = false;
  }, 180);
};

// 根据构图把主视觉定位到指定区域（瞬时生效、无位移动画），并在区域内按对齐类摆放文案，完成后淡入
const applyComposition = (composition: HomeComposition) => {
  const wrapEl = document.getElementById('hero');
  const blockEl = document.getElementById('hero-block');
  if (!wrapEl || !blockEl) {
    return;
  }
  const { left, top, width, height } = composition.heroRegion;
  wrapEl.className = `${HERO_WRAP_BASE} ${composition.heroWrapClass}`;
  wrapEl.style.left = `${left}px`;
  wrapEl.style.top = `${top}px`;
  wrapEl.style.width = `${width}px`;
  wrapEl.style.height = `${height}px`;
  blockEl.className = `${HERO_BLOCK_BASE} ${composition.heroBlockClass}`;
  wrapEl.style.opacity = '1';
};

async function init() {
  inited = true;
  // p5 体积较大，仅在主题首次激活时加载（Vite 自动分包）
  const { initFlowField } = await import('~/utils/flow-field');
  const field = initFlowField('flow-field-container', { onComposition: applyComposition });
  p5Instance = field?.instance ?? null;
  reroll = field?.reroll ?? (() => {});
  window.addEventListener('click', onBlankClick);

  // 安全兜底：即便背景脚本异常未上报构图，也在超时后以默认居中布局显现，避免主视觉永久隐藏
  window.setTimeout(() => {
    const wrapEl = document.getElementById('hero');
    if (wrapEl && wrapEl.style.opacity !== '1') {
      wrapEl.style.opacity = '1';
    }
  }, 1200);
}

export default {
  activate() {
    active = true;
    if (!inited) {
      void init();
      return;
    }
    p5Instance?.loop();
  },
  deactivate() {
    active = false;
    // 主题切走后暂停粒子迭代，避免隐藏画布空跑
    p5Instance?.noLoop();
  },
} satisfies HomeThemeClient;
