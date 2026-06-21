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

import { contentAssetsIntegration, rehypeImageLinks, remarkContentImageLinks, resolveContentBase } from './src/plugins';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contentBase = resolveContentBase(__dirname);

// https://astro.build/config
export default defineConfig({
  site: 'https://ceynri.cn',
  integrations: [mdx(), sitemap(), contentAssetsIntegration({ contentBase })],
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
        // 只发布 Markdown link 中的本地图片原图；正文图片保留给 Astro 优化
        [
          remarkContentImageLinks,
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
