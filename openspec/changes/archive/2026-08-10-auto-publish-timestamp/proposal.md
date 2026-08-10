## Why

博客文章的 `publishedAt`（首次发布时间）目前完全依赖手工维护：作者把草稿的 `published` 翻为 `true` 时，需要记得同时手写一个 `publishedAt`。这导致两类问题——新文章常常忘记加（全库 20 篇有、其余缺失），且已有值粒度仅为 `yyyy-mm-dd`（date-only），无法表达精确发布时刻。`publishedAt` 本应是构建流水线可自动推导的元数据，不该由人维护。

## What Changes

- 在部署流水线（`deploy-tencent-cos.yml`）的「checkout + 子模块就绪」之后、「build」之前，插入一个自动化 step：扫描内容源中 `published: true` 且**缺少 `publishedAt`** 的博客文章，把当前时刻（秒级、带时区的 ISO 8601，如 `2026-08-10T15:42:07+08:00`）写入其 frontmatter，并在内容仓库内提交推送。
- 新增零依赖脚本 `scripts/backfill-published-at.mjs` 承载扫描与回写逻辑，支持 dry-run，CI 与本地均可运行。
- 为该回写 commit 约定固定哨兵前缀 `[skip deploy]`，部署流水线在 `push` 触发时据此跳过，打破「回写 → dispatch → 再部署」的环路。
- 历史已有的 date-only `publishedAt` 值**保持不变**，不回填、不改写；仅对「首次发布」的新文章写入秒级时间戳。

## Capabilities

### New Capabilities
- `auto-publish-timestamp`: 定义「首次发布时间」的自动捕获——以 `published=true 且无 publishedAt` 为首次发布信号，在部署构建前回写秒级 `publishedAt`，并通过提交信息哨兵与并发控制规避流水线自触发环。

### Modified Capabilities
- `blog-content`: 补充 `publishedAt` 的粒度契约——历史上为 date-only（视为当日），新增写入为秒级 ISO 8601（带时区），两种粒度均被 schema 接受。

## Impact

- Affected CI：`.github/workflows/deploy-tencent-cos.yml`（新增回写 step、`push` 触发加哨兵守卫）。
- New script：`scripts/backfill-published-at.mjs`（零依赖，Node 24 直接运行）。
- Affected content：`content/blog/**` 中首次发布的文章 frontmatter 将被自动补写 `publishedAt`。
- Content repo（ceynri-words）：其 `update-parent-repository.yml` 的 `paths: blog/**` 触发条件意味着回写 commit 会再次 dispatch，依赖主仓库哨兵守卫短路，**content 仓库无需改动**。
- 不影响 schema、不影响 RSS 兜底逻辑（`publishedAt || date`），向后兼容。
