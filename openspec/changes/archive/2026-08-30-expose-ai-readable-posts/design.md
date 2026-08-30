## Context

`ceynri.cn` is a pure-SSG Astro site that renders public blog posts from the upstream `ceynri-words` content source into human-facing HTML. The `summary` frontmatter field exists on posts but is never published. Meanwhile, the agent-readable web has converged on a clear pattern (llms.txt v2, Vercel, Cloudflare "Markdown for Agents", Anthropic/Stripe docs): **the same canonical resource should offer a clean Markdown representation for AI agents**, discovered via `/llms.txt` and `rel="alternate" type="text/markdown"`, served from the content source rather than reverse-converted from rendered HTML.

Because the site is statically hosted (platform is not fixed), we cannot rely on edge/server content negotiation. The whole capability must be achievable at build time.

## Goals / Non-Goals

**Goals:**
- Publish a Markdown twin `/blog/<slug>.md` for every published post, generated from the Markdown *source* (not from rendered HTML).
- Expose `summary` (and other whitelisted metadata) in the twin's YAML frontmatter — the canonical place agents read first — while keeping it out of human-facing HTML.
- Selectively expose metadata: only a whitelist; never private/implementation fields.
- Sanitize the body: full content, but image links resolved to absolute original-image URLs, comments stripped, ruby degraded via `<rp>`, semantic inline HTML preserved, layout-only HTML unwrapped/dropped.
- Publish `/llms.txt` indexing all published posts, linking to their Markdown twins, annotating with `summary` only when present.
- Advertise the twin from each post's HTML `<head>` via `rel="alternate" type="text/markdown"`.
- Zero new platform dependency; minimal (ideally zero) new npm dependency by reusing the already-present remark/unified toolchain and the content-assets resolver.

**Non-Goals:**
- Same-URL content negotiation (`Accept: text/markdown`) — requires a dynamic edge/server; may be layered on later by pointing at these `.md` assets.
- Markdown twins / llms.txt coverage for the `pages` and `poems` collections (this change is blog-focused).
- Re-implementing a Markdown parser/serializer — delegated to `remark-parse`/`remark-stringify`.
- Byte-for-byte parity between the Markdown twin's inline-HTML exposure and the final rendered page. The twin is an AI-facing approximation, not a render replica.
- Backfilling `summary` for existing posts (a separate content effort if desired).

## Decisions

### Decision 1: Per-post Markdown twin at `/blog/<slug>.md`

Add `src/pages/blog/[...slug].md.ts` with the same `getStaticPaths` body as `[...slug].astro` (both call `getCollection('blog', publishedPostFilter)` and map to `{ params: { slug: post.id }, props: post }`). Astro's file-based routing emits this endpoint as `/blog/<slug>.md`.

Why the `.md`-suffixed form (`/blog/<slug>.md`) rather than `/blog/<slug>/index.md`: it is the form Astro's route naturally produces for a `[...slug].md.ts` endpoint, it is the most guessable convention (agents and tools that probe `.md` extensions find it without prior knowledge), and the llms.txt spec lists `.md`-suffix as an accepted twin form. Note: some static servers may serve `.md` as `text/plain` or trigger a download; this is acceptable because agents read the content regardless of exact MIME. The route can be revisited when adding content negotiation later.

Alternative considered: one aggregate `llms-full.txt` with all posts concatenated. Rejected as the primary mechanism — per-post twins give finer-grained fetch control and better cacheability; an aggregate may be added later.

### Decision 2: Whitelist frontmatter, generated not copied

The twin's frontmatter is built explicitly from a whitelist rather than copying the raw frontmatter:

- Expose: `title`, `date` (ISO), `lastmod` (ISO, when present), `tags`, `description` (when present), `summary` (when present), `canonical_url` (absolute HTML URL).
- Do NOT expose: `slug`, `published`, `comment`, `layout`, `toc`, `tocDepth`, `cost`, `related`, `createdAt`, `publishedAt`, `cover_image`, and any future private field.

Rationale: the default posture is "not exposed unless whitelisted", so newly added frontmatter fields stay private by default. `canonical_url` lets agents cite the human-facing page. `summary` and `description` are independent fields — each is emitted only when present, and neither substitutes for the other.

Body is rendered as `# {title}` + an optional `> {summary}` lead + the sanitized body, so the frontmatter and the visible lead reinforce each other for agents that skip YAML parsing.

### Decision 3: Sanitize on the mdast, reusing the existing remark toolchain

Sanitization operates on the Markdown AST (mdast), not on raw text or rendered HTML:

```
remark-parse(body, gfm)  →  [sanitize transform]  →  remark-stringify  →  clean markdown
```

- `remark-parse`, `remark-stringify`, `remark-gfm`, `mdast-util-from-markdown`, `mdast-util-to-markdown`, and `unified` are already in `node_modules` as transitive deps of `@astrojs/markdown-remark`. They are used directly; no parser/serializer is hand-written.
- The sanitize transform is a small local plugin (a few `visit` callbacks + a tag policy table). This is the part no off-the-shelf package provides.

Why not an off-the-shelf "clean markdown" package: none exists for this exact combination. Most unified sanitize/strip tooling works on the **hast** (HTML) side (`rehype-sanitize`, `rehype-remove-comments`) or targets plain-text excerpts (`strip-markdown`). "Stay in Markdown, but finely policy the inline HTML" is a niche no single package covers. `vitepress-plugin-llms`' `remarkPlease` is the closest reference for policy-driven handling of mdast `html` nodes and can inform the implementation.

