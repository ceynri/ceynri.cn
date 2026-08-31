## Context

当前内容图片有两套互不相通的产出：

1. **正文 Markdown image**（`![alt](./assets/x.jpg)`）：保留相对路径，交给 Astro 的 content/Markdown 图片管线，渲染期优化成 `/assets/x.Hash_hash.webp`（含 srcset/尺寸），**原图不进 dist**。
2. **Markdown 图片链接 / floating image**（`[查看原图](./assets/x.jpg)`）：`remarkContentImageLinks` 用 `resolveContentAssetReference` 改写成 `/blog/assets/x.jpg` **原图 URL**，再由 `contentAssetsIntegration` 在 dev serve、build 复制原图进 dist。`rehypeImageLinks` 给这类 `<a>` 打 `data-image-link`，`floating-images.astro` 悬停时 `img.src = link.href` 显示浮窗。
3. **AI 可读孪生**（`/blog/<slug>.md`）：拿不到优化图 URL，正文图只能降级为 `（图：alt）` 文本占位。

三处共同缺一条「内容源图片 → 发布优化图 URL」的映射。本变更建立该映射，三处统一改用优化图，最终使站点不再对外发布原图。

关键代码：
- `src/plugins/content-assets/resolve-content-asset.ts` — `isLocalImageAssetUrl` / `resolveContentAssetReference`（原图 URL 推导，本次收窄）
- `src/plugins/content-assets/integration.ts` — dev serve + build 复制原图（本次移除）
- `src/plugins/remark-content-image-links.ts` — 图片链接改写为原图 URL（本次改为优化图）
- `src/plugins/rehype-image-links.ts` — 给图片 `<a>` 打 `data-image-link`（本次在其上替换 href）
- `src/plugins/sanitize-markdown.ts` — 孪生净化，本地图现为文本占位（本次升级为优化图 URL）
- `src/components/floating-images.astro` — 浮窗 `img.src = link.href`（随 href 指向优化图，组件基本不动）

## Goals / Non-Goals

**Goals:**
- 提供「源图 → 发布优化图 URL」的解析能力，HTML 渲染期与孪生 endpoint 复用同一机制、同一批优化产物。
- 三处（孪生正文图、查看原图链接 + floating image）统一改用 Astro 优化图。
- 站点产物（`dist`）与 dev server 均不再暴露原图。

**Non-Goals:**
- 不改变正文 Markdown image 交给 Astro 优化的现有行为。
- 不引入新的图片格式/尺寸策略（沿用本站 `image.breakpoints` 等配置）。
- 不处理远程图（保持原样）。
- 不处理 `pages`/`poems` 集合。

## Decisions

### Decision 1: 复用 Astro 的 `imageAssetMap` 拿到合法 ImageMetadata，再调 `getImage`（PoC 已验证）

**核心机制，经三阶段 PoC 实证。**

关键发现：Astro 的 content layer 已经为正文图维护了「importId → ImageMetadata」的现成映射——
- `content/loaders/glob.js` 收集每篇 entry 的 `assetImports`（正文引用的图）。
- `content/mutable-data-store.js` 用 `imageSrcToImportId(src, filePath)` 生成虚拟模块 `astro:asset-imports`（`Map<importId, ImageMetadata>`），其中每个 value 是**合法的 ESM ImageMetadata**（`src` 已是 `/assets/x.Hash.jpg`，且经 Vite 处理、产物落盘）。
- `content/runtime.js` 正文渲染正是用 `imageAssetMap.get(id)` 拿 metadata 喂 `getImage`。

**PoC 三阶段实测（endpoint `/blog/poc-img3.ts`）**：
- `import imageAssetMap from 'astro:asset-imports'` 拿到 166 张图的 map ✅
- 用 `imageSrcToImportId` 逻辑（`{src}?astroContentImageFlag=&importer={filePath}`）查表得 metadata ✅
- `getImage({ src: metadata, width: 1080, format: 'webp' })` 返回 **`/assets/P10704-172910-1.BUyrJI5u_e2Npp.webp`**，且对应产物**真实落盘 dist** ✅

**这就是干净路径**：endpoint / 渲染期不手工构造 metadata，而是从 `astro:asset-imports` 查表，再 `getImage`。与正文同源、同 hash、自动去重、自动落盘，不暴露原图。

**为何不走手工构造（PoC 一/二阶段已证伪）**：手工构造 ImageMetadata（`/@fs/` src）要么返回 `astro://` 占位符（endpoint body 非 chunk 不被 `renderChunk` 替换）、要么返回 `/@fs/` dev 路径（build 不落盘）。`emitImageMetadata` 的 build 分支只在 Vite import 上下文触发，运行时无法复现。**只有 `imageAssetMap` 给的 metadata 是经过完整 Vite 处理的合法输入。**

### Decision 2: importId 复刻 `imageSrcToImportId` 的拼接逻辑

