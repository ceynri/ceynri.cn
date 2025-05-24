import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import { defineConfig } from 'astro/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import rehypeExternalLinks from 'rehype-external-links';
import EntryShakingPlugin from 'vite-plugin-entry-shaking';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://astro.build/config
export default defineConfig({
  site: 'https://ceynri.cn',
  integrations: [mdx(), sitemap(), tailwind()],
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
      // issue: https://github.com/withastro/astro/issues/12793
      EntryShakingPlugin({
        targets: [
          'lucide-astro',
          'simple-icons-astro',
        ],
      }),
    ],
  },
  prefetch: true,
  markdown: {
    rehypePlugins: [
      [
        rehypeExternalLinks,
        {
          target: '_blank',
          rel: ['noopener', 'noreferrer'],
        },
      ],
    ],
  },
  experimental: {
    // https://docs.astro.build/zh-cn/reference/experimental-flags/responsive-images/
    responsiveImages: true,
  },
  image: {
    // 将图像尺寸自适应优化用于所有的 Image、Picture 以及 Markdown 图像
    experimentalLayout: 'full-width',
  },
});
