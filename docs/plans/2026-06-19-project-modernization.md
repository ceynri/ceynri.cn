# ceynri.cn 项目现代化改造计划

> **For Claude:** REQUIRED SKILL: Use pai:team-driven-development to implement this plan.

**Goal:** 将博客项目从 Astro 5 + Tailwind 3 升级到 Astro 6（保留 Tailwind 3），同步对接上游 ceynri-words 新结构，并建立 `.agents/` AI 资产体系。

**Architecture:** 分为「确定性高的改动」和「不确定/实验性改动」两个阶段。第一阶段完成后交付验收，再处理第二阶段。

**Tech Stack:** Astro 6.x, Tailwind CSS 3.x（暂不升级 4）, Node 22+, pnpm, TypeScript

---

## 项目现状快照

本节提供执行所需的完整上下文，无需依赖对话历史。

### 技术栈版本

| 组件 | 当前版本 | 目标版本 |
|------|---------|---------|
| Node.js | v24.16.0（运行时）/ `.nvmrc` 声明 v20.19.0 | 迁移到 mise，`.mise.toml` 声明 node 24 |
| Astro | 5.7.12 | 6.x（最新） |
| @astrojs/mdx | 4.2.6 | 5.x |
| @astrojs/sitemap | 3.3.1 | 4.x |
| @astrojs/rss | 4.0.11 | 5.x |
| @astrojs/check | 0.9.4 | 0.10+ |
| @astrojs/tailwind | 6.0.2 | **保留**（暂不升 TW4） |
| Tailwind CSS | 3.4.17 | **保留** |
| Vite | 随 Astro 5（v5.x） | 随 Astro 6（v7.x） |

### 关键文件清单

| 文件 | 作用 |
|------|------|
| `astro.config.ts` | Astro 主配置：集成、Vite 插件、Markdown 插件 |
| `src/content.config.ts` | 内容集合定义（blog, pages） |
| `tailwind.config.mjs` | TW3 自定义主题配置 |
| `src/styles/global.scss` | 全局样式入口（含 `@tailwind` 指令） |
| `src/styles/variables.scss` | CSS 变量 + 亮/暗主题 mixin |
| `src/pages/blog/[...slug].astro` | 博客文章路由 |
| `src/utils/published-post-filter.ts` | 发布过滤逻辑 |
| `.nvmrc` | Node 版本声明（将被 `.mise.toml` 替代） |
| `.mise.toml` | mise 工具版本声明（新建） |
| `.gitmodules` | content submodule 配置 |
| `package.json` | 依赖与脚本 |

### 上游 ceynri-words 新结构

content submodule 已重新对接（指向最新 commit `70d9e8d`）。新结构如下：

```
content/
├── blog/           # ✅ 博客文章（26篇）
├── pages/          # ✅ 固定页面
├── poems/          # ✅ 诗歌（9首）— 原项目未定义 collection
├── images/         # ✅ 静态图片资源
├── daily/          # 日记（私有，不发布）
├── digest/         # 外部文章存档
├── inbox/          # 碎想法暂存
├── viewpoints/     # 观点选题
├── memo/           # 备忘
├── thinkmaps/      # 脑图
├── career/         # 工作笔记
├── docs/           # 杂项
└── scripts/        # 工具脚本
```

### 上游 blog frontmatter schema（新增字段加粗）

```yaml
title: string       # 必填
date: date          # 必填
tags: string[]      # 必填
slug: string        # 必填
published: boolean  # 必填
status: enum        # ✨ 新增：seed | draft | evergreen | archived
summary: string     # ✨ 新增：摘要（SEO/列表用）
description: string # 原有
cover_image: string # 原有（相对路径如 '../images/xxx/yyy.jpg'）
lastmod: date       # 可选
createAt: date      # ✨ 新增
comment: boolean    # 可选
layout: enum        # 可选：narrow | normal
cost: string        # ✨ 新增：写作耗时
related: string[]   # ✨ 新增：相关文章
```

### 上游 poems frontmatter schema

```yaml
title: string       # 必填
date: date          # 必填
slug: string        # 必填
published: boolean  # 必填
status: enum        # seed | draft | evergreen | archived
tags: string[]      # 可选
layout: enum        # 可选：narrow
```

---

## Phase A: 确定性高的改动

完成后即可验收，不涉及实验性或兼容性不确定的部分。

---

### Task 1: 使用 mise 管理工具版本 & 更新 Node 版本声明

**Intent:** 将项目的工具版本管理从 nvm（`.nvmrc`）迁移到 mise，同时对齐 Astro 6 的 Node 最低要求。mise 可统一管理 node 和 pnpm 版本。

