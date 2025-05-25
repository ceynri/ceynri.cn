interface Window {
  umami: {
    track: (event: string, data?: Record<string, any>) => void;
  };
  /** 刷新流场背景效果 */
  refreshFlowField: () => void;
}
