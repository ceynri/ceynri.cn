import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { unified } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import type { Element } from 'hast';
import rehypeExternalLinks from 'rehype-external-links';
import viteEntryShaking from 'vite-plugin-entry-shaking';

import {
  getManifest,
  isLocalImageAsset,
  rehypeImageLinks,
  remarkContentAssets,
  resolveContentBase,
} from './src/plugins';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contentBase = resolveContentBase(__dirname);

const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
};

/** dev 模式下将内容资源 URL 代理到本地内容源 */
function contentAssetDevServer() {
  return {
    name: 'content-asset-dev-server',
    // biome-ignore lint/suspicious/noExplicitAny: Vite 插件类型在 astro config 中不可直接引用
    configureServer(server: any) {
      // biome-ignore lint/suspicious/noExplicitAny: connect middleware 类型不可直接引用
      server.middlewares.use((req: any, res: any, next: any) => {
        const rawUrl = req.url as string | undefined;
        if (!rawUrl) return next();

        // 去除 query string（Vite 可能附加 ?v=xxx 等）
        const url = rawUrl.split('?')[0];

        if (!isLocalImageAsset(url)) return next();

        const filePath = path.join(contentBase, url);
        if (fs.existsSync(filePath)) {
          const ext = path.extname(url).toLowerCase();
          const contentType = MIME_TYPES[ext] || 'application/octet-stream';
          res.writeHead(200, { 'Content-Type': contentType });
          fs.createReadStream(filePath).pipe(res);
          return;
        }
        next();
      });
    },
  };
}

/**
 * build 完成后将 manifest 中收集的资源 copy 到 dist 目录
 */
function contentAssetBuildPlugin() {
  return {
    name: 'content-asset-build',
    closeBundle() {
      const manifest = getManifest();
      if (manifest.size === 0) return;

      const distDir = path.resolve(__dirname, 'dist');
      for (const [, asset] of manifest) {
        const destPath = path.join(distDir, asset.outputUrl);
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
        fs.copyFileSync(asset.sourcePath, destPath);
      }
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site: 'https://ceynri.cn',
  integrations: [mdx(), sitemap()],
  server: {
    host: true,
    port: 4321,
  },
  security: {
    // 允许 giscus iframe 跨域请求 dev server 上的主题 CSS
    // dev server 默认拦截 Sec-Fetch-Site: cross-site 的子资源请求，将其加入白名单放行
    allowedDomains: [{ hostname: 'giscus.app' }],
  },
  vite: {
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './src'),
      },
    },
    plugins: [
      tailwindcss(),
      contentAssetDevServer(),
      contentAssetBuildPlugin(),
      // 实现开发时的按需加载
      // issue: https://github.com/withastro/astro/issues/12793
      viteEntryShaking({
        targets: ['@lucide/astro', 'simple-icons-astro'],
      }),
    ],
  },
  build: {
    assets: 'assets',
  },
  prefetch: true,
  markdown: {
    processor: unified({
      remarkPlugins: [
        // 解析、校验、收集和改写 Markdown 中本地图片资源引用
        [
          remarkContentAssets,
          {
            contentBase,
          },
        ],
      ],
      rehypePlugins: [
        // 外部链接通过新标签页打开
        [
          rehypeExternalLinks,
          {
            target: '_blank',
            rel: ['noopener'],
            test: (element: Element) => {
              const href = element.properties.href;
              return typeof href === 'string' && href.startsWith('http') && !href.startsWith('https://ceynri.cn/');
            },
          },
        ],
        // 自动为指向图片资源的链接添加 data-image-link 属性
        rehypeImageLinks,
      ],
    }),
  },
  image: {
    // 将图像尺寸自适应优化用于所有的 Image、Picture 以及 Markdown 图像
    layout: 'full-width',
    breakpoints: [750, 1080, 1920, 2560],
  },
});
