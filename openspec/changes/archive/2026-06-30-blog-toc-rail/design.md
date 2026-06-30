## Context

ceynri.cn 是基于 Astro 的纯 SSG 个人博客。blog 文章页（`src/layouts/blog-post-layout.astro` → `src/components/blog-post.astro`）为居中单栏、无侧栏，正文经 `<article class="prose typography">` 渲染，宽屏两侧有大片留白。`FloatingImages` 是跟随鼠标的悬浮预览，不常驻某一侧，右侧留白干净可用。

markdown 经 `astro.config.ts` 中**自定义 `unified()` processor** 处理（含 `rehype-external-links`、本地图片相关 remark/rehype），未引入 `rehype-slug`，因此标题 `id` 与 `render().headings` 是否可用存在不确定性，需在实现首步验证。blog collection（`src/content.config.ts`）的 zod schema 为非 strict，会 strip 未声明的 FrontMatter 字段。

样式遵循 Tailwind v4 + `@theme inline` 语义色（值取自 `variables.css`，运行时随 `data-scheme` 切换明暗），禁止硬编码颜色。本能力的交互形态来自一轮 grill-me 设计讨论，结论快照见 `.codebuddy/memory/2026-06-29.md`。

## Goals / Non-Goals

**Goals:**
- 在 PC 端为 blog 长文提供克制、不打扰的页内目录：收起态轨道 + hover 文字浮层。
- 用「视口窗口投影」这一单一概念统一驱动二维高亮进度，避免多套互相打架的焦点规则。
- 采集层级可经 FrontMatter 逐文覆盖、全局默认到 H3。
- 代码组织为自包含、配置驱动、可后续抽取为 NPM 包的独立模块；纯逻辑零站点依赖、主题走 CSS 变量。

**Non-Goals:**
- 移动端目录适配（< 断点直接不挂载；移动端若需目录由站点另起实现，不耦合进本模块）。
- 「标题过多自动只收 H2」的智能降级（仅记录为未来增强，本次以 `maxDepth` 配置替代）。
- `pages` / `poems` 等非 blog 集合。
- 现在就完成 NPM 发布（先在本仓内联打磨验证，发布是验证后的轻量一步）。

## Decisions

### D1. 形态：常驻轨道 + hover 浮层的两态（砍掉「顶部自动展开」）
- **选择**：进页面直接呈现居中轨道；唯一展开入口是 hover，向左展开文字浮层。
- **理由**：轨道本身已是信息完整的常驻物，再叠「每次加载先展开再自动收起」会制造突兀位移、与「不打扰」冲突。两态比三态状态机更干净。
- **备选**：保留顶部展开（三态）——否决，加载噪音大。

### D2. 进度模型：视口窗口 → 正文 → 轨道的单一投影
- **选择**：以视口 `[scrollTop, scrollTop+innerHeight]` 在正文坐标系内的区间，投影到「章节区段」结构，得到一段跨线高亮带；边界线按可见比例部分填充（左=章首、右=章末）。
- **理由**：单一概念同时表达「在哪几个章节」「各章节看了多少」，且能自然涌现进度感；离散标题行与窗口范围天然对齐。
- **备选**：① 连续百分比填充条——与离散线条语义错位，否决；② 单点焦点（38.2%）驱动高亮——讨论后认为是多余复杂度，已删除，仅保留窗口范围模型。

### D3. 章节区段与几何计算
- 章节 i 的纵向区间 = `[headingOffset_i, headingOffset_{i+1})`，末章右界取正文底 `bodyBottom`。所有偏移基于布局完成后的 `getBoundingClientRect` + `scrollY` 计算（图片懒加载/字体回流后需重算）。
- 每条线高亮比例 = 该章节区间与视口区间交集长度 / 该章节区间长度，钳 0~1，并据交集相对位置决定填充自左或自右。

### D4. 轨道自动居中 + 头尾钳制 + 溢出
- **选择**：高亮带中点为锚点，令其在轨道可视区垂直居中；`translateY` 钳制在 `[minOffset, 0]` 区间内（开头钉顶、结尾沉底）。轨道 `max-height ≈ 62vh`；超出则内部 `overflow` 自然滚动（行距恒定）+ 上下 `mask-image` 渐变蒙层。
- **轨道不响应滚轮**：hover 的首要意图是唤出浮层，给轨道接滚轮会与之打架。
- **备选**：超出时压缩行距让线变密——否决，用户倾向自然滚动 + 蒙层。

