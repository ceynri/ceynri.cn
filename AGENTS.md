# ceynri.cn

个人博客网站，PC Web 为主、兼容移动端。当前 v3，基于 Astro 重构（v2 为 Gridsome，v1 归档于 v1 分支）。重构目标：UI 基本不变的前提下切换底层框架、提升开发体验与可维护性。

> 目录结构变动时同步更新本文件。

## 技术栈与环境

- **框架**：Astro v6（构建底层 Vite 7）
- **样式**：TailwindCSS v3（经 PostCSS 处理，未升级 v4）+ SASS
- **包管理**：pnpm（强制，禁用 npm/yarn）；工具版本由 mise 管理（`.mise.toml`，node 24 / pnpm 11）
- **代码规范**：ESLint + Prettier（@antfu/eslint-config），TypeScript 严格模式
- 原生依赖需在 `pnpm-workspace.yaml` 的 `onlyBuiltDependencies` 中声明

## 开发命令

```bash
pnpm dev      # http://localhost:4321
pnpm build    # astro check + astro build
pnpm lint     # eslint --fix
```

## 目录结构

- `src/`：`components/`（通用组件）、`layouts/`、`pages/`（含 `blog/`）、`styles/`（含 `variables.scss`）、`utils/`（含 `flow-field/` 首页动画）、`plugins/`、`content.config.ts`
- `content/`：内容源 submodule（ceynri-words），`blog/`/`pages/`/`poems/` 对外发布，其余为私有
- `public/`：直出静态资源
- `task.md` / `task-completed.md`：开发任务路线图与归档

## 任务管理

`task.md` 按 P0–P3 分级：新增大功能点时录入并拆为可执行小任务；完成时勾选；大功能点整体完成后移到 `task-completed.md`。

## 代码约定

仅记录本项目特有约定。通用最佳实践依赖 AI 既有认知。

**命名与结构**：文件/目录用 kebab-case；目录有 `index.ts` 时，新建文件需同步导出；可复用 UI → `components/`，页面专用内容 → `pages/`；`utils/` 一个文件导出一个方法，方法名与文件名对应。

**组件**：优先 `.astro`；未集成 React/Vue/Svelte，引入前先确认；props 用 TypeScript interface，数据经 `Astro.props` 传递；组合外部 class 用 `~/utils` 的 `cn`：`class={cn('foo', Astro.props.class)}`。

**样式**：优先 TailwindCSS；颜色只用 `src/styles/variables.scss` 定义的 CSS 变量，禁止用未定义的；CSS 变量设置背景/阴影时加 `transition`（如 `transition-[background-color]`）；font-weight 直接写数值（如 `font-[500]`）；响应式以 PC 为基准，移动端用 `max-sm`/`max-lg`；meta 统一经 `BaseHead` 处理。

**注释**：代码注释用中文，README、commit message 用英文；方法用 `/** */` 以获得代码提示。
