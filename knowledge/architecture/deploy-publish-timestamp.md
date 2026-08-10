# 部署链路与首次发布时间回写

## 概述

行为契约以 `openspec/specs/auto-publish-timestamp/spec.md` 为准；本文只记录设计背景、跨仓库关系和易踩坑点。

`publishedAt`（首次发布时刻）不由作者手写，而由部署流水线在**构建前**自动回写：命中「`published: true` 且无 `publishedAt`」的文章，写入当前秒级 ISO 时间戳并推回内容仓库。核心是把「首次发布时间」从易漏、粒度粗的手工维护，转移为构建时可自动推导的元数据。

## 首次发布信号的决策原因

判定信号刻意选「字段缺失」而非「git 文件变更」：

- 草稿长期在 Git 中以 `published: false` 存在（如 `blog/draft/`），文件 add 时间远早于真正发布时间，「added 文件」信号是错的。
- 「`published` 由 false 变 true」虽贴近语义，但需要在 CI 做父提交 diff，且无法覆盖「历史已翻 true 却漏写字段」的存量文章。
- 「无 `publishedAt`」天然幂等——写入一次后信号永久失效，重跑/重部署/重触发都不会二次改写，且自动覆盖存量漏写文章。

## 跨仓库自触发环（关键）

回写会向内容仓库（ceynri-words）push，而内容仓库的 `update-parent-repository.yml` 监听 `push` 且 `paths: blog/**` 命中 frontmatter 改动，会再次 `repository_dispatch` 触发本仓库部署——形成环路。规避要点：

- **闸 A**：回写 commit message 固定前缀 `[skip deploy]`，部署 job 用 `if` 在 `push` 事件下跳过。**哨兵条件必须判 `github.event_name == 'push'`**——dispatch/手动触发无 `head_commit`，直接 `contains` 会因空值短路语义误判。
- **闸 B**：部署 `concurrency` 组（`cancel-in-progress`）兜底，漏网部署最多顶替当前部署，不扩散。
- **单写者**：`publishedAt` 只由主仓库部署流水线写，内容仓库自身不写，避免多写者竞争。

## 注意事项

- **哨兵是约定不是机制**：`[skip deploy]` 靠字符串匹配，任何含该子串的 push commit 都会跳过部署。勿在正常提交里误用；改动哨兵词需同步改 workflow 守卫。
- **时间戳粒度有意不一致**：历史 date-only 值（如 `2021-05-16`）保留原样视为当日，新写入为秒级带时区。刻意**不**用「git 首 commit 时间」回填历史——commit 时间是版本副作用，不是作者表达的发布时间。
- **脚本零依赖是有意为之**：用行锚定正则插入，不用 YAML 库，以免重排键序/丢注释污染 diff。代价是对极端 frontmatter 结构容错有限，靠本地真实数据 dry-run 兜底核验。
- **内容仓库无需改动**：破环完全在主仓库侧完成。

## 相关文档

- [内容图片与原图链接链路](content-image-assets.md) — 同属 ceynri-words 上游/下游消费关系，内容源路径解析（`CONTENT_BASE`）约定一致
