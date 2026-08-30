## Why

Blog posts carry a `summary` frontmatter field that is currently only used for local search/preview. It is not rendered into the public HTML pages, so neither human readers nor AI agents can consume it from the published site. At the same time, AI agents increasingly fetch web content as Markdown rather than HTML: the `llms.txt` convention and `rel="alternate" type="text/markdown"` discovery are becoming the de-facto way to give agents a token-efficient, clean representation of a page.

`ceynri.cn` wants to treat AI agents as first-class readers of the same canonical content, without changing what human visitors see. This requires publishing a per-post Markdown twin that (a) exposes the AI-only `summary` in a place agents naturally read (YAML frontmatter), and (b) serves a *selectively sanitized* body — full content, but with relative image links resolved to absolute original-image URLs, HTML comments stripped, and inline HTML normalized (ruby degraded via its `<rp>` fallback, semantic tags like `details`/`summary` preserved). The site also needs a machine-readable index (`/llms.txt`) so agents can discover these Markdown twins.

## What Changes

- Add a per-post Markdown endpoint `src/pages/blog/[...slug].md.ts` that shares `getStaticPaths` with the HTML page and emits `/blog/<slug>.md` for every published post.
- Emit a YAML frontmatter block on each Markdown twin containing a **whitelist** of metadata (`title`, `date`, `lastmod`, `tags`, `description`, `summary`, `canonical_url`); implementation/private fields (`slug`, `published`, `comment`, `layout`, `toc*`, `cost`, `related`, `createdAt`, `publishedAt`) are NOT exposed.
- Emit a sanitized body: the full Markdown source passed through a dedicated remark-based sanitize pipeline (parse → transform → stringify) that:
  - rewrites local image references to absolute original-image URLs via the existing content-assets resolver,
  - strips HTML comments,
  - degrades `<ruby>` to its `<rp>` fallback text for reading fluency,
  - preserves semantically meaningful inline HTML (`details`/`summary`, `u`, `kbd`, etc.),
  - unwraps/drops layout-only or non-exposed HTML (`br`, `center`, etc.).
- Add `/llms.txt` (`src/pages/llms.txt.ts`): a site-level index following the llms.txt convention — H1 site name, blockquote intro, and an H2 "Blog" section listing each published post as a link to its Markdown twin, annotated with `summary` only when present (never substituted with `description`).
- Add a discovery tag on post pages: `<link rel="alternate" type="text/markdown" href="/blog/<slug>.md">` in `BaseHead`, threaded through `BaseLayout` / `BlogPostLayout`.

## Capabilities

### New Capabilities
- `ai-readable-content`: Defines how published blog posts are exposed to AI agents as Markdown — the per-post Markdown twin (whitelist frontmatter + sanitized body), the sanitization rules for inline HTML / comments / image links, and the site-level `llms.txt` index plus HTML discovery tag.

### Modified Capabilities
- `blog-content`: Clarifies that published blog output additionally includes a Markdown representation per post and that the `summary` frontmatter field is published (in the Markdown twin and `llms.txt`) while remaining absent from human-facing HTML.

## Impact

- New endpoints: `src/pages/blog/[...slug].md.ts`, `src/pages/llms.txt.ts`.
- New sanitize pipeline: a remark/unified transform under `src/plugins/` (or `src/utils/`) that reuses `remark-parse` / `remark-stringify` (already present via `@astrojs/markdown-remark`) and the existing content-assets resolver (`isLocalImageAssetUrl` / `resolveContentAssetReference`).
- Modified components: `src/components/base-head.astro` (new optional `markdownUrl` prop), `src/layouts/base-layout.astro` and `src/layouts/blog-post-layout.astro` (prop threading).
- No runtime/platform dependency: pure SSG output; works on any static host. Same-URL content negotiation (`Accept: text/markdown`) is explicitly out of scope.
- No change to human-facing rendered pages.
