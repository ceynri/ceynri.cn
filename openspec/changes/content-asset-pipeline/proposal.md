## Why

`ceynri.cn` consumes selected public content from the upstream `ceynri-words` repository, but image assets are currently exposed through `public/images` symlinks and Markdown-specific link rewriting. This makes asset publishing depend on filesystem side effects and Markdown usage shape, while floating-image links and local `CONTENT_BASE` development need the same assets to be resolved and published consistently.

## What Changes

- Introduce a content asset pipeline for image assets referenced by public content.
- Rename and generalize `remarkRelateImageLinks` into `remarkContentAssets` so Markdown image nodes and image link nodes are resolved through the same asset semantics.
- Define content asset URIs such as `/blog/assets/<slug>/<file>` and `/assets/<file>` as `ceynri-words` content-root paths, not necessarily permanent site route decisions.
- Collect referenced image assets into an in-memory manifest during Markdown compilation.
- Publish only image assets explicitly referenced by public content; do not publish whole asset directories by default.
- Fail build/dev processing when public content references a missing local image asset.
- Add a build/dev publisher that serves or copies manifest assets without relying on `public/images` symlinks.
- Preserve future route-mapping flexibility by resolving each asset as `contentUri`, `sourcePath`, and `outputUrl`, with `outputUrl = contentUri` for the first implementation.
- Document the upstream/downstream relationship: `ceynri-words` owns content and resource structure; `ceynri.cn` consumes and publishes selected public content and its reachable assets.

## Capabilities

### New Capabilities
- `content-assets`: Defines how local image assets referenced by public content are resolved, validated, collected, served in dev, and copied into build output.

### Modified Capabilities
- `blog-content`: Clarifies that `ceynri.cn` consumes public blog content from the upstream `ceynri-words` content source, and that public blog output may include only the image assets explicitly referenced by published blog content.

## Impact

- Affected configuration: `astro.config.ts`, `src/content.config.ts`.
- Affected plugins: `src/plugins/remark-relate-image-links.ts`, `src/plugins/rehype-image-links.ts`, `src/plugins/index.ts`.
- New or refactored utilities may be added under `src/plugins/` or `src/utils/` for content asset resolving, manifest collection, dev serving, and build copying.
- The `public/images` symlink should no longer be required for content-owned images after the new pipeline is implemented.
- Content migration in `ceynri-words` is expected separately: article-private images should move toward `blog/assets/<slug>/`, and shared public images may use `assets/` when they are intentionally consumed.
