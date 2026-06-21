import fs from 'node:fs';
import path from 'node:path';

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.avif']);

export interface ResolvedContentAssetReference {
  /** 内容源内的 URL 路径，如 /blog/assets/slug/a.png */
  contentUrl: string;
  /** 源文件在文件系统中的绝对路径 */
  sourcePath: string;
  /** 站点最终可访问的原图 URL，当前与 contentUrl 一致 */
  publicUrl: string;
}

export interface ResolveContentAssetOptions {
  /** 当前 Markdown 文件的绝对路径 */
  markdownFilePath: string;
  /** 内容源根目录的绝对路径 */
  contentBase: string;
}

/** 判断 URL 是否为本地图片文件引用；只负责排除远程 URL 和非图片扩展名。 */
export function isLocalImageAssetUrl(url: string): boolean {
  if (!url) return false;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return false;
  }

  const cleanUrl = url.split('?')[0].split('#')[0];
  const ext = path.extname(cleanUrl).toLowerCase();
  return IMAGE_EXTENSIONS.has(ext);
}

/**
 * 将 Markdown 中的本地图片链接解析为内容源文件与站点原图 URL。
 *
 * 正文图片不应调用这里改写 URL；它们需要保留相对路径交给 Astro 图片管线。
 * 这里主要服务 Markdown link / floating image 这类 Astro 不会优化但仍需访问原图的场景。
 */
export function resolveContentAssetReference(
  url: string,
  options: ResolveContentAssetOptions,
): ResolvedContentAssetReference {
  const { markdownFilePath, contentBase } = options;
  const normalizedContentBase = path.resolve(contentBase);

  let sourcePath: string;
  let contentUrl: string;

  if (url.startsWith('/')) {
    contentUrl = url;
    sourcePath = path.join(normalizedContentBase, url.replace(/^\/+/, ''));
  } else {
    const markdownDir = path.dirname(markdownFilePath);
    sourcePath = path.resolve(markdownDir, url);
    const relative = path.relative(normalizedContentBase, sourcePath);
    contentUrl = `/${relative.split(path.sep).join('/')}`;
  }

  if (!fs.existsSync(sourcePath)) {
    throw new ContentAssetNotFoundError(markdownFilePath, url, sourcePath);
  }

  return { contentUrl, sourcePath, publicUrl: contentUrl };
}

/** 内容资源引用指向的源文件不存在。 */
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