Why mdast instead of regex over source text: inline HTML in Markdown becomes `html` nodes in mdast, so tag-level policy (keep/degrade/unwrap/drop) is structured and testable rather than brittle string surgery.

### Decision 4: Inline HTML / comment / image policy

In Markdown, raw inline HTML surfaces as `html` mdast nodes (a run of tags may split across several nodes). The transform applies a per-tag policy:

- **Comments** `<!-- ... -->`: removed.
- **`<ruby>`**: degraded using the author's existing `<rp>` fallback — output `{base}({rt})` using the `<rp>` delimiters the author already wrote (e.g. `<ruby>漢<rp>（</rp><rt>かん</rt><rp>）</rp></ruby>` → `漢（かん）`). The tag skeleton is dropped for reading fluency. Because authors already maintain `<rp>` fallbacks, this reuses their intent instead of inventing a new degradation.
- **Preserved**: `<details>`, `<summary>`, `<u>`, `<kbd>` and similarly semantic, non-flow-breaking tags are kept as-is (agents understand their semantics).
- **Unwrapped/dropped**: layout-only or non-exposed tags such as `<br>`, `<center>` are unwrapped (keep inner content, drop tag) or dropped when they carry no content.
- **Unknown tags**: default to unwrap (keep inner text) — conservative, never silently drops author content.

Image handling (revised after a discovered 404 bug — see "Follow-up: optimized images" below):
- **Local body images** (`image` nodes) are degraded to a **text placeholder** carrying the readable alt description (with image-processing directives such as `?size=` stripped), e.g. `（图：封面）`. No URL is emitted.
- **Local image-pointing links** ("view original") keep their link text but drop the link target.
- **Remote/`data:` image URLs** are left unchanged.

Why placeholders instead of URLs: body images are optimized by Astro into hashed `/assets/*.webp` and their originals are NOT copied to `dist`. The earlier approach — rewriting body images to original-image URLs (`/blog/<year>/assets/...`) via the content-assets resolver — produced URLs that 404 in production (only floating-image *link* originals are copied, not body-image originals). Since the site does not intend to publish originals at all, emitting those URLs was wrong. Placeholders keep the twin honest and immediately usable.

### Follow-up: optimized images (separate change, not this one)

The user's longer-term intent is to use **Astro-optimized images** everywhere and never expose originals — covering the Markdown twin, the floating-image feature, and any "view original" links. That requires a reliable "source image → chosen optimized variant" mapping (one source maps to many width/format variants, decided only at Astro render time), which couples into Astro's image pipeline. It is deliberately split into a follow-up change (`use-optimized-images-everywhere`) rather than rushed into this one. When that lands, the twin's image placeholders should be upgraded to point at the chosen optimized image URL.

### Decision 5: `/llms.txt` site index

`src/pages/llms.txt.ts` emits `text/plain` (Markdown-formatted) at `/llms.txt`:

```
# {SITE_TITLE}

> {SITE_DESCRIPTION}

## Blog

- [{title}](https://ceynri.cn/blog/<slug>.md): {summary}   ← annotation only when summary present
```

- Sorted by `publishedAt || date` descending, mirroring `feed.xml.ts`.
- Only published posts (`publishedPostFilter`).
- Annotation uses `summary` only; posts without `summary` are listed with title + link and no annotation. `description` is never used as a stand-in.

### Decision 6: Discovery via `rel="alternate"` in `BaseHead`

`BaseHead` gains an optional `markdownUrl?: string` prop. When present it renders `<link rel="alternate" type="text/markdown" href={markdownUrl}>`. `BaseLayout` accepts and forwards it; `BlogPostLayout` passes `/blog/${post.id}.md`. Non-post pages are unaffected (prop absent → no tag). This is invisible to human rendering and SEO-neutral.

## Risks / Trade-offs

- **Two representations may drift** (HTML body vs sanitized Markdown). Mitigation: both derive from the same `post.body` in the same build; add a build-time assertion that every published post produces a non-empty `.md` twin containing its `# {title}` heading.
- **Static `.md` MIME**: some hosts serve `.md` as `text/plain`/download. Accepted for now; agents read content regardless. Revisit if/when content negotiation is added.
- **Inline-HTML policy edge cases** (nested/malformed tags): mitigated by operating on mdast nodes and defaulting unknown tags to unwrap-keep-content rather than drop.
- **Dependency pinning**: relying on transitive remark/unified packages means a major Astro bump could change them. Mitigation: declare the used packages as direct devDependencies if `astro check`/build complains, but prefer zero-new-dep first.

## Migration Plan

1. Implement sanitize transform + unit tests (pure function over Markdown string → Markdown string).
2. Add `[...slug].md.ts` endpoint; verify emitted files in `dist`.
3. Add `llms.txt.ts`; verify `/llms.txt`.
4. Thread `markdownUrl` through `BaseHead`/layouts; verify `<link>` on post pages only.
5. Build, run dead-link/CI gate, verify a sample twin's frontmatter whitelist and body sanitization by hand.

Rollback: the change is additive (new endpoints + one optional head tag). Removing the new files and the `markdownUrl` prop fully restores prior behavior; no content migration needed.
