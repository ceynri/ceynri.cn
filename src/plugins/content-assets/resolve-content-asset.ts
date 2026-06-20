import fs from 'node:fs';
import path from 'node:path';

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.avif']);

export interface ResolvedContentAsset {
  /** 内容库中的语义 URI，如 /blog/assets/slug/a.png */
  contentUri: string;
  /** 源文件在文件系统的绝对路径 */
  sourcePath: string;
  /** 最终发布 URL，当前等于 contentUri，未来可映射 */
  outputUrl: string;
}

export interface ResolveOptions {
  /** 当前 Markdown 文件的绝对路径 */
  markdownFilePath: string;
  /** 内容源根目录的绝对路径 */
  contentBase: string;
}

/**
 * 判断 URL 是否为本地图片资源引用
 */
export function isLocalImageAsset(url: string): boolean {
  if (!url) return false;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return false;
  }
  // 去除 query string 和 hash 后判断扩展名
  const cleanUrl = url.split('?')[0].split('#')[0];
  const ext = path.extname(cleanUrl).toLowerCase();
  return IMAGE_EXTENSIONS.has(ext);
}

/**
 * 解析内容资源引用
 *
 * 支持两种路径形式：
 * 1. 内容根 URI：以 / 开头，相对于 contentBase 解析
 * 2. 相对路径：./xxx 或 ../xxx，相对于当前 Markdown 文件解析后再推导 contentUri
 */
export function resolveContentAsset(url: string, options: ResolveOptions): ResolvedContentAsset {
  const { markdownFilePath, contentBase } = options;
  const normalizedContentBase = path.resolve(contentBase);

  let sourcePath: string;
  let contentUri: string;

  if (url.startsWith('/')) {
    // 内容根绝对路径
    contentUri = url;
    sourcePath = path.join(normalizedContentBase, url);
  } else {
    // 相对路径，相对于当前 Markdown 文件解析
    const markdownDir = path.dirname(markdownFilePath);
    sourcePath = path.resolve(markdownDir, url);
    // 推导 contentUri：sourcePath 相对于 contentBase 的路径
    const relative = path.relative(normalizedContentBase, sourcePath);
    contentUri = `/${relative.split(path.sep).join('/')}`;
  }

  // 校验文件存在性
  if (!fs.existsSync(sourcePath)) {
    throw new ContentAssetNotFoundError(markdownFilePath, url, sourcePath);
  }

  // 当前实现：outputUrl = contentUri
  const outputUrl = contentUri;

  return { contentUri, sourcePath, outputUrl };
}

/**
 * 内容资源未找到的错误
 */
export class ContentAssetNotFoundError extends Error {
  constructor(
    public readonly markdownFilePath: string,
    public readonly originalUrl: string,
    public readonly expectedSourcePath: string,
  ) {
    super(
      `Missing content asset:\n` +
        `  file: ${markdownFilePath}\n` +
        `  url: ${originalUrl}\n` +
        `  expected: ${expectedSourcePath}`,
    );
    this.name = 'ContentAssetNotFoundError';
  }
}
