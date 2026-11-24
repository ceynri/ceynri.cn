interface Window {
  /** Umami 脚本可能被广告/隐私拦截器拦截，未加载时 window.umami 为 undefined，调用处需用可选链 */
  umami?: {
    track: (event: string, data?: Record<string, unknown>) => void;
    /** 为当前会话附加可分段的自定义属性（如配色方案），便于按维度分析行为；老版本 tracker 可能没有，调用处用可选链 */
    identify?: (sessionData: Record<string, unknown>) => void;
    /** v3.5+ 错误上报接口（启用 data-errors="true" 时可用） */
    captureException?: (error: unknown, context?: Record<string, unknown>) => void;
  };
  umamiBeforeSend?: (type: string, payload: Record<string, unknown>) => Record<string, unknown> | null | false;
}
