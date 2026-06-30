# blog-toc

A PC-only "rail" style table of contents for long-form articles.

> 中文（主文档）：见 [README.md](./README.md)

When collapsed it is a set of bare lines pinned to the right edge and vertically centered — a minimap of the article's headings. On hover it expands leftward into a text TOC panel. As you scroll it renders a **two-dimensional progress** (which sections are on screen, and how much of each you have read) and shows an overall reading percentage.

The goal is a restrained, non-intrusive in-page navigation + progress indicator. It is built as a self-contained, configuration-driven module designed to be extractable into a standalone package.

## Features

- **Collapsed rail**: H2 is the longest line, lines get shorter per level (H3…H6); right-aligned so shorter lines read as indentation. Deliberately low presence.
- **Hover panel**: expands leftward over the content, with the article H1 as the card header; the on-screen section(s) are highlighted; clicking an item smooth-scrolls to it.
- **2D progress**: the viewport window is projected onto the article to produce a highlight band that can span multiple lines (boundary lines are partially filled by their visible ratio). The band's midpoint is kept centered in the rail (clamped at the head/tail).
- **Reading percentage**: computed with the viewport mid-line as the focus and the article body as the basis.
- **Configurable depth**: via component prop and/or per-article front matter.
- **Render thresholds**: not rendered when there are too few headings; not mounted below a viewport breakpoint.
- **Themed via CSS variables**: no hard-coded colors.

## Usage

```astro
---
import { render } from 'astro:content';
import { TocRail } from '~/components';

const post = Astro.props.post;
const { title, tocDepth, toc } = post.data;
const { headings } = await render(post);
---

<article data-toc-body>
  <Content />
</article>

{toc !== false && (
  <TocRail headings={headings} title={title} maxDepth={tocDepth} />
)}
```

Notes:

- Add `data-toc-body` to the article container. It defines the basis for the reading percentage and the highlight range (excluding cover image, comments, footer, etc.).
- `headings` comes straight from Astro's `render()`. Heading `id`s are produced by Astro's built-in `rehypeHeadingIds`, so **no extra slug plugin is required**.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `headings` | `MarkdownHeading[]` | — | `render()` headings (all levels; filtered internally) |
| `title` | `string` | — | Article title (H1), used as the panel header |
| `maxDepth` | `number` (2–6) | `3` | Deepest heading level to collect. Pass the per-article front matter value here to override per article |
| `minHeadings` | `number` | `2` | Below this heading count the component renders nothing |
| `breakpoint` | `number` | `1024` | Below this viewport width the component is not mounted |
| `bodySelector` | `string` | `[data-toc-body]` | Selector for the article body range |
| `class` | `string` | — | Passed through to the root `<nav>` |

H1 is never drawn in the rail, never counted in collection, and never adds an indent level; it only serves as the panel header.

## Front matter (consuming project)

The fields must be declared in the content collection schema, otherwise zod strips them:

```ts
tocDepth: z.number().int().min(2).max(6).optional(),
toc: z.boolean().optional().default(true),
```

- `tocDepth`: deepest heading level to collect for this article (2–6). Pass it to the component's `maxDepth` prop.
- `toc: false`: disable the TOC for this article.

## Theming (CSS variables)

