## Why

项目目标是让 AI 能可靠接管开发、人只做方向决策、不再逐行 review。这要求底层是「AI 最熟的稳定技术 + 机器可校验护栏」。当前基础设施有三处与该目标冲突：(1) 样式存在 Tailwind 3 + Sass 两套范式，且 `@astrojs/tailwind` 已废弃；(2) 缺少 PR 质量门禁 CI，AI 改完无法自验证，仍依赖人工确认构建；(3) 部分依赖已废弃、版本声明与实际工具链不一致。

## What Changes

- 升级 Tailwind 3 → 4，改用 CSS-first（`@theme`）+ `@tailwindcss/vite`，移除已废弃的 `@astrojs/tailwind`
- **BREAKING**（开发约定）：彻底移除 Sass，样式统一为 Tailwind 工具类优先 + 原生 CSS 嵌套 + CSS 自定义属性；`variables.scss` 的主题 token 迁移为 CSS 变量 / `@theme`
- `tailwind-merge` 2 → 3（必须对齐 Tailwind 大版本，否则 class 合并静默出错）
- Linter/Formatter：`@antfu/eslint-config` (ESLint) → Biome（单工具 lint+format，官方 recommended 规则集）
- 依赖清理：`lucide-astro`（已废弃）→ `@lucide/astro`
- `package.json` engines 对齐实际工具链：node 24 / pnpm 11
- 新增 PR 质量门禁 CI：`astro check` + `biome ci` + `astro build` + 内部死链检查，三绿方可合
- 更新 `AGENTS.md` 约定（移除 Sass/ESLint 表述，写入 Tailwind v4 / Biome / 工具类优先规范）
- 暂缓（跟随上游）：Astro 7 (Vite 8 / Rolldown) 待 stable 再升级；届时复查 `vite-plugin-entry-shaking`(issue #12793) 与 `vite-plugin-static-copy` 能否移除

## Capabilities

### New Capabilities

- `styling-system`: 站点样式体系的行为契约——设计 token 来源、暗色模式机制、工具类优先策略、不依赖 Sass
- `code-quality-gate`: 变更合入前必须通过的机器可校验质量门禁（类型检查、lint、构建、死链），支撑「AI 自验证、人少 review」

### Modified Capabilities

<!-- 无：本次为基础设施/实现层变更，现有 blog-content 能力的需求不变 -->

## Impact

- 依赖：移除 `@astrojs/tailwind` `sass` `@antfu/eslint-config` `eslint` `eslint-plugin-astro` `@typescript-eslint/parser` `lucide-astro`；新增 `@tailwindcss/vite` `@biomejs/biome` `@lucide/astro`；升级 `tailwindcss`→4、`tailwind-merge`→3
- 配置文件：`astro.config.ts`（tailwind 集成方式）、删除 `tailwind.config.mjs`（迁入 CSS `@theme`）、删除 `eslint.config.js`、新增 `biome.json`、`package.json` engines/scripts、`pnpm-workspace.yaml`
- 样式：`src/styles/*.scss`（5 个文件）、3 个内联 `lang="scss"` 组件（pagination/menu-button/about），以及引用 `~/utils` `cn` 的组件无需改动
- CI：新增 `.github/workflows/` 质量门禁工作流
- 文档：`AGENTS.md`
