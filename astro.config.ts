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

import { rehypeImageLinks, remarkRelateImageLinks } from './src/plugins';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// astro.config.ts 在 Vite 初始化前加载，import.meta.env 不可用
// 需要手动读取 .env 文件
function loadEnvVar(key: string): string | undefined {
  try {
    const envContent = fs.readFileSync(path.resolve(__dirname, '.env'), 'utf-8');
    const match = envContent.match(new RegExp(`^${key}=(.+)$`, 'm'));
    return match?.[1]?.trim();
  } catch {
    return undefined;
  }
}

const contentBase = loadEnvVar('CONTENT_BASE') || './content';
const isLocalContent = !!loadEnvVar('CONTENT_BASE');

/** dev 模式下将 /images 请求代理到本地内容仓库的 images 目录 */
function localContentImageServer() {
  return {
    name: 'local-content-image-server',
    // biome-ignore lint/suspicious/noExplicitAny: Vite 插件类型在 astro config 中不可直接引用
    configureServer(server: any) {
      if (!isLocalContent) return;
      const localImagesDir = path.resolve(contentBase, 'images');
      // biome-ignore lint/suspicious/noExplicitAny: connect middleware 类型不可直接引用
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.url?.startsWith('/images/')) {
          const filePath = path.join(localImagesDir, req.url.slice('/images/'.length));
          if (fs.existsSync(filePath)) {
            res.writeHead(200);
            fs.createReadStream(filePath).pipe(res);
            return;
          }
        }
        next();
      });
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
      localContentImageServer(),
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
        // 转换 markdown 中指向本地图片资源的链接，指定路由路径
        [
          remarkRelateImageLinks,
          {
            targetPath: '/images',
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