`imageSrcToImportId` 在 `astro/assets/utils` 未公共导出（`exports` 不含该子路径）。其逻辑很短，在共享模块里复刻：
```
importId = `${src}?astroContentImageFlag=&importer=${filePath}`
```
其中 `src` 是正文里写的原始路径（如 `./assets/slug/x.jpg`），`filePath` 是 `post.filePath`（content store 提供的相对路径，需与 loader 收集时的形态一致——PoC 中为 URL 编码的相对路径，查表时用 `post.filePath` 原值即可命中）。`IMAGE_IMPORT_PREFIX`（`__ASTRO_IMAGE_`）只在 src 以它开头时才需剥离，正文原始 src 不含，可忽略。

常量 `astroContentImageFlag` 硬编码（内部值，配合版本锁定 + 集成测试兜底）。

### Decision 3: 封装单一共享模块 `content-image-resolver`

新建 `src/plugins/content-image-resolver/`（或并入现有 content-assets 模块），暴露：
- `resolveOptimizedImage(src, filePath, { width, format }): Promise<{ url, width, height } | null>` — 内部：`imageAssetMap.get(imageSrcToImportId(src, filePath))` → `getImage` → 返回优化图信息；查不到/源缺失返回 `null`（调用方决定降级）。
- 该模块集中所有内部 API 耦合点（`astro:asset-imports`、importId 拼接、`getImage`），便于随 Astro 版本调整。

**尺寸变体选择**：孪生与浮窗统一取单一代表性宽度（如 1080，落在 `image.breakpoints` 内），`format: 'webp'`。同一 (src, options) 经 `addStaticImage` 按 hash 去重，三处复用同一产物。

### Decision 4: 仅孪生 endpoint 消费该模块；「查看原图」链接/浮窗保留原图

**范围收窄（用户决策）**：本变更只把**孪生正文图**升级为优化图；「查看原图」链接 + floating image **保留原图指向**，原图机制（dev serve + build 复制）**全部保留**服务链接。

- **孪生 endpoint**（`[...slug].md.ts`）：`sanitizeMarkdown` 的图片处理由「文本占位」改为——本地图经 `resolveOptimizedImage` 得 URL，输出 `![alt](url)`（alt 剥离 `?size=`）。endpoint 是 Astro 路由，build 时 `imageAssetMap` 可用（PoC 已证）。URL 用 `site` 拼绝对（AI 可直接 fetch）。
- **「查看原图」链接 + floating image（不改）**：链接仍指向原图（`/blog/assets/...`），`remarkContentImageLinks` / `contentAssetsIntegration` / `floating-images.astro` 维持现状。

**为什么不改链接图**：链接指向的图**不在 imageAssetMap**——content layer 只收集正文 `image` 节点（`remark-collect-images.js` 只 visit `image`/`imageReference`），不收集 `link` 节点。链接图从未进入 Astro 图片管线，没有现成 ImageMetadata，且 PoC 已证手工构造 metadata 拿不到可用发布 URL。让链接图进优化管线需自定义收集逻辑，工程量大、收益低，故用户选择保留原图折中。

### Decision 5: 「不暴露原图」仅在正文图/孪生维度达成

原图机制（dev serve + build 复制 + `resolveContentAssetReference` 的 `publicUrl`）**保留**，专为「查看原图」链接/浮窗服务。「全站不暴露原图」的原始目标在本变更中收窄为：**正文图与孪生不暴露原图**；链接图仍暴露原图（用户接受的折中）。链接图的优化与原图机制的彻底拆除留作后续独立变更（需先解决「链接图进 content 收集」）。

## Risks / Trade-offs

- **依赖内部 API（`astro:asset-imports`、importId 常量、`imageSrcToImportId` 逻辑、`getImage` 对 content metadata 的处理）**：均为 Astro 内部实现，版本升级可能变。**缓解**：耦合点收敛在 `content-image-resolver` 单一模块；锁定 astro 版本；加一个集成测试断言「对一张已知正文图，endpoint 能产出可访问 `/assets/` URL 且产物落盘」，升级时该测试会先红。
- **importId 的 importer 形态**：依赖 `post.filePath` 与 loader 收集时一致（PoC 已用真实 `filePath` 命中）。**缓解**：复刻逻辑直接喂 `post.filePath`，集成测试覆盖。
- **SVG/GIF**：`IMAGE_EXTENSIONS` 含 `.svg/.gif`，Astro 对 SVG 不优化、GIF 可能丢帧；`imageAssetMap` 是否收录它们待验证。**缓解**：解析层对查不到/SVG/GIF 走「原样保留或降级」分支；集成测试覆盖。
- **同图去重**：依赖 `addStaticImage` 按 (src + options hash) 去重。三处用相同 (width, format) 即复用同一产物（PoC 中同图多变体已按 hash 区分）。
- **dev 行为**：`imageAssetMap` 在 dev 也填充（`vite-plugin-content-virtual-mod` 处理），`getImage` 在 dev 返回 `/_image?href=` 中间件 URL，可访问。需 dev 实测确认。