**Depends on:** None
**Touches:** `.nvmrc`（删除）, `.npmrc`（修改）, `package.json`, `.mise.toml`（新建）

**背景：** mise（https://mise.jdx.dev）是多语言版本管理器，替代 nvm/fnm/corepack 等单一工具。通过项目根目录的 `.mise.toml` 声明所需的 node 和 pnpm 版本，进入目录时自动切换。

**Steps:**
1. 创建 `.mise.toml`：
   ```toml
   [tools]
   node = "24"
   pnpm = "11"
   ```
2. 删除 `.nvmrc`（mise 向下兼容 `.nvmrc`，但既然全面迁移就不保留）
3. 修改 `.npmrc`：删除 `use-node-version=20.19.0`（否则 pnpm 会忽略 mise 提供的 Node 版本），保留 `engine-strict=true`
4. 将 `package.json` 中 `"engines": { "node": ">=20" }` 改为 `"node": ">=22"`
5. 移除 `package.json` 中的 `"packageManager": "pnpm@10.7.0"`（版本管理交给 mise，不再需要 corepack 字段。项目 CI 使用 GitHub Actions，也可以在 workflow 中通过 mise 安装工具）

**Verification:**
- `cat .mise.toml` → 包含 `node = "24"` 和 `pnpm = "11"`
- `.nvmrc` 已不存在
- `.npmrc` 中不含 `use-node-version`
- `mise current` → node 24.x, pnpm 11.x
- `node -v` → v24.x
- `pnpm -v` → v11.x

---

### Task 2: 升级 Astro 6 及官方集成

**Intent:** 执行 Astro 大版本升级，将所有 `@astrojs/*` 包更新到 v6 兼容版本。

**Depends on:** Task 1
**Touches:** `package.json`, `pnpm-lock.yaml`

**Constraints:**
- **保留 `@astrojs/tailwind` 和 `tailwindcss@3`**（不做 TW4 升级）
- `@astrojs/tailwind@6.0.2` 需确认是否兼容 Astro 6。如不兼容需查找替代方案或 pin 版本
- ~~如 `@astrojs/tailwind` 与 Astro 6 不兼容，**回退方案**（具体步骤）：~~ **实际执行结果：`@astrojs/tailwind@6.0.2` 在 Astro 6.4.8 下完全兼容。虽然 npm 的 peerDependencies 未声明 `^6`，但集成实际工作正常（build exit 0，31 页面）。PostCSS 回退方案无需触发。autoprefixer 也被移除了（2026 年无必要）。**
  1. `pnpm remove @astrojs/tailwind`
  2. `pnpm add -D postcss autoprefixer`（tailwindcss@3 已安装）
  3. 从 `astro.config.ts` 的 `integrations` 中移除 `tailwind()`
  4. 创建 `postcss.config.mjs`：
     ```js
     export default {
       plugins: {
         tailwindcss: {},
         autoprefixer: {},
       },
     };
     ```
  5. 确认 `src/styles/global.scss` 中的 `@tailwind base/components/utilities` 仍正常工作（PostCSS 方式下有效）
  6. 在某个全局 layout 中确保 `global.scss` 被导入

**Steps:**
1. 执行 `pnpm dlx @astrojs/upgrade`，观察输出
2. 如果自动升级跳过了部分包或报冲突，手动调整：
   - `astro` → `^6`
   - `@astrojs/mdx` → `^5`
   - `@astrojs/sitemap` → `^4`
   - `@astrojs/rss` → `^5`
   - `@astrojs/check` → 最新
3. **`@astrojs/tailwind`**：先尝试保留当前版本，如果 peerDependency 报错则查看是否有新版本兼容 Astro 6
4. 执行 `pnpm install`
5. 确认无 unmet peer dependency 错误

**Verification:**
- `pnpm list astro` → 6.x
- `pnpm install` 无报错

---

### Task 3: 适配 Astro 6 配置层 Breaking Changes

**Intent:** 修改 `astro.config.ts` 中因 Astro 6 废弃/变更的选项。

**Depends on:** Task 2
**Touches:** `astro.config.ts`

**References:**
- 当前 `astro.config.ts` 内容（见下方完整代码）：
  ```ts
  experimental: {
    responsiveImages: true,  // Astro 6 中可能已稳定或移除
  },
  image: {
    experimentalLayout: 'full-width',  // 前缀 "experimental" 在 v6 可能变化
    experimentalBreakpoints: [750, 1080, 1920, 2560],
  },
  ```
