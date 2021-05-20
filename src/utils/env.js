export const ua = navigator.userAgent || '';
// 系统
export const isIPhone = /iPhone|iPod/i.test(ua);
export const isIPad = /iPad/i.test(ua);
export const isIos = isIPhone || isIPad;
export const isAndroid = /Android/i.test(ua);
export const isOtherPhone = /Windows Phone|IEMobile|SymbianOS/i.test(ua);
// 浏览器
export const isFireFox = /Firefox/i.test(ua);
export const isChrome = /Chrome|CriOS/i.test(ua);
export const isWeChat = /micromessenger/i.test(ua);
// 设备类型
export const isPad =
  isIPad ||
  (isAndroid && !/Mobile/i.test(ua)) ||
  (isFireFox && /Tablet/i.test(ua)) ||
  /PlayBook/i.test(ua);
export const isPhone = (isIPhone || isAndroid || isOtherPhone) && !isPad;
export const isMobile = isIPhone || isAndroid || isOtherPhone || isPad;
export const isPc = !isMobile;

export const widthMoreThan = (width) =>
  window.matchMedia(`screen and (min-width: ${width}px)`).matches;

export const widthLessThan = (width) =>
  window.matchMedia(`screen and (max-width: ${width}px)`).matches;
