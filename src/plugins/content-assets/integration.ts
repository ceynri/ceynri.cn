import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration, HookParameters } from 'astro';

import { isLocalImageAssetUrl } from './resolve-content-asset';

const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
};

export interface ContentAssetsIntegrationOptions {
  /** 内容源根目录的绝对路径 */
  contentBase: string;
}

type AstroConfigSetupHook = HookParameters<'astro:config:setup'>;

/**
 * Astro 集成：让最终 HTML 中保留下来的内容图片原图 URL 可访问。
 *
 * 正文 Markdown 图片应保持相对路径并交给 Astro 优化；这里只补齐 Astro 不处理的
 * `/blog/assets/...` 这类原图链接，在 dev 时按需 serve，在 build 后复制到 dist。
 */
export function contentAssetsIntegration(options: ContentAssetsIntegrationOptions): AstroIntegration {
  const contentBase = path.resolve(options.contentBase);

  return {
    name: 'content-assets',
    hooks: {
      'astro:config:setup': ({ updateConfig }: AstroConfigSetupHook) => {
        updateConfig({
          vite: {
            plugins: [contentAssetDevServer({ contentBase })],
          },
        });
      },
      'astro:build:done': ({ dir }: { dir: URL }) => {
        copyReferencedContentAssets({
          contentBase,
          distDir: fileURLToPath(dir),
        });
      },
    },
  };
}

interface ContentAssetDevServerOptions {
  /** 内容源根目录的绝对路径 */
  contentBase: string;
}

/** dev 阶段没有 dist，原图 URL 需要从内容源按请求读取 */
function contentAssetDevServer(options: ContentAssetDevServerOptions) {
  return {
    name: 'content-assets-dev-server',
    // biome-ignore lint/suspicious/noExplicitAny: Vite 插件类型在 astro config 中不可直接引用
    configureServer(server: any) {
      // biome-ignore lint/suspicious/noExplicitAny: connect middleware 类型不可直接引用
      server.middlewares.use((req: any, res: any, next: any) => {
        const rawUrl = req.url as string | undefined;
        if (!rawUrl) return next();

        const urlPath = normalizeUrlPath(rawUrl);
        if (!urlPath || !isLocalImageAssetUrl(urlPath)) return next();

        const filePath = toFilePath(options.contentBase, urlPath);
        if (!fs.existsSync(filePath)) return next();

        const ext = path.extname(urlPath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(filePath).pipe(res);
      });
    },
  };
}

interface CopyReferencedContentAssetsOptions {
  /** 内容源根目录的绝对路径 */
  contentBase: string;
  /** Astro 输出目录 */
  distDir: string;
}

/** build 阶段没有请求时机，原图 URL 需要根据最终 HTML 提前复制 */
function copyReferencedContentAssets(options: CopyReferencedContentAssetsOptions): void {
  for (const urlPath of collectReferencedImageUrls(options.distDir)) {
    const destPath = toFilePath(options.distDir, urlPath);
    if (fs.existsSync(destPath)) continue;

    const sourcePath = toFilePath(options.contentBase, urlPath);
    if (!fs.existsSync(sourcePath)) continue;

    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.copyFileSync(sourcePath, destPath);
  }
}

function collectReferencedImageUrls(distDir: string): Set<string> {
  const urls = new Set<string>();

  walkHtmlFiles(distDir, (htmlPath) => {
    const html = fs.readFileSync(htmlPath, 'utf-8');
    for (const rawUrl of extractHtmlAssetUrls(html)) {
      const urlPath = normalizeHtmlUrl(rawUrl, htmlPath, distDir);
      if (urlPath && isLocalImageAssetUrl(urlPath)) {
        urls.add(urlPath);
      }
    }
  });

  return urls;
}

function walkHtmlFiles(dir: string, visit: (htmlPath: string) => void): void {
  if (!fs.existsSync(dir)) return;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const filePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkHtmlFiles(filePath, visit);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      visit(filePath);
    }
  }
}

function extractHtmlAssetUrls(html: string): string[] {
  const urls: string[] = [];

  for (const match of html.matchAll(/\b(?:src|href|poster)=["']([^"']+)["']/gi)) {
    urls.push(match[1]);
  }

  for (const match of html.matchAll(/\bsrcset=["']([^"']+)["']/gi)) {
    for (const candidate of match[1].split(',')) {
      const [url] = candidate.trim().split(/\s+/);
      if (url) urls.push(url);
    }
  }

  return urls;
}

function normalizeHtmlUrl(rawUrl: string, htmlPath: string, distDir: string): string | undefined {
  const urlPath = normalizeUrlPath(rawUrl);
  if (!urlPath) return;

  if (urlPath.startsWith('/')) {
    return encodePathname(decodePathname(urlPath));
  }

  const resolved = path.resolve(path.dirname(htmlPath), urlPath);
  const relative = path.relative(distDir, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) return;

  return `/${relative.split(path.sep).join('/')}`;
}

function normalizeUrlPath(rawUrl: string): string | undefined {
  const url = rawUrl.replaceAll('&amp;', '&');
  if (!url || url.startsWith('#') || /^(?:https?:|data:|blob:)/i.test(url)) {
    return;
  }

  return url.split('?')[0].split('#')[0] || undefined;
}

function toFilePath(root: string, urlPath: string): string {
  return path.join(root, decodePathname(urlPath).replace(/^\/+/, ''));
}

function decodePathname(urlPath: string): string {
  try {
    return decodeURIComponent(urlPath);
  } catch {
    return urlPath;
  }
}

function encodePathname(urlPath: string): string {
  return urlPath
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/');
}