- Astro 6 breaking changes:
  - 移除的 experimental flags: `responsiveImages` 如已稳定则删除 flag 改用正式配置
  - 图片默认行为变化：不再放大、默认裁剪
  - `vite-plugin-entry-shaking`（peer dep `vite >=5.1.0`）可能不兼容 Vite 7

**Steps:**
1. 查阅 Astro 6 文档确认 `experimental.responsiveImages` 状态：
   - 如已稳定 → 移除 `experimental` 包裹，直接使用正式配置
   - 如已移除 → 删除相关配置
   - 如仍为 experimental → 保留
2. 处理 `image.experimentalLayout` / `image.experimentalBreakpoints` → 查看 Astro 6 是否改名
3. **处理 `vite-plugin-entry-shaking`**（必须在本 Task 内解决，不推迟）：
   - 尝试 `pnpm dev`，观察是否报错
   - 如不兼容 Vite 7 → **直接移除**（Astro 6/Vite 7 对 tree-shaking 已有显著改进，lucide-astro/simple-icons-astro 的按需加载可能已无需额外插件）
   - 如兼容 → 保留
4. 升级 `vite-plugin-static-copy` 到最新版（已确认 peerDep 为 `vite ^6 || ^7 || ^8`，兼容）
5. 确认 `sass` 包与 Vite 7 兼容（项目有 8 个 SCSS 文件 + 3 个组件内嵌 `lang="scss"`）：
   - 执行 `pnpm dev` 验证 SCSS 编译无异常
   - 如有问题尝试升级 `sass` 到最新版

**Verification:**
- `pnpm build` 无配置相关报错
- `pnpm dev` 可启动，页面样式正常渲染（含 SCSS 编译的部分）

---

### Task 4: 适配 Astro 6 代码层 Breaking Changes

**Intent:** 修复组件/页面中因 Astro 6 API 变更导致的编译错误。

**Depends on:** Task 3
**Touches:** `src/content.config.ts`, `src/pages/**`, `src/components/**`, `src/layouts/**`

**Astro 6 代码层变更清单（对本项目的影响评估）：**

| 变更 | 本项目是否受影响 | 处理方式 |
|------|:---:|------|
| `z` from `astro:content` → `astro/zod` | ✅ | `content.config.ts` 导入改为 `import { z } from 'astro/zod'` |
| `<ViewTransitions />` → `<ClientRouter />` | ❌ 未使用 | 跳过 |
| `Astro.glob()` 被移除 | ❌ 未使用 | 跳过 |
| `entry.render()` → `render(entry)` | ❌ 已适配新 API | 跳过（项目已使用 `import { render } from 'astro:content'`） |
| `getStaticPaths` params 不接受 number | ❌ 当前用 string | 跳过 |
| `<script>/<style>` 渲染顺序变化 | ❓ 低风险 | 构建后观察是否有样式异常 |
| Shiki CSS 变量名变化 | ❓ 如有代码高亮自定义样式 | 搜索 `--shiki-` 或 `--astro-code-` 确认 |
| Zod 4: `.default()` 需匹配输出类型 | ✅ 检查 schema | 当前 schema 中 `.default(true)` 等均为简单类型，应兼容 |

**Steps:**
1. 修改 `src/content.config.ts`：将 `import { defineCollection, z } from 'astro:content'` 拆为：
   ```ts
   import { defineCollection } from 'astro:content';
   import { z } from 'astro/zod';
   ```
2. 全局搜索 `--shiki-` 和 `--astro-code-`，确认代码高亮样式变量名是否需要更新
3. 尝试构建，根据错误信息逐一修复

**Verification:**
- `pnpm build` 成功（0 errors）
- `pnpm dev` 可正常浏览博客文章页

---

### Task 5: 更新 blog collection schema

**Intent:** 对齐上游 ceynri-words 新增的 frontmatter 字段，避免构建时 schema 校验失败。

**Depends on:** Task 4
**Touches:** `src/content.config.ts`

**当前 blog schema（`src/content.config.ts`）：**
```ts
schema: ({ image }) => z.object({
  title: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()),
  date: z.coerce.date(),
  lastmod: z.coerce.date().optional(),
  cover_image: image().optional(),
  slug: z.string(),
  published: z.boolean().optional().default(true),
  comment: z.boolean().optional().default(true),
  layout: z.enum(['narrow', 'normal']).optional().default('normal'),
}),
```

**需要新增的字段：**
```ts
status: z.enum(['seed', 'draft', 'evergreen', 'archived']).optional(),
summary: z.string().optional(),
related: z.array(z.string()).optional(),
cost: z.string().optional(),
createAt: z.coerce.date().optional(),
```

