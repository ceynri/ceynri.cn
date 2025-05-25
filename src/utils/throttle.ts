/**
 * 节流函数 - 限制函数在指定时间间隔内最多被调用一次
 * @param func 需要被节流的函数
 * @param delay 节流的时间间隔（毫秒）
 * @returns 返回被节流的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let lastCallTime = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>) {
    const now = Date.now();

    if (now - lastCallTime >= delay) {
      // 立即执行
      lastCallTime = now;
      func(...args);
    }
    else if (!timeoutId) {
      // 设置延迟执行
      timeoutId = setTimeout(() => {
        lastCallTime = Date.now();
        timeoutId = null;
        func(...args);
      }, delay - (now - lastCallTime));
    }
  };
}
