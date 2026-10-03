import { initNightFishing, type NightFishingController } from '~/utils/night-fishing';
import type { HomeThemeClient } from '../types';

let controller: NightFishingController | null = null;
let active = false;

const isInteractive = (target: EventTarget | null) =>
  target instanceof Element && target.closest('a, button, input, label') !== null;

const onPointerMove = (event: PointerEvent) => {
  if (!active || !controller) {
    return;
  }
  const hovering = !isInteractive(event.target) && controller.hitTest(event.clientX, event.clientY) >= 0;
  document.documentElement.style.cursor = hovering ? 'pointer' : '';
};

// 彩蛋：点一下浮漂，就会有鱼来咬钩
const onPointerDown = (event: PointerEvent) => {
  if (!active || !controller || isInteractive(event.target)) {
    return;
  }
  const index = controller.hitTest(event.clientX, event.clientY);
  if (index >= 0) {
    controller.bite(index);
    window.umami?.track('night-fishing-bite');
  }
};

function init() {
  const canvas = document.getElementById('night-fishing-canvas');
  if (!(canvas instanceof HTMLCanvasElement)) {
    return;
  }
  // 调参用：?nf-t=<秒> 将画面定格在指定时刻；再加 &nf-bite=<浮漂序号>:<秒> 可定格咬钩动画的某一张
  const params = new URLSearchParams(window.location.search);
  const frozenTime = Number.parseFloat(params.get('nf-t') ?? '');
  const [biteIndex, biteTau] = (params.get('nf-bite') ?? '').split(':').map(Number.parseFloat);
  controller = initNightFishing(canvas, {
    frozenTime: Number.isFinite(frozenTime) ? frozenTime : undefined,
    frozenBite: Number.isFinite(biteIndex) && Number.isFinite(biteTau) ? { index: biteIndex, tau: biteTau } : undefined,
    onReady: () => {
      canvas.style.opacity = '1';
    },
  });
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerdown', onPointerDown);
}

export default {
  activate() {
    if (!controller) {
      init();
    }
    active = true;
    controller?.resume();
  },
  deactivate() {
    active = false;
    document.documentElement.style.cursor = '';
    controller?.pause();
  },
} satisfies HomeThemeClient;
