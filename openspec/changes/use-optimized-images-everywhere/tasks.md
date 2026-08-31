## 1. 共享解析模块 content-image-resolver

- [x] 1.1 新建 `src/plugins/content-image-resolver/`：复刻 `imageSrcToImportId` 拼接逻辑（`{src}?astroContentImageFlag=&importer={filePath}`），`import imageAssetMap from 'astro:asset-imports'`（虚拟模块无类型，加 `@ts-expect-error` + 本地类型断言），暴露 `resolveOptimizedImage(src, filePath, { width, format })` → 查表 + `getImage` 返回 `{ url, width, height }`，查不到/源缺失返回 `null`。astro 相关 import 改为动态加载，保证纯逻辑可独立单测。
- [x] 1.2 单元测试（importId 拼接、SVG/GIF 判定）：importId 与 Astro 实际 `content-assets.mjs` 的 key 逐字节一致（已对真实 `疫情第三年` filePath 验证 MATCH）。
- [x] 1.3 SVG/GIF 处理：`isNonOptimizableImage` 判定，解析层对 SVG/GIF 返回 null 走降级。

## 2. 改造孪生正文图（核心价值）

- [x] 2.1 `sanitize-markdown.ts`：新增 `resolveImage?: (src) => Promise<string | null>` 注入函数；本地图先收集再批量 await 解析，成功输出 `![alt](url)`（alt 剥离 `?size=`），失败/未注入降级为占位。endpoint 传入 `post.filePath` 与 `site`（拼绝对 URL）。
- [x] 2.2 sanitize-markdown 测试：注入 mock resolveImage，覆盖「解析成功→优化图 URL」「?size= 剥离」「resolveImage null→占位」「图片链接成功/失败」等 21 条。
- [x] 2.3 验证 `dist/blog/*.md`：106 个优化图引用全部有对应产物文件（0 缺）；15 个 GIF 按 spec 降级为占位。

## 3. 范围确认与收尾

- [ ] 3.1 「查看原图」链接 + floating image **保留原图**（用户决策）：`remark-content-image-links.ts` / `content-assets/integration.ts` / `floating-images.astro` 维持现状，原图机制全保留。确认 build 后链接仍指原图、可访问。
- [ ] 3.2 更新 AGENTS.md 目录结构（新增 `content-image-resolver/` 模块）与 `src/plugins/` 描述。
- [ ] 3.3 `pnpm check`（biome）、`pnpm vitest run src`、`pnpm build` 全绿；`npx astro check` 0 errors。
- [ ] 3.4 更新 `knowledge/architecture/ai-readable-content.md` 与 `content-image-assets.md`：记录「孪生图经 imageAssetMap + getImage 升级为优化图」「链接图保留原图的原因（不在 imageAssetMap）」「内部 API 耦合注意点」，移除过时的止血/占位表述。
- [ ] 3.5 用 knowledge-manager 沉淀本变更机制。
