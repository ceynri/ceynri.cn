import { SHAPE_ATLAS } from './config';
import type { FloatShape } from './types';

/** 图集四个通道依次存放的轮廓层 */
const CHANNELS = ['halo', 'silhouette', 'lit', 'cream'] as const;

const INF = 1e20;

/** 浮漂轮廓的有向距离场图集：每支浮漂占一块，RGBA 通道分别为光晕、剪影、发光区、亮芯 */
export interface ShapeAtlas {
  width: number;
  height: number;
  data: Uint8Array;
}

/** 一维平方距离变换（Felzenszwalb & Huttenlocher），f 为各点的初始平方距离 */
function distance1d(f: Float64Array, n: number, d: Float64Array, v: Int32Array, z: Float64Array) {
  let k = 0;
  v[0] = 0;
  z[0] = -INF;
  z[1] = INF;
  for (let q = 1; q < n; q++) {
    let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    while (s <= z[k]) {
      k--;
      s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    }
    k++;
    v[k] = q;
    z[k] = s;
    z[k + 1] = INF;
  }
  k = 0;
  for (let q = 0; q < n; q++) {
    while (z[k + 1] < q) {
      k++;
    }
    const dq = q - v[k];
    d[q] = dq * dq + f[v[k]];
  }
}

/** 二维平方距离变换（原地） */
function distance2d(grid: Float64Array, width: number, height: number) {
  const n = Math.max(width, height);
  const f = new Float64Array(n);
  const d = new Float64Array(n);
  const v = new Int32Array(n);
  const z = new Float64Array(n + 1);
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) f[y] = grid[y * width + x];
    distance1d(f, height, d, v, z);
    for (let y = 0; y < height; y++) grid[y * width + x] = d[y];
  }
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) f[x] = grid[y * width + x];
    distance1d(f, width, d, v, z);
    for (let x = 0; x < width; x++) grid[y * width + x] = d[x];
  }
}

/**
 * 由轮廓生成有向距离场图集
 * 各层先用 Canvas 栅格化得到覆盖率，边缘像素以亚像素覆盖率作为初始距离做一次广义距离变换
 */
export function buildShapeAtlas(shapes: readonly FloatShape[]): ShapeAtlas {
  const { bounds, texelsPerUnit, spread } = SHAPE_ATLAS;
  const cellWidth = Math.round((bounds.x1 - bounds.x0) * texelsPerUnit);
  const height = Math.round((bounds.y1 - bounds.y0) * texelsPerUnit);
  const width = cellWidth * shapes.length;
  const data = new Uint8Array(width * height * 4);

  const canvas = document.createElement('canvas');
  canvas.width = cellWidth;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('无法创建 2D 画布');
  }
  // 参考坐标（y 向上）→ 画布像素（y 向下）
  ctx.setTransform(texelsPerUnit, 0, 0, -texelsPerUnit, -bounds.x0 * texelsPerUnit, bounds.y1 * texelsPerUnit);
  ctx.fillStyle = '#fff';

  const grid = new Float64Array(cellWidth * height);
  const coverage = new Float32Array(cellWidth * height);
  const scale = 127 / (spread * texelsPerUnit);

  shapes.forEach((shape, index) => {
    CHANNELS.forEach((layer, channel) => {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cellWidth, height);
      ctx.restore();
      ctx.beginPath();
      for (const loop of shape[layer]) {
        ctx.moveTo(loop[0], loop[1]);
        for (let i = 2; i < loop.length; i += 2) ctx.lineTo(loop[i], loop[i + 1]);
        ctx.closePath();
      }
      ctx.fill();

      const pixels = ctx.getImageData(0, 0, cellWidth, height).data;
      for (let i = 0; i < grid.length; i++) {
        const alpha = pixels[i * 4 + 3] / 255;
        coverage[i] = alpha;
        grid[i] = alpha > 0.02 && alpha < 0.98 ? (0.5 - alpha) ** 2 : INF;
      }
      distance2d(grid, cellWidth, height);

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < cellWidth; x++) {
          const i = y * cellWidth + x;
          const signed = Math.sqrt(grid[i]) * (coverage[i] >= 0.5 ? -1 : 1);
          const value = Math.round(128 + signed * scale);
          data[(y * width + index * cellWidth + x) * 4 + channel] = value < 0 ? 0 : value > 255 ? 255 : value;
        }
      }
    });
  });

  return { width, height, data };
}
