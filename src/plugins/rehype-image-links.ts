import type { Element } from 'hast';

import { visit } from 'unist-util-visit';

/**
 * Rehype 插件：为指向图片的链接自动添加 data-image-link 属性
 * 这样可以被浮动图片组件自动识别和处理
 */
export function rehypeImageLinks() {
  return (tree: any) => {
    visit(tree, 'element', (node: Element) => {
      // 只处理 a 标签
      if (node.tagName !== 'a') {
        return;
      }

      // 获取 href 属性
      const href = node.properties?.href as string;
      if (!href) {
        return;
      }

      // 检查是否指向图片文件
      const imageExtensions = /\.(?:jpg|jpeg|png|bmp|webp|gif|svg)$/i;
      try {
        const url = new URL(href, 'http://example.com'); // 提供一个 base URL 处理相对路径
        if (imageExtensions.test(url.pathname)) {
          // 添加 data-image-link 属性
          node.properties = node.properties || {};
          node.properties.dataImageLink = '';
        }
      }
      catch {
        // 如果 URL 解析失败，直接检查文件扩展名
        if (imageExtensions.test(href)) {
          node.properties = node.properties || {};
          node.properties.dataImageLink = '';
        }
      }
    });
  };
}
