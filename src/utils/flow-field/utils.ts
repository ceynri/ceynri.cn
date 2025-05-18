import type { AppOptions } from './types';

import { defaultOptions, range } from './config';

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
 * 生成随机配置选项
 * @returns 随机生成的配置选项
 */
export function generateRandomOptions(): AppOptions {
  return {
    ...defaultOptions,
    // TODO: 随机颜色？
    // color1: getRandomHexColor(),
    // color2: getRandomHexColor(),
    // color3: getRandomHexColor(),
    maxLife: random(range.maxLife[0], range.maxLife[1]),
    nums: randomInt(range.nums[0], range.nums[1]),
    size: random(range.size[0], range.size[1]),
    noiseScale: random(range.noiseScale[0], range.noiseScale[1]),
    colorMode: randomFromArray(range.colorMode),
  };
}

/**
 * 返回一个随机的十六进制颜色字符串
 * @returns 十六进制颜色字符串
 */
export function getRandomHexColor(): string {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
}