The module declares all `--toc-*` defaults in one block on `:root`, and reads them via `var(--toc-*)`. A consumer overrides them by setting the same variables on `.toc-rail`. Because a value set on the element itself (`.toc-rail`) always wins over a value inherited from an ancestor (`:root`), the consumer override applies cleanly — independent of CSS `@layer` order or scoped-style specificity. (Declaring defaults on the component's own `.toc-rail` would not work: Astro scopes it to `.toc-rail[data-astro-cid]`, adding specificity that outranks a plain consumer `.toc-rail`.) In this project the mapping lives in `src/styles/global.css` and points at the semantic color tokens so it follows light/dark switching.

Color variables (named `element-part`):

| Variable | Element |
| --- | --- |
| `--toc-rail-line-color` | the faint base line in the collapsed rail |
| `--toc-rail-highlight-color` | the moving 2D highlight bar |
| `--toc-percent-color` | the reading-percentage text |
| `--toc-panel-bg` / `--toc-panel-shadow` | the hover panel surface |
| `--toc-panel-title-color` | the panel header (H1) |
| `--toc-panel-item-color` | a normal TOC item |
| `--toc-panel-item-active-color` | the current (on-screen) item |
| `--toc-panel-item-hover-color` | a hovered item |

Size variables:
`--toc-len-2`…`--toc-len-6` · `--toc-line-thickness` · `--toc-line-gap` · `--toc-max-height` · `--toc-right` · `--toc-panel-width` · `--toc-indent`

Example:

```css
.toc-rail {
  --toc-rail-highlight-color: var(--title-color); /* neutral, not attention-grabbing */
  --toc-rail-line-color: var(--border-color);
  --toc-panel-item-hover-color: var(--accent-color);
}
```

## Boundaries

- **PC only**: not mounted below `breakpoint`. A mobile TOC, if needed, must be implemented separately by the consuming project.
- The rail does not respond to wheel scrolling; it is positioned automatically by code. When the lines overflow `--toc-max-height` the rail scrolls internally with gradient masks at the top and bottom edges.

## Files

- `core.ts` — zero-dependency pure logic (section ranges, highlight band, centering, percentage). Unit-tested.
- `core.test.ts` — vitest covering the boundary scenarios.
- `toc-rail.astro` — the component shell (DOM, portable CSS-variable theme, client script).
- `index.ts` — barrel exports.

## Internals (for maintainers)

Only the non-obvious constraints; read before changing:

1. **All pure logic lives in `core.ts`** (zero-dependency, no DOM, unit-tested). When changing geometry/progress math, update `core.test.ts` and run `pnpm test`. The `<script>` in `toc-rail.astro` only does "measure DOM geometry → call core → write styles back".
2. **One core concept for progress**: the viewport window is projected onto section ranges to get a highlight band; the band's midpoint is centered in the rail (clamped). The reading percentage is a separate, simple calculation (viewport mid-line focus + body range). Do not introduce a second "single focus point" rule.
3. **Heading `id` source**: Astro's `@astrojs/markdown-remark` unconditionally adds `rehypeHeadingIds` in its `unified()` pipeline (adds `id` + produces `render().headings`). This project's custom `markdown.processor` does not bypass it, so `rehype-slug` is not needed — don't break this when changing the markdown pipeline in `astro.config.ts`.
4. **Theme variables: defaults on `:root`, overrides on `.toc-rail`** (see Theming above for why). New configurable variables follow the same pattern; colors and sizes alike.
5. **Highlight rendering is a stateless pure function**: `computeLineFills` gives every line, every frame, a definite value from one formula — `start=clamp01((viewTop-top)/h)`, `end=clamp01((viewBottom-top)/h)`. Off-screen sections naturally collapse to zero width (`[1,1]` above / `[0,0]` below — zero width is invisible), so **no opacity show/hide and no frozen position are needed**. `left/right` keep a CSS transition for smoothness. Leaving a section is a continuous collapse toward its own edge (never a right-to-left slide); only on an instant large scroll jump does it show one physically-consistent quick sweep (an acceptable extreme of the window-band model). Only genuinely visible lines (`end>start`) count toward rail centering and panel highlighting.
6. **Empty-highlight fallback**: when no section is on screen, position the rail by scroll position — sink to the bottom when scrolled past the body (finished), pin to the top when not yet reached; do not fall back to the default top.
7. **Thresholds are owned by the component**: depth clamping `[2,6]` and "render nothing when headings < minHeadings" live inside the component; the consumer only passes `headings/title/maxDepth` and uses `toc !== false` as a content-level switch — don't duplicate the gating outside.
8. **Quality gate**: `pnpm test` + `pnpm check` (biome) + `pnpm build` (astro check + build).
