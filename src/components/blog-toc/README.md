# blog-toc

面向长文的 PC 端「轨道式」文章目录（TOC rail）。

> English: see [README.en.md](./README.en.md)

收起态是一组贴右侧、垂直居中的纯线条——文章标题的 minimap；鼠标移入时向左展开为文字目录浮层。随页面滚动呈现**二维进度**（哪些章节在屏、各看了多少），并显示整篇阅读百分比。

定位：克制、不打扰阅读的页内导航 + 进度感知。代码组织为自包含、配置驱动、可抽取为独立包的模块。

## 特性

- **收起态轨道**：H2 线最长，逐级变短（H3…H6），右对齐使短线左缘自然内缩，形成层级缩进观感。存在感低。
- **hover 浮层**：向左展开覆盖在正文之上，文章 H1 作卡片标题头；当前在屏章节高亮；点击目录项平滑滚动跳转。
- **二维进度**：把当前视口窗口投影到正文，得到一段可跨多条线的高亮带（边界线按可见比例部分填充）；高亮带中点在轨道内垂直居中（头尾钳制）。
- **阅读百分比**：以视口垂直中线为焦点、正文范围为基准计算。
- **可配置采集深度**：组件 prop 与文章 FrontMatter 逐文覆盖。
- **渲染门槛**：标题数过少不渲染；视口宽度低于断点不挂载。
- **CSS 变量主题**：不硬编码颜色。

## 用法

```astro
---
import { render } from 'astro:content';
import { TocRail } from '~/components';

const post = Astro.props.post;
const { title, tocDepth, toc } = post.data;
const { headings } = await render(post);
---

<article data-toc-body>
  <Content />
</article>

{toc !== false && (
  <TocRail headings={headings} title={title} maxDepth={tocDepth} />
)}
```

要点：

- 给正文容器加 `data-toc-body`：它界定阅读百分比与高亮的基准范围（排除封面图、评论区、页脚等）。
- `headings` 直接取自 Astro 的 `render()`。标题 `id` 由 Astro 内置的 `rehypeHeadingIds` 生成，**无需额外的 slug 插件**。

## Props

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `headings` | `MarkdownHeading[]` | — | `render()` 返回的标题（含全部层级，组件内部过滤） |
| `title` | `string` | — | 文章标题（H1），作浮层标题头 |
| `maxDepth` | `number`（2–6） | `3` | 采集到的最深标题层级。把文章 FrontMatter 的值传进来即可逐文覆盖 |
| `minHeadings` | `number` | `2` | 标题数低于此值时整组件不渲染 |
| `breakpoint` | `number` | `1024` | 视口宽度低于此值时不挂载组件 |
| `bodySelector` | `string` | `[data-toc-body]` | 正文范围选择器 |
| `class` | `string` | — | 透传到根 `<nav>` |

H1 不入轨道、不计入采集、不引入缩进层级，仅作浮层标题头。

## FrontMatter（消费项目）

字段必须在内容集合 schema 中声明，否则 zod 会将其 strip 掉：

```ts
tocDepth: z.number().int().min(2).max(6).optional(),
toc: z.boolean().optional().default(true),
```

- `tocDepth`：本文采集到第几级标题（2–6），传给组件的 `maxDepth`。
- `toc: false`：关闭本文目录。

## 主题（CSS 变量）

组件把全部 `--toc-*` 默认值集中声明在 `:root` 一处，并以 `var(--toc-*)` 读取。消费侧通过在 `.toc-rail` 上设置同名变量来覆盖。由于**元素自身的值天然优先于从祖先继承的值**，消费侧（设在 `.toc-rail` 元素）的覆盖必然生效——与 CSS `@layer` 顺序、作用域特异性都无关。（默认值不能声明在组件自己的 `.toc-rail` 上：Astro 会把它编译为 `.toc-rail[data-astro-cid]`，多出的特异性会压过消费侧普通的 `.toc-rail`。）本项目的映射在 `src/styles/global.css`，绑定到语义色 token，随明暗切换。

颜色变量（命名 = `元素-部位`）：

