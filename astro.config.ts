import type { Element } from 'hast';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import { defineConfig } from 'astro/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import rehypeExternalLinks from 'rehype-external-links';
import viteEntryShaking from 'vite-plugin-entry-shaking';
import { viteStaticCopy } from 'vite-plugin-static-copy';

import { rehypeImageLinks, remarkRelateImageLinks } from './src/plugins';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://astro.build/config
export default defineConfig({
  site: 'https://ceynri.cn',
  integrations: [
    mdx(),
    sitemap(),
    tailwind(),
  ],
  server: {
    host: true,
    port: 4321,
  },
  vite: {
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './src'),
      },
    },
    plugins: [
      // 实现开发时的按需加载
      // issue: https://github.com/withastro/astro/issues/12793
      viteEntryShaking({
        targets: [
          'lucide-astro',
          'simple-icons-astro',
        ],
      }),
      // 将 content/images 目录下的资源可通过 /images 路径访问
      viteStaticCopy({
        targets: [
          {
            src: 'content/images/**/*',
            dest: 'images',
          },
        ],
      }),
    ],
  },
  build: {
    assets: 'assets',
  },
  prefetch: true,
  markdown: {
    remarkPlugins: [
      // 转换 markdown 中指向本地图片资源的链接，指定路由路径
      [remarkRelateImageLinks, {
        sourceDir: './content/images',
        targetPath: '/images',
      }],
    ],
    rehypePlugins: [
      // 外部链接通过新标签页打开
      [rehypeExternalLinks, {
        target: '_blank',
        rel: ['noopener'],
        test: (element: Element) => {
          const href = element.properties.href;
          return typeof href === 'string'
            && href.startsWith('http')
            && !href.startsWith('https://ceynri.cn/');
        },
      }],
      // 自动为指向图片资源的链接添加 data-image-link 属性
      rehypeImageLinks,
    ],
  },
  experimental: {
    // 启用全局的响应式图片优化
    // https://docs.astro.build/zh-cn/reference/experimental-flags/responsive-images/
    responsiveImages: true,
  },
  image: {
    // 将图像尺寸自适应优化用于所有的 Image、Picture 以及 Markdown 图像
    experimentalLayout: 'full-width',
  },
});
