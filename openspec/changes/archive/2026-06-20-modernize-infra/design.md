## Context

站点为 Astro 6 (Vite 7) 的纯 SSG 个人博客，PC 为主、兼容移动端。现状：Tailwind 3 经废弃的 `@astrojs/tailwind` 接入 + Sass 共存；ESLint 用 `@antfu/eslint-config`；无 PR 质量门禁 CI。改造目标是「AI 友好 = AI 最熟的稳定技术 + 机器可校验护栏」，优先级高于追新。Sass 在本项目用法很轻（变量插值生成 CSS 变量、主题 mixin、断点算术、`&` 嵌套），仅 3 个组件内联 `lang="scss"`。

## Goals / Non-Goals

**Goals:**
- 样式收敛为单一范式（Tailwind v4 工具类优先 + 原生 CSS 嵌套 + CSS 变量），消除双范式心智负担
- 工具链收敛为单一 lint+format 工具（Biome），降低配置复杂度
- 建立 PR 质量门禁，使 AI 改动可自验证，减少人工 review
- 清理废弃依赖、对齐版本声明
- UI 与可见行为保持不变（纯基础设施/范式迁移）

**Non-Goals:**
- 不更换框架（Astro 保留）、不引入 Bun 运行时、不手动切 Rolldown（随 Astro 7 stable 跟随上游）
- 不升级 Astro 7（仍 alpha，等 stable）
- 不重写 `p5` 首页动画
- 不回填整站 specs（specs 随后续 change 前向生长）

## Decisions

- **Tailwind v4 + CSS-first `@theme`，移除 `@astrojs/tailwind`**：v4 推荐 `@tailwindcss/vite` 接入，配置从 `tailwind.config.mjs` 迁入 CSS。理由：集成已废弃；CSS-first 让设计 token 与用法同处、声明式，对 AI 友好。备选：保留 `@astrojs/tailwind` + TW3——否，已废弃且与目标背离。
- **彻底移除 Sass**：所用 Sass 特性 100% 可由 CSS 变量 + 原生嵌套 + `@theme` 平替（原生 CSS 嵌套已 baseline，Tailwind v4 底层 Lightning CSS 自动降级/前缀）。理由：AI 接管下 Sass 的人类书写优势不再，单范式更易维护。备选：保留 Sass 处理复杂场景——否，双范式违背收敛目标。
- **样式工具类优先**：能内联 `class` 的尽量内联，`<style>` 尽量清空。理由：样式与结构同处、无命名/跳文件负担，AI 时代最优。
- **`tailwind-merge` 2 → 3**：必须与 Tailwind 大版本对齐，否则 class 合并语义错误且静默。
- **Biome 取代 ESLint**：单 Rust 二进制做 lint+format，用官方 `recommended` 起步，不套重型社区 preset。理由：单工具简单、确定性强、速度快，利于 agent CI 循环；Biome v2.3+ 已原生支持 Astro。类型安全由 `astro check` 兜底，不依赖 lint 的类型感知规则。备选：保留 ESLint / 混合双工具——否，前者放弃红利、后者增复杂度。注：antfu 无 Biome preset，需自建 `biome.json`。
- **CI 质量门禁**：PR 触发 `astro check` + `biome ci` + `astro build` + 死链检查，三绿可合。理由：这是「AI 自验证、人少 review」的真正杠杆。
- **依赖与版本**：`lucide-astro`→`@lucide/astro`（前者已废弃）；engines 对齐 node 24 / pnpm 11（与 `.mise.toml` 一致）。

## Risks / Trade-offs

- [Biome 对 `.astro` template（HTML 部分）格式化可能不完整] → 迁移时实测；必要时 template 格式化保留 Prettier 兜底，lint 仍由 Biome 负责。
- [Tailwind v4 重大版本，工具类/配置语义有破坏性变化] → 分阶段迁移，每阶段以 `astro build` + 视觉抽查验证；保持 UI 不变为硬约束。
- [移除 Sass 后主题/断点行为回归风险] → 先迁 `variables.scss`→CSS 变量/`@theme` 并验证亮暗主题与断点，再逐个改 3 个内联 scss 组件。
- [放弃 antfu 个性化 stylistic 规则] → 接受；AI 接管下一致性比具体风格更重要。

## Migration Plan

1. 样式层：Tailwind v4 接入（`@tailwindcss/vite`）+ `@theme` 迁移 + `tailwind-merge`→3 + 移除 Sass 与 `@astrojs/tailwind`，逐文件验证 UI。
2. Lint 层：引入 Biome + `biome.json`，移除 ESLint 全家桶，`lint` 脚本改 Biome。
3. 依赖/版本：`lucide-astro`→`@lucide/astro`，engines 对齐。
4. 护栏层：新增 PR 质量门禁 CI + 死链检查。
5. 文档：更新 `AGENTS.md`。

回滚：各阶段独立提交；任一阶段 `astro build` 失败或 UI 回归即回退该阶段提交，不影响已合阶段。
