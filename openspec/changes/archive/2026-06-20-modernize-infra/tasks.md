## 1. Tailwind v4 接入与样式范式迁移

- [x] 1.1 安装 `@tailwindcss/vite` 与升级 `tailwindcss`→4，移除 `@astrojs/tailwind`；`astro.config.ts` 改用 Vite 插件方式接入 Tailwind
- [x] 1.2 将 `tailwind.config.mjs` 的 theme（jade 色阶、accent、spacing.prose、textShadow、transitionDuration、text-shadow 插件、darkMode selector）迁移为 CSS `@theme` 与自定义工具类，删除 `tailwind.config.mjs`
- [x] 1.3 将 `src/styles/variables.scss` 迁移为纯 CSS 自定义属性文件（保留亮/暗主题变量与 `--prose-padding` 断点），移除 Sass 变量与 mixin
- [x] 1.4 迁移 `global.scss`/`prose.scss`/`typography.scss`/`index.scss`/`giscus/*` 为 `.css`，`@import`/`@use` 改为 CSS 引入，嵌套保留为原生 CSS 嵌套
- [x] 1.5 改造 3 个内联组件（`pagination.astro`、`menu-button.astro`、`about.astro`）：去掉 `lang="scss"`，能内联工具类的改为 `class`，其余用原生 CSS 嵌套
- [x] 1.6 升级 `tailwind-merge`→3，验证 `~/utils` 的 `cn` 正常工作
- [x] 1.7 卸载 `sass`；运行 `astro build` 并抽查亮/暗主题、断点、prose、giscus 评论区样式无回归

## 2. Biome 取代 ESLint

- [x] 2.1 安装 `@biomejs/biome`，新增 `biome.json`（启用官方 `recommended`，配置 Astro 文件、import 组织、缩进 2、行尾等基础项）
- [x] 2.2 移除 `@antfu/eslint-config`、`eslint`、`eslint-plugin-astro`、`@typescript-eslint/parser`，删除 `eslint.config.js`
- [x] 2.3 `package.json` `lint` 脚本改为 `biome check --write`；全量跑一次并修复产生的问题
- [x] 2.4 实测 `.astro` template 格式化情况；若不完整，对 template 保留 Prettier 兜底并在 `biome.json`/脚本中说明

## 3. 依赖清理与版本对齐

- [x] 3.1 `lucide-astro`→`@lucide/astro`，更新所有 import 与 `vite-plugin-entry-shaking` 的 targets
- [x] 3.2 `package.json` engines 对齐 node 24 / pnpm 11（与 `.mise.toml` 一致）

## 4. CI 质量门禁

- [x] 4.1 新增 `.github/workflows` PR 工作流：安装依赖 → `astro check` → `biome ci` → `astro build`，任一失败即门禁失败
- [x] 4.2 加入内部死链检查（链接 + 图片引用断裂检测），并入门禁
- [x] 4.3 验证：构造一次故意失败（如断链/类型错）确认门禁能拦截

## 5. 文档收口

- [x] 5.1 更新 `AGENTS.md`：移除 Sass/ESLint 表述，写入 Tailwind v4 `@theme`、Biome、工具类优先、CI 门禁约定
- [x] 5.2 将 `task.md` 旧条目中已被本次覆盖的项标注/清理，保留为意图级 backlog
