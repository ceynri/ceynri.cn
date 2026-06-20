## Context

`ceynri-words` is the upstream content repository. `ceynri.cn` is a downstream Astro site that consumes selected public collections from that content source. Today, content-owned images are exposed through `public/images` symlinks and a Markdown-specific `remarkRelateImageLinks` plugin. That works for simple URL access, but it conflates three separate concerns: content URI parsing, asset publication, and floating-image behavior.

The new design treats images as content assets owned by `ceynri-words`, not as Markdown appendages. Markdown image syntax and Markdown links are only consumers of those assets. `ceynri.cn` decides which referenced assets are published as part of the public content closure.

## Goals / Non-Goals

**Goals:**
- Resolve image asset references from Markdown `image` nodes and image `link` nodes through one semantic pipeline.
- Support content-root asset URIs such as `/blog/assets/<slug>/<file>` and `/assets/<file>`.
- Keep `outputUrl` equal to `contentUri` initially, while preserving a resolver boundary for future route remapping.
- Publish only image assets explicitly referenced by public content.
- Fail fast when public content references a missing local image asset.
- Replace `public/images` symlink dependence for content-owned images.
- Keep floating-image behavior working for Markdown links that point to local image assets.

**Non-Goals:**
- Optimizing floating-image assets through Astro image transforms in the first implementation.
- Publishing entire `assets/` directories by default.
- Migrating all existing `ceynri-words` files in this change.
- Supporting non-image assets such as PDF, audio, or downloads in the first implementation.
- Changing final article route structure, such as removing `/blog/` from page URLs.

## Decisions

### Use a shared content asset resolver

Introduce a resolver that returns a three-part result:

```ts
interface ResolvedContentAsset {
  contentUri: string;
  sourcePath: string;
  outputUrl: string;
}
```

For the first implementation, `outputUrl = contentUri`. The explicit `outputUrl` field keeps room for later route remapping, for example mapping `/blog/assets/<slug>/a.png` to `/assets/<slug>/a.png` without changing Markdown source.

Alternatives considered:
- Treat Markdown URLs as final website URLs directly. Rejected because `ceynri-words` is upstream and should not encode all downstream routing decisions.
- Continue matching path segments such as `/images/`. Rejected because it is string-shape based rather than content-root semantics.

### Collect assets in the Markdown pipeline

Upgrade `remarkRelateImageLinks` into `remarkContentAssets`. The plugin will inspect Markdown AST nodes, not raw source text:

- `image` nodes for normal Markdown images.
- `link` nodes whose URL points to a supported image extension for floating-image links.

For each local image asset reference, the plugin resolves, validates, records it into an in-memory manifest, and rewrites the node URL to `outputUrl`.

Alternatives considered:
- Scan raw Markdown files before build. Rejected because AST processing is more semantic and less fragile around Markdown syntax edge cases.
- Collect assets in `rehypeImageLinks`. Rejected because the concern is Markdown content asset resolution, while `rehypeImageLinks` should only annotate HTML links for runtime floating-image behavior.

### Keep the manifest in memory

The asset manifest is process-local build state. It is a `Map` keyed by `outputUrl` or `contentUri`, containing `sourcePath` and `outputUrl`.

Alternatives considered:
- Write a manifest file to disk. Rejected because it creates cache invalidation and gitignore concerns without being a source of truth.

### Serve and copy assets through a Vite/Astro plugin

Add a content assets Vite plugin used by `astro.config.ts`:

- In dev, intercept requests for manifest-compatible output URLs and stream the corresponding source file.
- In build, copy manifest entries into `dist` at their `outputUrl` path after bundle generation.

The dev server may resolve requested URLs on demand so newly referenced assets work without requiring a stale manifest file.

Alternatives considered:
- Keep symlinking content assets into `public/`. Rejected because it publishes by directory presence and couples local filesystem layout to site output.
- Copy whole asset directories. Rejected because publish scope should be the public content asset closure, not the entire upstream resource pool.

### Fail on missing referenced assets

When public content references a local image asset that cannot be resolved to an existing file, the build/dev pipeline throws a descriptive error with the Markdown file path, original URL, and expected source path.

Alternatives considered:
- Keep the original URL and warn. Rejected because broken floating-image links can be easy to miss and should not silently ship.

### Preserve `rehypeImageLinks` as a runtime annotation plugin

`rehypeImageLinks` remains responsible for adding `data-image-link` to anchor tags that point to image URLs. It should not decide which assets are published or where they live.

## Risks / Trade-offs

- [Risk] Astro build hook ordering may run asset copying before all Markdown files have been compiled. → Mitigation: validate hook timing during implementation; if needed, copy in `closeBundle` and add a build verification step that checks referenced output files exist.
- [Risk] Dev requests may arrive for an asset URL before the Markdown file that referenced it has populated the manifest. → Mitigation: dev middleware should use the same resolver on demand for supported content asset URI prefixes.
- [Risk] Frontmatter image fields such as `cover_image` may use Astro's built-in image handling and should not be double-published by the first implementation. → Mitigation: first implementation scopes `remarkContentAssets` to Markdown `image` and image `link` nodes only; frontmatter assets can be added later if needed.
- [Risk] Existing content still uses `../images/...` paths during migration. → Mitigation: support relative paths as compatibility input, but recommend content-root `/blog/assets/...` and `/assets/...` going forward.
- [Risk] SVG/GIF handling differs from raster image optimization. → Mitigation: first implementation treats all supported image extensions as static content assets, not optimized image transforms.
