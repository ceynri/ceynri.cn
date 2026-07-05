import type { HomeComposition } from '~/utils/flow-field/types';

declare global {
  interface Window {
    /** Umami 脚本可能被广告/隐私拦截器拦截，未加载时 window.umami 为 undefined，调用处需用可选链 */
    umami?: {
      track: (event: string, data?: Record<string, unknown>) => void;
      /** 为当前会话附加可分段的自定义属性（如配色方案），便于按维度分析行为；老版本 tracker 可能没有，调用处用可选链 */
      identify?: (sessionData: Record<string, unknown>) => void;
    };
    /** 刷新流场背景效果（重掷整套构图：画框 + 主视觉布局 + 颜色） */
    refreshFlowField: () => void;
    /** 最近一次生成的首页构图，供首页主视觉根据画框协调排版 */
    __flowFieldComposition?: HomeComposition;
  }
}
