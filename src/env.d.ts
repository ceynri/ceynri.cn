interface Window {
  /** Umami 脚本可能被广告/隐私拦截器拦截，未加载时 window.umami 为 undefined，调用处需用可选链 */
  umami?: {
    track: (event: string, data?: Record<string, unknown>) => void;
  };
  /** 刷新流场背景效果 */
  refreshFlowField: () => void;
}
