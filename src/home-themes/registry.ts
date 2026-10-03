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
 * 未记住主题、以及无 JS / 决策脚本异常时展示的主题。
 * 用户从未主动切换时，每次进入都是这个主题。
 */
export const DEFAULT_THEME: HomeThemeId = 'night-fishing';

/**
 * localStorage 键：用户主动切换后记住的主题。
 * 只在点击切换器时写入；未写入或值无效时回退到 DEFAULT_THEME。
 * 与旧键 home:last-theme 分开——旧键由「每次刷新避开上次」写入，不代表用户选择。
 */
export const SAVED_THEME_KEY = 'home:theme';
