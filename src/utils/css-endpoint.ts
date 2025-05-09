import type { APIRoute } from 'astro';

/**
 * 创建返回 CSS 的端点
 * @param cssContent 编译后的 CSS 内容
 * @returns APIRoute 函数
 */
export function createCssEndpoint(cssContent: string): APIRoute {
  return async () => {
    return new Response(cssContent, {
      headers: {
        // 基本内容类型
        'Content-Type': 'text/css',
        // 缓存控制
        'Cache-Control': 'public, max-age=2592000',
        // CORS 设置 - 允许任何源访问此 CSS (giscus 需要使用到)
        'Access-Control-Allow-Origin': '*',
      },
    });
  };
}
