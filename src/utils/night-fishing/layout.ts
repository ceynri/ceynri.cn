import { LAYOUTS } from './config';
import type { SceneLayout } from './types';

/**
 * 按视口尺寸计算场景布局：横屏还原原片构图，竖屏（高 ≥ 宽）改用下移的构图
 * @param vw 视口宽度（CSS 像素）
 * @param vh 视口高度（CSS 像素）
 */
export function computeLayout(vw: number, vh: number): SceneLayout {
  const preset = vh >= vw ? LAYOUTS.portrait : LAYOUTS.landscape;
  return {
    scale: preset.scale(vw, vh),
    anchors: preset.anchors.map((anchor) => ({ x: anchor.x * vw, y: anchor.y * vh })),
  };
}
