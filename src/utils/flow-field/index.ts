import P5 from 'p5';

import { sketch } from './sketch';

/**
 * 初始化流场背景
 * @param containerId 容器元素的ID
 * @returns P5实例
 */
export function initFlowField(containerId: string) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`容器 ID "${containerId}" 未找到，无法初始化流场背景`);
    return null;
  }

  // 创建新的 P5 实例，将 sketch 和容器关联
  const instance = new P5((p5) => sketch(p5, container), container);
  return instance;
}
