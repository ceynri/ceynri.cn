import { visit } from 'unist-util-visit';

import { isLocalImageAssetUrl, resolveContentAssetReference } from './content-assets';

export interface RemarkContentImageLinksOptions {
  /** 内容源根目录的绝对路径 */
  contentBase: string;
}

/**
 * Remark 插件：转换 Markdown link 中的本地图片最终链接。
 *
 * Markdown image 节点故意不处理：正文图片保留相对路径，交给 Astro 生成压缩、
 * srcset 和尺寸信息。这里只处理 `[查看原图](./assets/a.jpg)` 这类 link，
 * 把它转换成稳定的内容 URL，后续由 contentAssetsIntegration 提供访问能力。
 */
export function remarkContentImageLinks(options: RemarkContentImageLinksOptions) {
  const { contentBase } = options;

  // biome-ignore lint/suspicious/noExplicitAny: remark 插件的 tree/file 类型在 unified 生态中未暴露精确类型
  return (tree: any, file: any) => {
    const markdownFilePath: string | undefined = file.history[0];
    if (!markdownFilePath) return;

    const resolveOptions = { markdownFilePath, contentBase };

    // biome-ignore lint/suspicious/noExplicitAny: mdast link node 类型
    visit(tree, 'link', (node: any) => {
      const url = node.url as string;
      if (!isLocalImageAssetUrl(url)) return;

      const asset = resolveContentAssetReference(url, resolveOptions);
      node.url = asset.publicUrl;
    });
  };
}