**Steps:**
1. 在 blog schema 中添加上述 5 个新字段
2. **`cover_image` 类型确认**：上游使用相对路径字符串（如 `'../images/2021-summary/xxx.jpg'`）。Astro 的 `image()` helper 要求图片在 `src/` 下或有对应 loader。由于图片实际位于 `content/images/`（通过 `vite-plugin-static-copy` 映射），`image()` 可能无法正确解析。如果构建报错，改为 `z.string().optional()`
3. 确认构建时所有现有文章通过 schema 校验

**Verification:**
- `pnpm build` 成功
- 无 schema validation 错误

---

### Task 6: 新增 poems collection

**Intent:** 为 `content/poems/` 创建内容集合定义，为后续诗歌页面开发做准备。

**Depends on:** Task 5
**Touches:** `src/content.config.ts`

**Steps:**
1. 在 `src/content.config.ts` 中新增：
   ```ts
   const poems = defineCollection({
     loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './content/poems' }),
     schema: () => z.object({
       title: z.string(),
       date: z.coerce.date(),
       slug: z.string(),
       published: z.boolean().optional().default(true),
       status: z.enum(['seed', 'draft', 'evergreen', 'archived']).optional(),
       tags: z.array(z.string()).optional(),
       layout: z.enum(['narrow', 'normal']).optional(),
     }),
   });
   ```
2. 将 `poems` 添加到 `export const collections = { blog, pages, poems }`
3. 暂不需要创建 poems 路由页面（后续任务）

**Verification:**
- `pnpm build` 成功
- 在构建日志中能看到 poems collection 被识别

---

### Task 7: 建立 `.agents/` AI 资产目录

**Intent:** 创建权威 AI 资产目录并设置 CodeBuddy 软链。

**Depends on:** None（可与 Task 1-6 并行）
**Touches:** `.agents/`, `.codebuddy`（软链接）, `.cursor/rules/`（保留不动）

**Steps:**
1. 创建目录结构：
   ```
   .agents/
   └── rules/
       ├── project-overview.md    # 从 .cursor/rules/project-overview.mdc 转写
       └── development-standard.md # 从 .cursor/rules/development-standard.mdc 转写
   ```
2. 转写规则内容（去掉 `.mdc` 特有的 frontmatter 如 `alwaysApply`，改为通用 markdown）
3. 创建软链接：`ln -s .agents .codebuddy`
4. 保留 `.cursor/rules/` 不动（Cursor 仍需读取自己格式的文件）
5. 在 `.cursor/rules/` 各文件顶部加注释标记源自 `.agents/`

**Verification:**
- `ls -la .codebuddy` → 指向 `.agents`
- `.agents/rules/` 下有 2 个 markdown 文件
- `.cursor/rules/` 保持原样不受影响

---

### Task 8: 更新 .gitignore 和项目元数据

**Intent:** 确保版本控制配置正确，更新 task.md 反映升级后状态。

**Depends on:** Task 7
**Touches:** `.gitignore`, `task.md`

**Steps:**
1. 确认 `.gitignore` 不排除 `.agents/` 和 `.codebuddy`
2. 如果 `.gitignore` 中有不合理的排除项则修正
3. 更新 `task.md`：
   - P1 中标记「升级 Tailwind 4」为暂缓状态
   - 添加备注说明已完成 Astro 6 升级

**Verification:**
- `git status` 中 `.agents/` 目录变更被正确跟踪
- `.codebuddy` 软链接被 git 识别

---

### Task 9: Phase A 全量验收

**Intent:** 确认 Phase A 所有改动完成后项目可正常构建和运行。

**Depends on:** Task 4, Task 6, Task 8
**Touches:** 无新文件

**Steps:**
1. `pnpm install`（确保依赖干净）
2. `pnpm build`（`astro check` + `astro build`）
3. `pnpm preview`（本地预览）
4. 手动验证以下页面：
   - 首页（Flow Field 背景动画）
   - 博客列表页（文章卡片、分页）
   - 博客详情页（Markdown 渲染、代码高亮、图片）
   - 关于页
   - 标签页、归档页
   - 404 页
5. 验证暗色/亮色模式切换
6. 验证 RSS feed（`/feed.xml`）
7. 验证评论系统（Giscus）加载

**Verification:**
- `pnpm build` exit code 0
- 所有页面可正常访问，样式完整
- 浏览器 console 无 JS 错误

---

## Phase B: 不确定/实验性改动（Phase A 验收后执行）

以下任务之间互相独立，可逐个执行并验收。

---

### Task B1: Tailwind 4 升级评估与执行（暂缓）

**Intent:** 评估 TW4 迁移可行性。如确认可行再执行。

