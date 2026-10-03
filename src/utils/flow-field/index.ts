import P5 from 'p5';

import { type SketchOptions, sketch } from './sketch';

export interface FlowFieldHandle {
  instance: P5;
  /** 重新抽取画框、粒子和主视觉落点 */
  reroll: () => void;
}

/**
 * 初始化流场背景
 * @param containerId 容器元素的ID
 * @param options 构图回调等可选项
 */
export function initFlowField(containerId: string, options: SketchOptions = {}): FlowFieldHandle | null {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`容器 ID "${containerId}" 未找到，无法初始化流场背景`);
    return null;
  }

  let reroll = () => {};
  const instance = new P5((p5) => {
    reroll = sketch(p5, container, options).reroll;
  }, container);
  return { instance, reroll: () => reroll() };
}
