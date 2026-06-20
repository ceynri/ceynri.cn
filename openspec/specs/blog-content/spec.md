# blog-content Specification

## Purpose

定义博客文章内容的数据契约与发布规则。内容源为 `content/` submodule（ceynri-words），由 Astro Content Collections（`src/content.config.ts`）以 Zod schema 强校验。本规范描述「站点当前应有」的内容行为，是 AI 接管时的权威真相来源。

## Requirements

### Requirement: 博客文章 frontmatter 校验

系统 SHALL 通过 Zod schema 校验 `content/blog` 下所有 `.md`/`.mdx` 文章的 frontmatter，校验失败时构建必须报错而非静默通过。

#### Scenario: 必填字段缺失

- **WHEN** 一篇文章缺少 `title`、`tags`、`date` 或 `slug` 中任意必填字段
- **THEN** `astro check` / 构建报错并指明缺失字段，不产出该页面

#### Scenario: 枚举字段取值非法

- **WHEN** `status` 不属于 `seed | draft | evergreen | archived`，或 `layout` 不属于 `narrow | normal`
- **THEN** 构建报错并指明非法取值

#### Scenario: 合法 frontmatter

- **WHEN** 文章提供全部必填字段且枚举取值合法
- **THEN** 校验通过，可选字段缺省时应用默认值（`published=true`、`comment=true`、`layout=normal`）

### Requirement: 草稿与未发布内容隔离

系统 SHALL 依据 `published` 字段决定内容是否对外可见。

#### Scenario: 未发布文章

- **WHEN** 文章 `published` 为 `false`
- **THEN** 该文章不出现在生产构建的列表页、RSS 与站点地图中

### Requirement: 下划线前缀文件忽略

系统 SHALL 跳过文件名以 `_` 开头的内容文件，不将其作为可发布内容加载。

#### Scenario: 私有草稿文件

- **WHEN** `content/blog` 下存在以 `_` 开头的 `.md`/`.mdx` 文件
- **THEN** 该文件不被 Content Collection 加载，也不产出页面

### Requirement: 上游内容源关系

系统 SHALL 将 `ceynri-words` 视为上游内容源，`ceynri.cn` 为下游消费者，只消费选定公开内容。

#### Scenario: 默认内容源

- **WHEN** 未配置本地内容源覆盖
- **THEN** 系统从仓库 `content/` submodule 消费内容

#### Scenario: 本地内容源覆盖

- **WHEN** 开发时通过 `CONTENT_BASE` 配置本地内容源覆盖
- **THEN** 系统从该本地 `ceynri-words` 工作树消费相同公开集合，无需先提交上游

### Requirement: 公开博客资产闭包

系统 SHALL 仅发布公开博客内容显式引用到的图片资产。

#### Scenario: 已发布博客引用图片资产

- **WHEN** 博客文章公开且其 Markdown 内容引用了本地图片资产
- **THEN** 公开站点输出包含该被引用图片

#### Scenario: 未发布博客引用图片资产

- **WHEN** 博客文章未公开且其 Markdown 内容引用了本地图片资产
- **THEN** 该图片不会仅因未发布文章引用而被发布
