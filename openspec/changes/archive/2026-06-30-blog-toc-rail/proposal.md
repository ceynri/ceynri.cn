## Why

博客文章页目前是居中单栏、无任何页内导航，长文阅读时无法快速定位章节、也看不出当前读到哪、还剩多少。需要一个**克制、不打扰正文阅读**的页内目录，同时具备「随时跳转」与「阅读进度感知」两层价值。

## What Changes

- 新增一个 **PC 端轨道式目录（TOC rail）** 能力，仅在 blog 文章页渲染：
  - 收起态：右侧 `fixed`、相对视口垂直居中的一组纯线条（H2 长线、H3 短线 + 一级缩进），存在感低。
  - hover 态：鼠标移入轨道 → 向左展开文字目录浮层，覆盖正文之上，点击行平滑跳转到对应章节。
  - **二维进度**：把当前视口窗口投影到正文，得到一段跨线的高亮带（边界线按可见比例部分填充）；高亮带中点在轨道内居中（开头钉上半、结尾沉下半的头尾钳制）。
  - 底部一个右对齐、低存在感的纯文字阅读百分比（以窗口中线为焦点、以正文范围为基准）。
- 采集层级**可配置**：读文章 FrontMatter 字段逐文覆盖，全局默认到 H3。
- 渲染**有门槛**：仅 blog；正文标题数低于阈值不渲染；视口宽度低于断点（本项目 1024px）不挂载。
- 组织成**自包含、配置驱动、可抽取发布**的独立模块（纯逻辑零依赖 + 薄 Astro 组件壳 + CSS 变量主题），移动端**明确不在本能力范围内**。
- 依赖 markdown 标题 `id`（锚点跳转前提）。**经实现首步验证**：Astro 内置 `@astrojs/markdown-remark` 的 `unified()` 管线无条件 `use(rehypeHeadingIds)`，自定义 `markdown.processor` 仅追加插件、未旁路它——标题 `id` 与 `render().headings` 均可用，**无需引入 `rehype-slug`**。

## Capabilities

### New Capabilities
- `blog-toc`: 博客文章页的 PC 端页内目录能力——轨道式收起态、hover 文字浮层、视口窗口投影的二维阅读进度、可配置采集层级与渲染门槛。

### Modified Capabilities
<!-- 无既有能力的需求级变更；标题 id 生成属实现接入，不改 blog-content 的规范行为 -->

## Impact

- **新增**：独立 TOC 模块（纯逻辑 + Astro 组件 + 样式）；接入 `src/layouts/blog-post-layout.astro`。
- **markdown 管线**：**无需改动**——经验证 Astro 内置 `rehypeHeadingIds` 已保证标题带 `id` 且 `render().headings` 可用，未引入 `rehype-slug`、未新增依赖。
- **内容 schema**：`src/content.config.ts` 的 blog collection 新增 TOC 字段 `tocDepth`（2–6）与 `toc`（默认 true，逐文关闭），否则 zod 默认 strip 掉、FrontMatter 取不到。
- **不影响**：移动端导航、`pages`/`poems` 集合、现有 `TopNavbar`/`MenuButton`。
