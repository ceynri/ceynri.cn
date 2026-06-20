import { visit } from 'unist-util-visit';

import { isLocalImageAsset, recordAsset, resolveContentAsset } from './content-assets';

export interface RemarkContentAssetsOptions {
  /** 内容源根目录的绝对路径 */
  contentBase: string;
}

/**
 * Remark 插件：解析、校验、收集和改写 Markdown 中的本地图片资源引用
 *
 * 处理两类节点：
 * - image 节点（正文图片）
 * - link 节点（floating-image 等图片链接）
 *
 * 对本地图片资源：resolver 解析 → manifest 收集 → URL 改写为 outputUrl
 * 对外部 URL / 非图片扩展名：不处理
 */
export function remarkContentAssets(options: RemarkContentAssetsOptions) {
  const { contentBase } = options;

  // biome-ignore lint/suspicious/noExplicitAny: remark 插件的 tree/file 类型在 unified 生态中未暴露精确类型
  return (tree: any, file: any) => {
    const markdownFilePath: string | undefined = file.history[0];
    if (!markdownFilePath) {
      return;
    }

    const resolveOptions = { markdownFilePath, contentBase };

    // 处理 image 节点：![alt](url)
    // biome-ignore lint/suspicious/noExplicitAny: mdast node 类型
    visit(tree, 'image', (node: any) => {
      const url = node.url as string;
      if (!isLocalImageAsset(url)) return;

      const asset = resolveContentAsset(url, resolveOptions);
      recordAsset(asset);
      node.url = asset.outputUrl;
    });

    // 处理 link 节点：[text](url)，仅当 href 是图片时
    // biome-ignore lint/suspicious/noExplicitAny: mdast node 类型
    visit(tree, 'link', (node: any) => {
      const url = node.url as string;
      if (!isLocalImageAsset(url)) return;

      const asset = resolveContentAsset(url, resolveOptions);
      recordAsset(asset);
      node.url = asset.outputUrl;
    });
  };
}
