## 1. Content Asset Core

- [x] 1.1 Create a shared content asset resolver that accepts Markdown URL, Markdown file path, and active `contentBase`, then returns `contentUri`, `sourcePath`, and `outputUrl`.
- [x] 1.2 Support content-root URIs (`/blog/assets/...`, `/assets/...`) and compatibility relative paths (`./...`, `../...`) for supported image extensions.
- [x] 1.3 Add an in-memory content asset manifest with de-duplication by resolved `outputUrl`.
- [x] 1.4 Make missing local image assets throw descriptive errors containing Markdown file path, original URL, and expected source path.

## 2. Markdown Plugin Migration

- [x] 2.1 Replace `remark-relate-image-links.ts` with a generalized `remark-content-assets.ts` plugin.
- [x] 2.2 Collect and rewrite Markdown `image` nodes that reference local image assets.
- [x] 2.3 Collect and rewrite Markdown `link` nodes that reference local image assets for floating-image usage.
- [x] 2.4 Keep external URLs and unsupported local file extensions unchanged.
- [x] 2.5 Update plugin exports and `astro.config.ts` Markdown plugin registration to use `remarkContentAssets`.

## 3. Dev and Build Publishing

- [x] 3.1 Replace the current `/images`-specific dev middleware with content asset middleware for resolved asset output URLs.
- [x] 3.2 Add build-time copying from manifest `sourcePath` to `dist` path derived from `outputUrl`.
- [x] 3.3 Ensure copied assets are limited to manifest entries rather than whole `assets` directories.
- [x] 3.4 Remove reliance on `public/images` symlink for content-owned images.

## 4. Content Source Integration

- [x] 4.1 Centralize active content source resolution so `src/content.config.ts`, Markdown plugins, and asset publishing use the same `CONTENT_BASE` fallback behavior.
- [x] 4.2 Preserve default behavior with `content/` submodule when no local `CONTENT_BASE` is configured.
- [x] 4.3 Preserve local development behavior where `CONTENT_BASE` points at an uncommitted `ceynri-words` working tree.

## 5. Verification and Documentation

- [x] 5.1 Add coverage or fixture checks for content-root asset URIs, relative asset paths, duplicate references, external URLs, unsupported extensions, and missing files.
- [x] 5.2 Verify floating-image links still receive `data-image-link` and load through the published asset URL.
- [x] 5.3 Verify production build copies only referenced public-content image assets.
- [x] 5.4 Update project documentation to state that `ceynri-words` is the upstream content source and `ceynri.cn` publishes only selected public content plus its referenced image asset closure.
