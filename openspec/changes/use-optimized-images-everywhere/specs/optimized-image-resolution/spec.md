## ADDED Requirements

### Requirement: Source image to optimized URL resolution

系统 SHALL 提供「内容源正文图片 → 发布优化图 URL」的解析能力，复用 Astro content 管线维护的图片元数据映射与官方图片优化 API，供独立 endpoint（Markdown 孪生）调用。

#### Scenario: Resolve a content body image to an optimized URL

- **WHEN** 给定一个内容源正文 image 节点引用的本地图片（正文原始相对路径 `./assets/post-slug/a.jpg`）与其所属内容的 `filePath`
- **THEN** 系统经 Astro content 图片映射拿到该图的 ImageMetadata，产出 Astro 优化后的发布 URL（本站 `build.assets='assets'`，即 `/assets/...`），该 URL 在产物中可访问

#### Scenario: Resolved optimized asset is emitted

- **WHEN** 解析完成并产出一个优化图 URL
- **THEN** 该 URL 对应的优化产物在 build 输出中真实存在（不 404）

#### Scenario: Deterministic and deduplicated resolution

- **WHEN** 同一源图被多处（孪生、正文）以相同尺寸/格式参数解析
- **THEN** 各产出指向同一去重的优化产物 URL，源图不变则 URL 稳定

#### Scenario: Resolution available in endpoint context

- **WHEN** 在 Astro endpoint（如 `/blog/<slug>.md.ts`）的渲染上下文中请求解析某内容源正文图片
- **THEN** 系统能产出可访问的优化图 URL，且对应优化产物会被注册/落盘

#### Scenario: Unresolvable or non-optimizable image degrades gracefully

- **WHEN** 请求解析的图片在内容映射中查不到（如 link 节点指向的图）、源文件缺失、或为 SVG/GIF 等不适合优化的格式
- **THEN** 系统按调用方约定降级（保留占位或原样保留），不抛出中断构建的错误

### Requirement: No raw original exposure via this resolution

系统 SHALL 不通过该解析能力对外暴露未经优化的原图 URL。

#### Scenario: Resolved URL is an optimized artifact

- **WHEN** 解析完成并产出 URL
- **THEN** 该 URL 指向 Astro 优化产物，而非内容源原图路径（如 `/blog/assets/...`）
