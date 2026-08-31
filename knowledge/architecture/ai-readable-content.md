# AI 可读内容发布（Markdown 孪生与 llms.txt）

## 概述

ceynri.cn 把每篇公开博客文章以 **Markdown 孪生** 形式暴露给 AI Agent：`/blog/<slug>.md`。人类访问的 HTML 页不渲染这部分内容，AI 则通过站点索引 `/llms.txt` 和文章页 `<head>` 里的 `<link rel="alternate" type="text/markdown">` 发现它。这是「同一资源、两种表示」：人类看 HTML，Agent 读 Markdown。

frontmatter 里的 `summary` 字段原本只用于本地检索/预览，本次改造让它成为**唯一「只给 AI、人不看」的内容**，随 Markdown 孪生的 frontmatter 一起发布。

涉及：净化管线 `src/plugins/sanitize-markdown.ts`、每篇 endpoint `src/pages/blog/[...slug].md.ts`、索引 `src/pages/llms.txt.ts`、`BaseHead` 的 `markdownUrl` prop（经 `BaseLayout` → `BlogPostLayout` 透传）。

## 关键设计决策

### 为什么用 Markdown 孪生，而不是 meta 标签或不可见文本节点

最初考虑过在 HTML `<head>` 加 meta、或在页面塞不可见文本节点。否定原因：

- **不可见文本节点**会被屏幕阅读器、SEO 爬虫、复制粘贴一起读到，违背「只给 AI」的意图，且有 hidden-content 的 SEO 争议。
- **meta 标签**不适合放较长的 summary（会被截断、转义麻烦、语义模糊）。
- Markdown 孪生是 llms.txt 规范 v2 + Vercel/Cloudflare/Anthropic 等正在收敛的方向，语义上是「另一种 representation」而非「对 AI 隐藏」，不算 cloaking，且 token 效率高得多。

### Markdown 必须从内容源生成，不要从渲染后 HTML 反解

业界反复强调的坑：从渲染后 HTML 转 Markdown 会把导航、页脚、cookie 横幅等噪音一起带回来。本站孪生直接用 `post.body`（Markdown 源）净化得到，天然干净。这也意味着**孪生与最终页面是两种形态、允许有差异**——例如正文图片在 HTML 页是 Astro 优化后的 `<picture>`，在孪生里只能给原始图链接（用户已确认接受此差异）。

### frontmatter 白名单制，默认私有

孪生的 frontmatter 显式从白名单构造（`title`/`date`/`lastmod`/`tags`/`description`/`summary`/`canonical_url`），**不是拷贝原始 frontmatter**。新增的 schema 字段默认不进孪生，须显式加白才暴露。`summary` 与 `description` 是两个独立字段，各自有就输出、互不替代（用户明确要求）。

### 净化在 mdast 上做，复用 remark 工具链而非自造解析器

「md → 干净 md」没有现成一键包（unified 生态的 sanitize/strip 多在 hast 侧或面向纯文本 excerpt）。做法是 `remark-parse` → 自定义 transform → `remark-stringify`，骨架复用项目里 `@astrojs/markdown-remark` 已带入的 remark 全家桶。这些包是 pnpm 严格模式下的**传递依赖，源码里 import 不到**，需声明为直接 devDependencies（`remark-parse`/`remark-stringify`/`remark-gfm`/`unified`/`@types/mdast`）。

### 内联 HTML 标签策略

- **注释** `<!-- -->`：删除。
- **ruby**：用作者已写好的 `<rp>` 降级括号，输出「主体（注音）」（用户确认 ruby 标签本身会写好 `<rp>` 降级，直接复用）。
- **保留语义标签**：`<details>`/`<summary>`/`<u>`/`<kbd>` 等（用户确认这些不干扰原文阅读、语义明确）。
- **解包/丢弃布局标签**：`<br>`/`<center>` 等。
- **未知标签默认保留**原样（交给 Agent 理解，不静默丢内容）。

## 注意事项

### ruby 状态机的最大坑：必须清空已收集的节点

这是本次最易踩的坑。Markdown 里 `<ruby>漢<rp>（</rp><rt>かん</rt><rp>）</rp></ruby>` 经 remark 解析后，主体 `漢`、括号 `（）`、注音 `かん` 都是**独立的 text 节点**，标签是独立的 html 节点。状态机在 `</ruby>` 处拼接降级文本时，**必须同时把已收集的那些 text/html 节点的 `value` 清空**，否则序列化时原始文本节点照常输出，会和降级结果重复（出现「漢（かん）漢（かん）」）。测试断言要用 `toBe` 严格相等而非 `toContain`，否则重复时也能通过、漏检。

### 状态机要在「直接持有 inline 节点」的容器上只跑一次

