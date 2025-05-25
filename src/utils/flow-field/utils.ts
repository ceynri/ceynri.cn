import type { AppOptions } from './types';

import { COLOR_MODES, rangeFor2xl, rangeForLg, rangeForSm } from './config';

/**
 * 生成指定范围内的随机数
 */
function random(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

/**
 * 生成指定范围内的随机整数
 */
function randomInt(min: number, max: number) {
  return Math.floor(random(min, max));
}

/**
 * 从数组中随机选择一个元素
 */
function randomFromArray<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 随机正序或倒序返回数组
 */
function randomOrder<T>(arr: T[]): T[] {
  return Math.random() > 0.5 ? arr : arr.reverse();
}

/**
 * 根据屏幕大小获取对应的参数范围
 */
function getRangeForScreen() {
  const width = window.innerWidth;
  if (width < 640) {
    return rangeForSm;
  }
  if (width < 1536) {
    return rangeForLg;
  }
  return rangeFor2xl;
}

/**
 * 生成随机配置选项
 * @returns 随机生成的配置选项
 */
export function generateRandomOptions(): AppOptions {
  const colors = randomOrder([
    `hsl(${Math.floor(Math.random() * 360)}, 90%, 90%)`,
    `hsl(${Math.floor(Math.random() * 360)}, 50%, 60%)`,
    `hsl(${Math.floor(Math.random() * 360)}, 10%, 30%)`,
  ]);

  const range = getRangeForScreen();

  return {
    color1: colors[0],
    color2: colors[1],
    color3: colors[2],
    maxLife: random(range.maxLife[0], range.maxLife[1]),
    nums: randomInt(range.nums[0], range.nums[1]),
    size: random(range.size[0], range.size[1]),
    noiseScale: random(range.noiseScale[0], range.noiseScale[1]),
    colorMode: randomFromArray(COLOR_MODES),
    direction: 'auto',
  };
}

/**
 * 返回一个随机的十六进制颜色字符串
 * @returns 十六进制颜色字符串
 */
export function getRandomHexColor(): string {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
}
