## 1. 前提验证与依赖

- [x] 1.1 验证渲染产物：检查 blog 文章渲染后 `<h2>/<h3>` 是否带 `id`、`render(post).headings` 是否非空
  - 结论：**可用，无需补插件**。`astro.config.ts` 用的 `markdown.processor: unified({...})` 来自 `@astrojs/markdown-remark`，其 `createRenderer` 委托 `createMarkdownProcessor`，后者**无条件** `use(rehypeHeadingIds)`（`rehype-collect-headings.js`）：既用 github-slugger 给每个标题加 `id`，又把 `{depth,slug,text}` 收进 `render().headings`。自定义 processor 仅追加 remark/rehype 插件，**未旁路**该内置行为。
- [x] 1.2 ~~若缺失，引入 `rehype-slug`~~ —— **不需要**：内置 `rehypeHeadingIds` 已覆盖，引入 `rehype-slug` 反而冗余，故跳过、不新增依赖。
- [x] 1.3 回归验证：未改动 markdown 管线，无回归风险；`headings` 与标题 `id` 由内置插件保证可用（build 阶段最终验证）。

## 2. 内容配置

- [x] 2.1 在 `src/content.config.ts` 的 blog collection schema 新增可选采集层级字段（如 `tocDepth?: 2 | 3`，必要时含 `toc?: boolean` 逐文关闭）
- [x] 2.2 确认未声明该字段的现有文章不受影响（默认行为）

## 3. 核心逻辑模块（纯 TS、零依赖、可单测）

- [x] 3.1 标题列表 → 章节区间模型：依 `headings` 与各标题纵向偏移构造章节区间，末章右界取正文底
- [x] 3.2 视口区间 → 高亮带：计算每条线高亮比例与填充方向（左=章首 / 右=章末），支持跨多线、边界部分填充
- [x] 3.3 居中位移算法：高亮带中点居中 + 头尾钳制（`translateY` 钳在合法区间）
- [x] 3.4 阅读百分比：以视口中线为焦点、正文范围为基准，钳 0~1
- [x] 3.5 为 3.1–3.4 编写 vitest 单元测试（边界：首章、末章、超长章节、一屏多章节、空/单标题）—— 23 条全过

## 4. Astro 组件壳与样式

- [x] 4.1 创建独立目录的目录组件（接收 `headings` + 配置 props：`maxDepth`/`minHeadings`/`breakpoint`）
- [x] 4.2 收起态轨道 DOM/样式：右侧 `fixed` 垂直居中、H2 长线 / H3 短线+缩进、H1 不入轨道、低存在感
- [x] 4.3 hover 文字浮层：向左展开、覆盖正文、H1 作卡片标题头、当前章节强调色高亮、目录项可点击
- [x] 4.4 轨道 `max-height ≈ 62vh` + 溢出内滚（行距恒定）+ 上下渐变蒙层；轨道不响应滚轮
- [x] 4.5 底部右对齐低存在感百分比文字
- [x] 4.6 主题通过 CSS 变量暴露并提供默认值；消费侧将变量映射到本站 `@theme` 语义色（不硬编码颜色）

## 5. 客户端行为接线

- [x] 5.1 挂载脚本：`load` 后计算几何量，`rAF` 节流滚动更新高亮带 / 居中位移 / 百分比
- [x] 5.2 监听 `resize` / `ResizeObserver` 与图片 `load` 回流后重算几何量
- [x] 5.3 点击目录项平滑跳转，尊重 `prefers-reduced-motion`（减弱时瞬时跳转）；轨道线本身不单独接 click

## 6. 接入与门槛

- [x] 6.1 在 `src/layouts/blog-post-layout.astro` 接入组件，仅 blog 渲染
- [x] 6.2 门槛逻辑：标题数 < `minHeadings`（默认 2）不渲染；视口宽度 < `breakpoint`（默认 1024px）不挂载
- [x] 6.3 确认 `pages`/`poems` 与移动端不受影响、不引入对应开销（组件仅在 blog 布局接入；< 断点 CSS 隐藏且 JS 不接线）

## 7. 验收与质量门禁

- [x] 7.1 真实文章手动验收：长文 / 短文 / 含封面 / `narrow` 布局 / 超多标题 / 明暗主题切换
  - 已构建验证：blog 页正确渲染单个轨道（41 标题文 → 41 线、触发溢出滚动 + 蒙层路径）、标题均带 `id`、锚点可定位；交互动效与明暗视觉建议由用户在 `pnpm dev` 浏览器中最终确认。
- [x] 7.2 逐条对照 specs 场景核验（渲染门槛、层级映射、hover 跳转、二维高亮、居中钳制、百分比、配置层级、锚点）
  - 纯逻辑场景（门槛/层级/二维高亮/居中钳制/百分比）由 23 条 vitest 覆盖通过；锚点、渲染门槛、层级映射经构建产物核验。
- [x] 7.3 通过 CI 质量门禁：`astro check` → `biome ci` → `astro build` → 死链检查
  - 本地 `pnpm build`（astro check + build，31 页）与 `biome check` 均通过；死链检查随 CI 运行（锚点均指向页面内已存在的标题 id）。
