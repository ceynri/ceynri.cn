import { DEFAULT_THEME, HOME_THEMES, LAST_THEME_KEY } from './registry';
import type { HomeThemeChangeDetail, HomeThemeClient, HomeThemeId } from './types';

/**
 * 首页主题加载器：激活 head 内联脚本决策的主题，并接管后续的运行时切换。
 * 各主题 client 经动态 import 懒加载（Vite 依据静态路径分包，未激活主题一行代码都不下载）。
 * 新增主题需同步在此登记（与 registry.ts 对应）。
 */
const CLIENT_LOADERS: Record<HomeThemeId, () => Promise<{ default: HomeThemeClient }>> = {
  'night-fishing': () => import('./night-fishing/client'),
  'flow-field': () => import('./flow-field/client'),
};

const themeIds = HOME_THEMES.map((theme) => theme.id);

/** 初始化首页主题系统：激活当前主题并绑定切换器。由 pages/index.astro 调用 */
export function initThemeLoader() {
  const root = document.documentElement;
  const initial = root.dataset.homeTheme as HomeThemeId | undefined;
  let currentId: HomeThemeId = initial && themeIds.includes(initial) ? initial : DEFAULT_THEME;

  const instances = new Map<HomeThemeId, HomeThemeClient>();
  /** 激活序号：快速连切时丢弃过期的异步激活结果 */
  let activateSeq = 0;

  const activate = async (id: HomeThemeId) => {
    const seq = ++activateSeq;
    const mod = await CLIENT_LOADERS[id]();
    if (seq !== activateSeq) {
      return;
    }
    let client = instances.get(id);
    if (!client) {
      client = mod.default;
      instances.set(id, client);
    }
    client.activate();
  };

  const nextId = () => themeIds[(themeIds.indexOf(currentId) + 1) % themeIds.length];

  const renderSwitcher = () => {
    const meta = HOME_THEMES.find((theme) => theme.id === currentId);
    const next = HOME_THEMES.find((theme) => theme.id === nextId());
    if (meta) {
      for (const nameEl of document.querySelectorAll('[data-theme-switch-name]')) {
        nameEl.textContent = meta.name;
      }
    }
    if (next) {
      const label = `切换到「${next.name}」主题`;
      for (const button of document.querySelectorAll('[data-theme-switch]')) {
        button.setAttribute('aria-label', label);
        button.setAttribute('title', label);
      }
    }
  };

  const switchTo = (id: HomeThemeId) => {
    if (id === currentId) {
      return;
    }
    const prev = currentId;
    currentId = id;
    instances.get(prev)?.deactivate();
    root.dataset.homeTheme = id;
    try {
      localStorage.setItem(LAST_THEME_KEY, id);
    } catch {
      // 隐私模式等场景下写入失败不影响切换
    }
    renderSwitcher();
    void activate(id);
    window.dispatchEvent(new CustomEvent<HomeThemeChangeDetail>('home:themechange', { detail: { id, prev } }));
    window.umami?.track('home-theme-switch', { theme: id });
  };

  for (const button of document.querySelectorAll('[data-theme-switch]')) {
    button.addEventListener('click', () => {
      switchTo(nextId());
    });
  }

  renderSwitcher();
  void activate(currentId);
}
