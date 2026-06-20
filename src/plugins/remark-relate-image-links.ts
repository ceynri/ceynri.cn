import fs from 'node:fs';
import path from 'node:path';
import { visit } from 'unist-util-visit';

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];

export interface RemarkImageLinkPathOptions {
  /** 被引用的图片最终生成的 URL 路由目录 */
  targetPath: string;
}

export function remarkRelateImageLinks(options: RemarkImageLinkPathOptions) {
  const { targetPath } = options;

  return (tree: any, file: any) => {
    const markdownFilePath = file.history[0];
    if (!markdownFilePath) {
      return;
    }

    visit(tree, 'link', (node: any) => {
      const linkUrl = node.url as string;

      if (!isRelativeImageLink(linkUrl)) {
        return;
      }

      const transformedPath = transformImagePath(linkUrl, markdownFilePath, targetPath);
      if (transformedPath) {
        node.url = transformedPath;
      }
    });
  };
}

/**
 * 检查链接是否为相对图片链接
 */
function isRelativeImageLink(url: string): boolean {
  if (!url || path.isAbsolute(url) || url.startsWith('data:') || url.startsWith('http')) {
    return false;
  }

  const ext = path.extname(url).toLowerCase();
  return IMAGE_EXTENSIONS.includes(ext);
}

/**
 * 转换相对图片路径为 Astro 图片别名路径
 * 从图片绝对路径中定位 images/ 段，截取其后的相对路径，拼上 targetPath
 */
function transformImagePath(
  linkUrl: string,
  markdownFilePath: string,
  targetPath: string,
): string | null {
  const markdownDir = path.dirname(markdownFilePath);
  const absoluteImagePath = path.resolve(markdownDir, linkUrl);

  if (!fs.existsSync(absoluteImagePath)) {
    return null;
  }

  // 从绝对路径中匹配 images/ 段，截取后面的部分
  const normalizedPath = absoluteImagePath.split(path.sep).join('/');
  const imagesIndex = normalizedPath.lastIndexOf('/images/');
  if (imagesIndex === -1) {
    return null;
  }

  const relativePath = normalizedPath.slice(imagesIndex + '/images/'.length);
  const normalizedTargetPath = targetPath.startsWith('/') ? targetPath : `/${targetPath}`;
  return `${normalizedTargetPath}/${relativePath}`;
}