| 变量 | 元素 |
| --- | --- |
| `--toc-rail-line-color` | 收起态轨道的基础细线 |
| `--toc-rail-highlight-color` | 移动的二维高亮条 |
| `--toc-percent-color` | 阅读百分比文字 |
| `--toc-panel-bg` / `--toc-panel-shadow` | hover 浮层背景 / 阴影 |
| `--toc-panel-title-color` | 浮层标题头（H1） |
| `--toc-panel-item-color` | 普通目录项 |
| `--toc-panel-item-active-color` | 当前（在屏）章节项 |
| `--toc-panel-item-hover-color` | 鼠标悬停项 |

尺寸变量：
`--toc-len-2`…`--toc-len-6` · `--toc-line-thickness` · `--toc-line-gap` · `--toc-max-height` · `--toc-right` · `--toc-panel-width` · `--toc-indent`

示例：

```css
.toc-rail {
  --toc-rail-highlight-color: var(--title-color); /* 中性色，不抢注意力 */
  --toc-rail-line-color: var(--border-color);
  --toc-panel-item-hover-color: var(--accent-color);
}
```

## 边界

- **仅 PC**：低于 `breakpoint` 不挂载。移动端目录如有需要，由消费项目另行实现。
- 轨道不响应滚轮，仅由代码自动定位。线条总高超过 `--toc-max-height` 时轨道内部自动滚动，上下缘以渐变蒙层提示尚有内容。

## 文件结构

- `core.ts`：零依赖纯逻辑（章节区间、高亮带、居中钳制、百分比），有单测。
- `core.test.ts`：vitest，覆盖边界场景。
- `toc-rail.astro`：组件壳（DOM、可移植的 CSS 变量主题、客户端脚本）。
- `index.ts`：barrel 导出。

## 实现要点（二次开发 / 维护）

仅记非显而易见的约束，改动前请先读：

1. **纯逻辑全在 `core.ts`**（零依赖、不碰 DOM、可单测）。改动几何/进度算法时同步补 `core.test.ts`，跑 `pnpm test`。`toc-rail.astro` 的 `<script>` 只负责「测量 DOM 几何 → 调 core → 写回样式」。
2. **进度只有一个核心概念**：视口窗口投影到章节区间得高亮带，带中点在轨道内居中（头尾钳制）。阅读百分比是独立的简单计算（视口中线焦点 + 正文范围）。不要再引入第二套「单点聚焦」规则。
3. **标题 `id` 来源**：Astro 的 `@astrojs/markdown-remark` 在 `unified()` 管线里无条件加入 `rehypeHeadingIds`（加 `id` + 产出 `render().headings`）。本项目自定义 `markdown.processor` 未旁路它，故无需 `rehype-slug`——改 `astro.config.ts` 的 markdown 管线时勿破坏这点。
4. **主题变量：默认挂 `:root`、覆盖挂 `.toc-rail`**（原因见上方「主题」一节）。新增可配置变量照此模式，颜色与尺寸一视同仁。
5. **高亮渲染是无状态纯函数**：`computeLineFills` 对**每条线每帧**用同一公式 `start=clamp01((viewTop-top)/h)`、`end=clamp01((viewBottom-top)/h)` 给出确定值——离屏章节自然收敛为零宽（上方 `[1,1]` / 下方 `[0,0]`，宽度 0 即隐形），**不用 opacity 显隐、不冻结位置**。`left/right` 保留 CSS 过渡做平滑跟随。离场是连续收敛到本侧边缘（不会从右滑到左）；仅当滚动位置「瞬间大跳变」时呈现一次物理一致的快速扫过（属窗口带模型的可接受极端表现）。「真正可见」的线（`end>start`）才计入轨道居中与浮层高亮。
6. **空高亮兜底**：无在屏章节时按滚动位置定位轨道——滚到正文上方（读完）沉底、尚在下方（未到）钉顶；不要回落成默认顶部。
7. **门槛收拢在组件**：采集深度钳制 `[2,6]`、`标题数 < minHeadings 不渲染` 都在组件内部；接入方只传 `headings/title/maxDepth` 并用 `toc !== false` 做内容级开关，不要在外部重复判断。
8. **验收门禁**：`pnpm test` + `pnpm check`（biome）+ `pnpm build`（astro check + build）。