**已知阻碍（需逐一确认是否已解决）：**
1. **TW4 与 Sass 不兼容**：TW4 官方明确声明不支持与 Sass 共存。本项目大量使用 SCSS（`variables.scss`, `global.scss`, `prose.scss` 等）
2. **暗色模式 selector 策略**：TW4 用 `@custom-variant dark (...)` 替代 `darkMode: ['selector', '...']`——这个已确认可行
3. **`@layer` 冲突**：TW4 使用 Lightning CSS，与 Sass 的 `@layer` 可能冲突
4. **Astro `<style>` 块隔离**：TW4 中组件 `<style>` 块无法直接使用 `@apply`，需加 `@reference`

**如果决定执行，迁移路线：**
1. 将所有 `.scss` 文件迁移为纯 `.css`（用原生 CSS 变量 + 嵌套替代 Sass 变量 + mixin）
2. 移除 `sass` 依赖
3. 移除 `@astrojs/tailwind`，改用 `@tailwindcss/vite`
4. 将 `tailwind.config.mjs` 内容迁移到 CSS `@theme` 块
5. 逐个修复组件中的 `@apply` 问题

**决策点：** 由用户决定是否执行。如执行，建议在 Phase A 验收通过后单独开 branch。

---

### Task B2: `vite-plugin-entry-shaking` 兼容性处理

**Intent:** 确认该插件在 Vite 7 下是否正常工作，不正常则移除。

**背景：** 该插件最新版 0.5.2（2026年2月发布），peer dep 声明为 `vite >=5.1.0`——这意味着它可能兼容 Vite 7（宽松声明），也可能实际运行出错。

**Steps:**
1. 升级到 Astro 6 后执行 `pnpm dev`
2. 观察 lucide-astro / simple-icons-astro 的导入是否报错
3. 如报错：移除 `vite-plugin-entry-shaking`，测试开发模式请求数量是否可接受
4. 如不报错：保留

**注意：** 此 Task 实际在 Task 3 执行时就会遇到。如果 Task 3 中移除了该插件且开发体验可接受，则此 Task 自动完成。

---

### Task B3: 响应式图片配置适配

**Intent:** 确认 Astro 6 中图片优化配置的正确写法。

**背景：** 当前配置使用 `experimental.responsiveImages` + `image.experimentalLayout` + `image.experimentalBreakpoints`。Astro 6 可能已将其稳定化或改名。

**Steps:**
1. 查阅 Astro 6 文档中 responsive images 的章节
2. 如已稳定：移除 `experimental` 标志，使用正式配置名
3. 如 API 变了：按新 API 重写
4. 如已移除（合并到默认行为）：删除相关配置
5. 构建并检查图片输出是否仍为多尺寸响应式

**注意：** 此 Task 同样会在 Task 3 中触及。可合并处理。

---

## 依赖关系总览

```
Phase A（确定性高，一次完成）:

  Task 1 (Node版本)
    └─ Task 2 (Astro升级)
         └─ Task 3 (配置适配)
              └─ Task 4 (代码适配)
                   ├─ Task 5 (blog schema)
                   │    └─ Task 6 (poems collection)
                   └─────────────── Task 9 (全量验收)

  Task 7 (AI资产) ─── Task 8 (gitignore) ─── Task 9

Phase B（独立实验，逐个验收）:

  Task B1 (TW4 升级) ← 暂缓，用户决策
  Task B2 (entry-shaking) ← 可能在 Task 3 中已解决
  Task B3 (响应式图片) ← 可能在 Task 3 中已解决
```

---

## 执行注意事项

1. **优先保证可构建**：每完成一个 Task 都应 `pnpm build` 确认无回归
2. **Tailwind 保持不动**：Phase A 中不碰 TW 配置和 SCSS 文件，除非 Astro 6 升级强制要求
3. **content submodule 已就绪**：位于 `./content`，指向 commit `70d9e8d`，包含最新的 blog/pages/poems/images 目录
4. **`@astrojs/tailwind` 兼容性是关键风险**：如该包不兼容 Astro 6，按 Task 2 中的回退方案（PostCSS 方式）处理
5. **Sass + Vite 7 兼容性**：项目有 8 个 SCSS 文件、3 个组件使用 `<style lang="scss">`。如 Vite 7 对 Sass 处理有变化（如需要 `sass-embedded` 或新 API），在 Task 3 中升级 `sass` 包解决
6. **Git 操作**：升级过程中的改动不需要自动 commit，等用户验收后统一提交
7. **mise 环境**：执行者环境需已安装 mise。Task 1 完成后，后续 Task 应通过 `mise exec -- pnpm xxx` 或在 mise 激活的 shell 中执行命令
