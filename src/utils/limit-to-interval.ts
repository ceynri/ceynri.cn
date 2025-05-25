/**
 * 将数值限制在指定区间内
 * @param value 要限制的数值
 * @param interval 区间 [min, max]
 * @returns 限制后的数值
 */
export function limitToInterval(value: number, interval: [number, number]): number {
  const [min, max] = interval;
  return Math.max(min, Math.min(max, value));
}
