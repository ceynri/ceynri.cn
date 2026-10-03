import type { HomeThemeId, HomeThemeMeta } from './types';

/**
 * 首页主题注册表：顺序即切换器循环顺序。
 * 新增主题：在此登记 + 创建 src/home-themes/<id>/{index.astro,client.ts}
 * + 在 loader.ts 的 CLIENT_LOADERS 登记动态导入。
 */
export const HOME_THEMES: HomeThemeMeta[] = [
  {
    id: 'night-fishing',
    name: '夜钓',
    credit: { text: '画面致敬《Sonny Boy》第 5 话' },
    bgm: true,
  },
  {
    id: 'flow-field',
    name: '流场',
    credit: {
      text: '背景灵感来自 wangyasai/Perlin-Noise',
      href: 'https://github.com/wangyasai/Perlin-Noise',
    },
  },
];

/**
 * 兜底主题：无 JS / 决策脚本异常时展示的主题。
 * 约定：一般设为最新上线的主题。
 */
export const DEFAULT_THEME: HomeThemeId = 'night-fishing';

/** localStorage 键：记录上一次展示的主题，供下次访问随机时排除，保证连续两次访问不同 */
export const LAST_THEME_KEY = 'home:last-theme';