`visit` 会访问 root 和 paragraph 等多个带 children 的容器。若对每个容器都跑状态机会重复处理。应对：只在其 children 含 html/text/image/link 等 inline 节点的「叶子容器」上处理一次（root 的 children 是 block 节点，自然被跳过）。

### 孪生正文图：经 imageAssetMap + getImage 升级为优化图 URL

**历史 404 教训**：最初孪生把正文图经 `resolveContentAssetReference` 转成原图 URL（`/blog/<year>/assets/...`），结果现网 9 张里 8 张 404。根因：**正文图被 Astro 优化成带 hash 的 `/assets/*.webp`，原图根本不复制到产物**（参 [content-image-assets](content-image-assets.md)）。中间曾用 `（图：alt）` 文本占位止血。

**当前实现（`use-optimized-images-everywhere`）**：孪生正文图经 `content-image-resolver` 升级为**可访问的优化图 URL**（`https://ceynri.cn/assets/x.Hash_hash.webp`）。机制见下一条。

**链接图仍降级**：本地图片链接（`[查看原图](./assets/x.jpg)`）指向的图**不在 imageAssetMap**（content layer 只收集正文 `image` 节点，不收 `link` 节点），无法优化，故孪生里仍「去链接留文字」。链接图 + floating image 在 HTML 页保留原图（用户决策的折中），原图机制全保留。

### 孪生正文图优化的核心机制：复用 Astro `imageAssetMap`（内部 API）

拿到「源图 → 优化图 URL」的关键是**复用 Astro 自己为正文图维护的映射**，而非手工构造 ImageMetadata（PoC 已证手工构造走不通：`/@fs/` src 要么返回 `astro://` 占位符需 renderChunk 替换、要么 build 不落盘）。

**链路**（`src/plugins/content-image-resolver/core.ts`）：
1. content layer 收集每篇 entry 正文 `image` 节点 → 生成虚拟模块 `astro:asset-imports`（`Map<importId, ImageMetadata>`，value 是经 Vite 处理、产物落盘的合法 metadata）。
2. `importId = ${src}?astroContentImageFlag=&importer=${filePath}`（复刻 astro 内部 `imageSrcToImportId`；`filePath` 用 `post.filePath` 原值——「相对项目根」posix 路径，URL 编码后与 `.astro/content-assets.mjs` 的 key 逐字节一致）。
3. endpoint 里 `import imageAssetMap from 'astro:asset-imports'` → `map.get(importId)` 得 metadata → `getImage({ src: metadata, width: 1080, format: 'webp' })` → 返回真实 `/assets/x.Hash_hash.webp`，产物自动落盘。

**注意（内部 API 耦合）**：`astro:asset-imports`、`astroContentImageFlag` 常量、importId 拼接、`getImage` 均为 astro 内部实现，跨版本可能变。astro 相关 import 必须**动态加载**（`await import('astro:assets')`），不能顶层 import，否则纯逻辑单测会因解析不到虚拟模块而失败。`resolveOptimizedImage` 查不到/SVG/GIF 返回 `null`，调用方（sanitize）降级为占位。

### `post.filePath` 是项目根相对路径

glob loader 在 content store 里存的 `filePath` 是相对项目根的路径（`posixRelative(config.root, ...)`），不是绝对路径。解析相对图片前需先拼回绝对路径。`post.body` 则是已去 frontmatter 的纯正文，无需再读文件剥 frontmatter。

### 路径形态是 `/blog/<slug>.md` 而非 `/blog/<slug>/index.md`

Astro 文件路由对 `[...slug].md.ts` 自然产出 `/blog/<slug>.md`。这也是最易被猜测的 `.md` 后缀约定。部分静态服务器可能把 `.md` 当 `text/plain` 或触发下载，可接受（Agent 读内容不看 MIME）。将来若加同 URL 内容协商（`Accept: text/markdown`），这些 `.md` 资产可直接复用为协商目标。

### 演进方向（未做）

- **全站复用 Astro 优化图**（独立变更 `use-optimized-images-everywhere`）：孪生、floating image、「查看原图」统一指向优化产物 URL，替代当前的图片占位止血。见上文「404 教训」。
- 同 URL 内容协商（需动态 edge/server，本站纯 SSG 平台不定，先不做）。
- `pages`/`poems` 集合的孪生与 llms.txt 覆盖（本次只聚焦 blog）。
- 聚合索引 `/llms-full.txt`。
- 为存量文章批量补 `summary`（独立内容工作）。

## 相关文档

- [内容图片与原图链接链路](content-image-assets.md) — 理解「正文图优化不复制原图、floating image link 才复制原图」这一导致孪生 404 的关键机制，需读此篇
- [部署链路与首次发布时间回写](deploy-publish-timestamp.md) — llms.txt 与文章排序依赖 `publishedAt || date`，该字段的回写机制见此篇
