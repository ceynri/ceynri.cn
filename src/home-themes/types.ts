/** 首页主题 ID（与 src/home-themes/<id>/ 目录名一致） */
export type HomeThemeId = 'night-fishing' | 'flow-field';

/** 首页主题的注册信息 */
export interface HomeThemeMeta {
  id: HomeThemeId;
  /** 切换器等 UI 中展示的名称 */
  name: string;
  /** 右下角主题说明（致敬 / 出处）；href 存在时渲染为外链 */
  credit: {
    text: string;
    href?: string;
  };
  /** 是否具备 BGM 能力（决定左下 dock 是否显示播放器） */
  bgm?: boolean;
}

/**
 * 主题客户端模块约定：src/home-themes/<id>/client.ts 以 default 导出此接口。
 * 主题的 DOM 由 index.astro 服务端渲染，client 只负责行为（背景引擎、交互）。
 */
export interface HomeThemeClient {
  /** 激活主题：首次调用完成初始化，之后的调用为恢复（暂停 → 继续） */
  activate: () => void;
  /** 失活主题：暂停渲染与交互，保留状态以便下次激活时恢复 */
  deactivate: () => void;
}

/** 主题切换事件（home:themechange）的 detail */
export interface HomeThemeChangeDetail {
  id: HomeThemeId;
  prev: HomeThemeId;
}
