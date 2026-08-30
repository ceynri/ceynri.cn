## 1. Sanitize pipeline

- [x] 1.1 Create a Markdown sanitize module (pure function: Markdown source string + resolve context → sanitized Markdown string) under `src/plugins/` or `src/utils/`, built on `remark-parse` + `remark-stringify` + `remark-gfm` (reuse existing toolchain, no hand-written parser/serializer).
- [x] 1.2 Implement the inline-HTML policy on mdast `html` nodes: strip comments; degrade `<ruby>` via the author's `<rp>` fallback (`{base}({rt})` with author delimiters); preserve `<details>`/`<summary>`/`<u>`/`<kbd>`; unwrap-or-drop layout-only tags (`<br>`, `<center>`); default unknown tags to keep inner content.
- [x] 1.3 Implement local image resolution: rewrite Markdown `image` nodes and image-pointing `link` nodes with relative/content-root paths to absolute original-image URLs using `isLocalImageAssetUrl` / `resolveContentAssetReference` and the configured site origin; leave remote/`data:` URLs unchanged.
- [x] 1.4 Add unit tests covering comment stripping, ruby degradation, preserved/semantic tags, layout-tag unwrap/drop, unknown-tag fallback, local-vs-remote image rewriting, and a realistic full-body fixture.

## 2. Per-post Markdown endpoint

- [x] 2.1 Create `src/pages/blog/[...slug].md.ts` with `getStaticPaths` identical in shape to `[...slug].astro` (`getCollection('blog', publishedPostFilter)` → `{ params: { slug: post.id }, props: post }`).
- [x] 2.2 Build the whitelist frontmatter emitter (`title`, `date`, `canonical_url`, optional `lastmod`/`tags`/`description`/`summary`), explicitly excluding non-whitelisted fields; YAML-escape string values.
- [x] 2.3 Compose the response body (`# {title}` + optional `> {summary}` lead + sanitized body) and return it with `Content-Type: text/markdown; charset=utf-8` and a `Link: <canonical>; rel="canonical"` header.
- [x] 2.4 Verify `astro build` emits `/blog/<slug>.md` for published posts and none for unpublished/draft posts.

## 3. llms.txt index

- [x] 3.1 Create `src/pages/llms.txt.ts` emitting `text/plain` Markdown at `/llms.txt` with H1 site name, blockquote description, and a `## Blog` section.
- [x] 3.2 List published posts sorted by `publishedAt || date` descending, each as `- [{title}]({absolute .md URL})` annotated with `: {summary}` only when present.
- [x] 3.3 Verify unpublished posts are excluded and `/llms.txt` resolves in dev and build output.

## 4. Discovery tag

- [x] 4.1 Add an optional `markdownUrl?: string` prop to `src/components/base-head.astro` that renders `<link rel="alternate" type="text/markdown">` only when provided.
- [x] 4.2 Thread `markdownUrl` through `src/layouts/base-layout.astro` and pass `/blog/${post.id}.md` from `src/layouts/blog-post-layout.astro`.
- [x] 4.3 Verify the tag appears on post pages and not on non-post pages, with no change to visible rendering.

## 5. Verification and documentation

- [x] 5.1 Run `pnpm build` (astro check + build) and `pnpm lint`; fix any type/lint issues.
- [x] 5.2 Manually inspect a sample built twin for: whitelist-only frontmatter, stripped comments, degraded ruby, preserved semantic tags, absolute image URLs, and correct canonical link.
- [x] 5.3 Confirm the change is purely additive (no human-facing rendering change) and that removing the new files + `markdownUrl` prop fully rolls back.
- [x] 5.4 Update `AGENTS.md` (directory structure / content-publishing notes) and `knowledge/README.md` index if a knowledge doc is warranted, to record the AI-readable publishing capability.
