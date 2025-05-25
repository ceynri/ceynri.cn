import fs from 'node:fs';
import path from 'node:path';
import { cwd } from 'node:process';
import { visit } from 'unist-util-visit';

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];

export interface RemarkImageLinkPathOptions {
  /** 被引用的图片源文件所在的目录，相对于项目根目录 */
  sourceDir: string;
  /** 被引用的图片最终生成的 URL 路由目录 */
  targetPath: string;
}

export function remarkRelateImageLinks(options: RemarkImageLinkPathOptions) {
  const { sourceDir, targetPath } = options;

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

      const transformedPath = transformImagePath(linkUrl, markdownFilePath, sourceDir, targetPath);
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
 * @param linkUrl 链接 URL
 * @param markdownFilePath  Markdown 文件路径
 * @param sourceDir 图片源文件目录
 * @param targetPath 目标 URL 路由路径
 * @returns 转换后的链接路径
 */
function transformImagePath(
  linkUrl: string,
  markdownFilePath: string,
  sourceDir: string,
  targetPath: string,
): string | null {
  const projectRoot = cwd();
  // 获取 Markdown 文件的目录
  const markdownDir = path.dirname(markdownFilePath);
  // 获取图片的绝对路径
  const absoluteImagePath = path.resolve(markdownDir, linkUrl);
  // 获取 images 目录的绝对路径
  const imagesRootDir = path.resolve(projectRoot, sourceDir);

  // 检查图片是否存在且在预期目录内
  if (!fs.existsSync(absoluteImagePath) || !absoluteImagePath.startsWith(imagesRootDir)) {
    return null;
  }

  // 转换为相对于 images 目录的路径
  const relativePath = path.relative(imagesRootDir, absoluteImagePath);
  // 确保目标路径以 / 开头
  const normalizedTargetPath = targetPath.startsWith('/') ? targetPath : `/${targetPath}`;
  return `${normalizedTargetPath}/${relativePath.split(path.sep).join('/')}`;
}
