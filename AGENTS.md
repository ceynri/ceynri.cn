# ceynri.cn

个人博客网站，PC Web 为主、兼容移动端。当前 v3，基于 Astro 重构（v2 为 Gridsome，v1 归档于 v1 分支）。重构目标：UI 基本不变的前提下切换底层框架、提升开发体验与可维护性。

> 目录结构变动时同步更新本文件。

## 技术栈与环境

- **框架**：Astro v6（构建底层 Vite 7），纯 SSG
- **样式**：Tailwind CSS v4（CSS-first，经 `@tailwindcss/vite` 接入）；设计 token 通过 `@theme` 定义在 `src/styles/main.css`；不使用 Sass
- **代码规范**：Biome（lint + format，`biome.json`），TypeScript 严格模式（`astro check` 兜底类型安全）
- **包管理**：pnpm（强制，禁用 npm/yarn）；工具版本由 mise 管理（`.mise.toml`，node 24 / pnpm 11）
- **CI**：PR 质量门禁（`.github/workflows/ci.yml`）：`astro check` → `biome ci` → `astro build` → 死链检查，四绿方可合
- 原生依赖需在 `pnpm-workspace.yaml` 的 `allowBuilds` 中声明

## 开发命令

```bash
pnpm dev      # http://localhost:4321
pnpm build    # astro check + astro build
pnpm lint     # biome check --write
```

### 本地内容源

项目通过 `.env`（gitignored）配置 `CONTENT_BASE` 指向本地 content 项目工作区，使 dev 时可直接预览未提交的内容改动：

```env
CONTENT_BASE=/xxx/workspace/content
```

未配置时默认使用当前工作区的 `./content`。

## 目录结构

- `src/`：`components/`（通用组件）、`layouts/`、`pages/`（含 `blog/`）、`styles/`（含 `main.css` 入口 + `variables.css`）、`utils/`（含 `flow-field/` 首页动画）、`plugins/`、`content.config.ts`
- `content/`：内容源 submodule（ceynri-words），`blog/`/`pages/`/`poems/` 对外发布，其余为私有。ceynri-words 是上游内容库，ceynri.cn 是下游消费者——只发布公开内容及其显式引用的图片资源闭包
- `public/`：直出静态资源（内容图片不再依赖 `public/images` symlink，由 content asset pipeline 在 dev/build 时按需 serve/copy）
- `openspec/`：OpenSpec spec-driven 变更管理（`specs/` 活规范 + `changes/` 变更）

## 任务管理

使用 OpenSpec spec-driven workflow：`/opsx:propose` → `/opsx:apply` → `/opsx:archive`。`task.md` 仅保留意图级 backlog。

## 项目知识库

修改业务代码前，先查阅 `knowledge/README.md` 中的知识索引表，根据“使用场景”列判断是否有相关文档需要读取。OpenSpec 负责能力契约，knowledge 负责设计背景与踩坑提示。

## 代码约定

仅记录本项目特有约定。通用最佳实践依赖 AI 既有认知。

**命名与结构**：文件/目录用 kebab-case；目录有 `index.ts` 时，新建文件需同步导出；可复用 UI → `components/`，页面专用内容 → `pages/`；`utils/` 一个文件导出一个方法，方法名与文件名对应。

**组件**：优先 `.astro`；未集成 React/Vue/Svelte，引入前先确认；props 用 TypeScript interface，数据经 `Astro.props` 传递；组合外部 class 用 `~/utils` 的 `cn`：`class={cn('foo', Astro.props.class)}`。

**样式（工具类优先）**：能用 Tailwind 工具类表达的样式 SHALL 内联到 `class`，`<style>` 块仅承载工具类难以表达的少量样式（使用原生 CSS 嵌套）。颜色优先用语义色工具类（如 `bg-prose-bg`/`text-title`，由 `main.css` 的 `@theme inline` 注册、值取自 `variables.css`）；新增语义色须先在 `variables.css` 定义、再于 `main.css` `@theme inline` 注册（用 inline 才能运行时跟随 `data-scheme` 切换），禁止硬编码颜色及 `bg-[var(--xxx)]` 任意值写法。CSS 变量设置背景/阴影时加 `transition`（如 `transition-[background-color]`）；font-weight 直接写数值（如 `font-[500]`）；响应式以 PC 为基准，移动端用 `max-sm`/`max-lg`；meta 统一经 `BaseHead` 处理。

**注释**：代码注释用中文，README、commit message 用英文；方法用 `/** */` 以获得代码提示。
