export * as env from './env';
export { Perspective } from './perspective';
export { default as objFilter } from './objFilter';

function throttle(method, delay = 100, context = this) {
  let timer = null;
  return function() {
    if (timer) {
      return;
    }
    timer = setTimeout(() => {
      timer = null;
      method.apply(context, arguments);
    }, delay);
  };
}

// 函数去抖
function debounce(method, delay = 100, context = this) {
  let timer = null;
  const start = new Date();
  return function() {
    const current = new Date();
    clearTimeout(timer);
    if (current - start < delay) {
      return;
    }
    timer = setTimeout(() => {
      method.apply(context, arguments);
    }, delay);
  };
}

export { throttle, debounce };
