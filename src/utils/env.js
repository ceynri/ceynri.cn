export const getUa = () => {
  return navigator.userAgent || '';
};

// 系统
export const isIPhone = () => {
  const ua = getUa();
  return /iPhone|iPod/i.test(ua);
};

export const isIPad = () => {
  const ua = getUa();
  return /iPad/i.test(ua);
};

export const isIos = () => {
  return isIPhone() || isIPad();
};

export const isAndroid = () => {
  const ua = getUa();
  return /Android/i.test(ua);
};

export const isOtherPhone = () => {
  const ua = getUa();
  return /Windows Phone|IEMobile|SymbianOS/i.test(ua);
};

// 浏览器
export const isFireFox = () => {
  const ua = getUa();
  return /Firefox/i.test(ua);
};

export const isChrome = () => {
  const ua = getUa();
  return /Chrome|CriOS/i.test(ua);
};

export const isWeChat = () => {
  const ua = getUa();
  return /micromessenger/i.test(ua);
};

// 设备类型
export const isPad = () => {
  const ua = getUa();
  return (
    isIPad() ||
    (isAndroid() && !/Mobile/i.test(ua)) ||
    (isFireFox() && /Tablet/i.test(ua)) ||
    /PlayBook/i.test(ua)
  );
};

export const isPhone = () => {
  return (isIPhone() || isAndroid() || isOtherPhone()) && !isPad();
};

export const isMobile = () => {
  return isIPhone() || isAndroid() || isOtherPhone() || isPad();
};

export const isPc = () => {
  return !isMobile();
};

export const widthMoreThan = (width) => {
  return window.matchMedia(`screen and (min-width: ${width}px)`).matches;
};

export const widthLessThan = (width) => {
  return window.matchMedia(`screen and (max-width: ${width}px)`).matches;
};
