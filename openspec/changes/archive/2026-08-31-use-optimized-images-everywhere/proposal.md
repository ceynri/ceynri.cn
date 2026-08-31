## Why

本站意图是「正文图与 AI 可读内容不对外暴露原图，只发布 Astro 优化后的图片」。但当前实现不彻底：

1. **AI 可读孪生**的正文图因拿不到可用的优化图 URL，只能降级为 `（图：alt）` 文本占位——AI 读者完全看不到图，信息受损。
2. 「查看原图」链接与 floating image 仍指向原图（这部分经评估后**决定保留**，见下）。

根因是缺少一条「内容源图片 → 发布优化图 URL」的可靠映射。本变更补齐这条映射，让**正文图与孪生**指向优化图。

> 范围说明（用户决策）：「查看原图」链接 + floating image **保留原图**。因链接指向的图不在 Astro content 图片映射中（content layer 只收集正文 `image` 节点，不收集 `link` 节点），无法经现有管线优化，强行接入成本高、收益低。故本变更的「不暴露原图」仅覆盖正文图与孪生；链接图的优化与原图机制拆除留作后续独立变更。

## What Changes

- **建立「源图 → 优化图」映射机制**：复用 Astro content 管线维护的图片元数据映射（`imageAssetMap`）+ 官方 `getImage`，为给定的内容源正文图片产出确定的发布优化图 URL。
- **AI 可读孪生正文图**：由文本占位升级为优化图 URL（Markdown `![alt](优化图)`）。
- **「查看原图」链接 + floating image**：**保留原图**，不改。

## Capabilities

### New Capabilities

- `optimized-image-resolution`: 提供「内容源正文图片 → 发布优化图 URL」解析机制，供独立 endpoint（Markdown 孪生）复用，屏蔽 Astro 图片管线的内部细节与版本耦合。

### Modified Capabilities

- `ai-readable-content`: 孪生正文图由文本占位升级为优化图 URL，替换当前的 interim 占位行为；本地图片链接维持「去链接留文字」的 interim 降级。

## Impact

- **代码**：新增 `src/plugins/content-image-resolver/` 模块；改 `src/plugins/sanitize-markdown.ts`（图片处理，注入 `resolveImage`）、`src/pages/blog/[...slug].md.ts`（接入 resolver）；`src/plugins/index.ts` 导出。
- **构建/管线**：依赖 Astro 图片优化产物（`/assets/*.webp`）的生成时机与可寻址性。
- **风险**：依赖 Astro 内部 API（`astro:asset-imports`、`getImage`、importId 约定），跨版本可能变；以锁版本 + 单测 importId 一致性 + build 产物校验对冲。
- **测试**：resolver 纯逻辑单测（importId 拼接、SVG/GIF 判定）；sanitize-markdown 图片断言（占位 → 优化图 URL）。