### D5. 阅读百分比：窗口中线焦点 / 正文为基准
- `progress = clamp((scrollY + innerHeight/2 - bodyTop) / (bodyBottom - bodyTop), 0, 1)`。
- 基准取 `<article class="prose typography">` 容器的 `getBoundingClientRect`，排除封面、顶栏、标签、评论、页脚。
- 该值仅服务底部 `%` 文字，与 D2 的高亮带是两件独立的简单事，不引回被删除的焦点复杂度。

### D6. 采集层级配置：FrontMatter 字段 + 全局默认
- blog schema 新增**两个独立字段**（最终落定）：`tocDepth?: 2–6`（逐文覆盖采集深度）+ `toc?: boolean`（默认 true，逐文关闭）；组件单一深度参数 `maxDepth`（默认 3），由接入侧把 `tocDepth` 透传给它。未声明则用默认 3。
- **必须**在 `content.config.ts` 显式声明这两个字段，否则 zod 默认 strip，`post.data` 取不到。

### D7. 点击交互范围
- 点击目标 = hover 浮层中的文字行（PC）。**轨道线本身不单独接 click**：PC 上浮层会先盖住轨道，点击落不到线上；为极少数边界情况单独布线不划算。
- 跳转用 `scroll-behavior: smooth` 并尊重 `prefers-reduced-motion`（减弱动画时瞬时跳转）。

### D8. 标题 id 与 headings 获取
- **已验证（实现首步结论）**：Astro 的 `@astrojs/markdown-remark` 在 `unified()` 管线里**无条件** `use(rehypeHeadingIds)`（`rehype-collect-headings.js`，用 github-slugger 给每个标题加 `id` 并产出 `render().headings`）。本项目自定义 `markdown.processor` 仅追加 remark/rehype 插件、**未旁路**该内置步骤，故 `<h2 id>` 与 `render().headings` 均可用，**无需 `rehype-slug`、未新增依赖**（构建产物已证实标题带 id）。
- 目录数据用 `render()` 的 `headings`（`{ depth, slug, text }`），避免客户端再解析 DOM。

### D9. 模块边界（为抽取而设计）
- `core`（纯 TS，零依赖）：标题列表 → 章节区间模型；视口区间 → 高亮带；居中位移；进度百分比。可独立单测。
- `astro 壳`：薄组件，接收 `headings` + 配置 props，渲染轨道与浮层 DOM，挂载客户端脚本调用 `core`。
- `主题`：颜色/尺寸/断点全部走 CSS 变量并提供默认值；本站通过覆盖变量对齐语义色（在消费侧映射到 `@theme` 语义色，模块内不硬编码）。
- 接入点：`blog-post-layout.astro` 内按门槛条件渲染组件。

## Risks / Trade-offs

- [自定义 processor 旁路 slug/headings，导致锚点或数据缺失] → 已验证**未旁路**：内置 `rehypeHeadingIds` 始终生效，无需补插件（见 D8）。
- [动态布局（图片懒加载、Web 字体回流）使标题偏移变化，进度/高亮错位] → 偏移延迟到 `load` 后计算，并监听 `resize`/`ResizeObserver` 重算；必要时对图片绑定 `load` 触发重算。
- [滚动高频计算掉帧] → 用 `requestAnimationFrame` 节流，几何量缓存、仅在 resize/字体变化时重建。
- [窄屏与超长标题的极端组合] → 断点下不挂载规避窄屏；超长用 max-height + 内滚 + 蒙层兜底。
- [过早泛化未验证设计] → 本次只在本仓内联打磨、保持模块边界清晰，不投入完整发布/通用化成本，验证后再发布。
- [CSS 变量主题与本站 `@theme inline` 语义色的衔接] → 模块只认自有变量，由消费侧把自有变量赋值为本站语义色，避免模块硬编码、又能随明暗切换。

## Open Questions

- ~~FrontMatter 字段最终命名与形态~~ → **已落定**：采用 `tocDepth`（2–6 采集深度）+ `toc`（默认 true，逐文关闭）**两个独立字段**，不合并。
- ~~模块的代码落点~~ → **已落定**：放 `src/components/blog-toc/` 独立目录（壳 `toc-rail.astro` + 纯逻辑 `core.ts` + `core.test.ts` + `index.ts` barrel + 中英 README）；抽取发布时再迁移。
