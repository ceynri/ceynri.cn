# auto-publish-timestamp Specification (delta)

## ADDED Requirements

### Requirement: 首次发布信号判定

系统 SHALL 以「`published: true` 且 frontmatter 缺少 `publishedAt` 字段」作为博客文章「首次发布」的唯一判定信号。该信号必须幂等：一旦 `publishedAt` 被写入，后续任何重跑、重部署、重触发都不得再次改写。

#### Scenario: 草稿翻正首次发布

- **WHEN** 一篇文章由 `published: false` 改为 `published: true`，且此前从未写入 `publishedAt`
- **THEN** 部署流水线在构建前为该文章写入当前时刻的 `publishedAt`

#### Scenario: 已发布文章不重复改写

- **WHEN** 一篇文章已有 `publishedAt`（无论 date-only 或秒级）
- **THEN** 流水线跳过该文章，不修改其 `publishedAt`

#### Scenario: 未发布草稿不写入

- **WHEN** 一篇文章 `published: false`
- **THEN** 流水线不为其写入 `publishedAt`

#### Scenario: 缺省 published 视为已发布

- **WHEN** 一篇文章未声明 `published` 字段（schema 默认 `true`）且无 `publishedAt`
- **THEN** 流水线按首次发布处理，写入 `publishedAt`

### Requirement: 发布时间戳格式

系统 SHALL 以秒级 ISO 8601 且带时区偏移的格式写入新的 `publishedAt`（形如 `2026-08-10T15:42:07+08:00`），时区由部署环境 `TZ` 决定（生产为 `Asia/Shanghai`）。

#### Scenario: 新文章首次发布

- **WHEN** 流水线为一篇首次发布的文章写入 `publishedAt`
- **THEN** 写入值为秒级、含 `±HH:mm` 时区偏移的 ISO 8601 字符串

#### Scenario: 历史 date-only 值保持兼容

- **WHEN** 文章 `publishedAt` 为历史 date-only 值（如 `2021-05-16`）
- **THEN** 系统继续接受该值并视为当日，不回填、不改写

### Requirement: 构建前回写

系统 SHALL 在部署流水线的「代码检出与子模块就绪」之后、「构建」之前执行回写，确保当次构建产物包含新写入的 `publishedAt`。

#### Scenario: 当次部署生效

- **WHEN** 某次部署触发回写并成功推送 `publishedAt`
- **THEN** 同一次部署的构建输出即包含该 `publishedAt`，无需依赖下一次部署

### Requirement: 回写自触发环规避

系统 SHALL 防止「回写 commit 推送」诱发一次内容无实质变化的重复部署。回写 commit 的提交信息 SHALL 携带固定哨兵前缀 `[skip deploy]`；部署流水线在 `push` 事件下，当最新提交信息包含该哨兵时 SHALL 跳过部署。

#### Scenario: 回写提交不再部署

- **WHEN** 回写 step 推送了一个以 `[skip deploy]` 开头的 commit
- **THEN** 由该推送（及其引发的 dispatch）触发的部署流水线被跳过，不执行构建与发布

#### Scenario: 正常内容提交照常部署

- **WHEN** 一次推送的最新提交信息不含 `[skip deploy]`
- **THEN** 部署流水线正常执行

#### Scenario: 并发收敛兜底

- **WHEN** 因任何原因触发了内容无变化的重复部署
- **THEN** 部署并发组（`cancel-in-progress`）使其顶替进行中的部署，保证不出现并发扩散或指数级连锁
