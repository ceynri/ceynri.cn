# blog-content Specification (delta)

## MODIFIED Requirements

### Requirement: 博客文章 frontmatter 校验

系统 SHALL 通过 Zod schema 校验 `content/blog` 下所有 `.md`/`.mdx` 文章的 frontmatter，校验失败时构建必须报错而非静默通过。其中 `publishedAt` 为可选字段，表示文章首次发布时刻；系统 SHALL 同时接受 date-only（`2021-05-16`，视为当日）与秒级带时区（`2026-08-10T15:42:07+08:00`）两种粒度。

#### Scenario: 必填字段缺失

- **WHEN** 一篇文章缺少 `title`、`tags`、`date` 或 `slug` 中任意必填字段
- **THEN** `astro check` / 构建报错并指明缺失字段，不产出该页面

#### Scenario: 枚举字段取值非法

- **WHEN** `layout` 不属于 `narrow | normal`
- **THEN** 构建报错并指明非法取值

#### Scenario: 合法 frontmatter

- **WHEN** 文章提供全部必填字段且枚举取值合法
- **THEN** 校验通过，可选字段缺省时应用默认值（`published=true`、`comment=true`、`layout=normal`）

#### Scenario: publishedAt 两种粒度兼容

- **WHEN** 文章 `publishedAt` 为 date-only 或秒级带时区 ISO 字符串
- **THEN** schema 校验通过，`publishedAt` 被正确解析为日期对象
