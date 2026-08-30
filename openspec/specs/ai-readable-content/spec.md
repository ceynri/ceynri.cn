# ai-readable-content Specification

## Purpose

将博客文章以 AI 可读的纯 Markdown 形式发布：为每篇文章生成 Markdown 孪生（`/blog/<slug>.md`）、站点索引 `/llms.txt`，并在 HTML `<head>` 输出 `<link rel="alternate" type="text/markdown">` 发现标签。使 `summary` frontmatter 字段从「仅本地用」转为「只给 AI、人不看」的发布内容。frontmatter 白名单制（默认私有）；正文经净化（删注释、ruby 用 `<rp>` 降级、保留语义标签、本地图降级为文本占位——Astro 优化原图不对外发布）。

## Requirements

### Requirement: Per-post Markdown twin

The system SHALL emit a Markdown representation for every published blog post at `/blog/<slug>.md`, generated from the post's Markdown source during the same build as its HTML page.

#### Scenario: Published post has a Markdown twin

- **WHEN** a blog post passes the published filter and is built
- **THEN** the system emits `/blog/<slug>.md` whose body is derived from the same Markdown source as the post's HTML page

#### Scenario: Unpublished or draft post has no twin

- **WHEN** a blog post does not pass the published filter
- **THEN** the system does not emit a Markdown twin for it

#### Scenario: Twin path mirrors HTML path

- **WHEN** a published post is reachable at `/blog/<slug>/`
- **THEN** its Markdown twin is reachable at `/blog/<slug>.md`

### Requirement: Whitelisted Markdown twin frontmatter

The system SHALL include a YAML frontmatter block on each Markdown twin containing only whitelisted metadata, and SHALL NOT expose non-whitelisted fields.

#### Scenario: Whitelisted fields exposed

- **WHEN** a Markdown twin is generated
- **THEN** its frontmatter includes `title`, `date`, `canonical_url`, and, when present on the post, `lastmod`, `tags`, `description`, and `summary`

#### Scenario: Non-whitelisted fields withheld

- **WHEN** a post's source frontmatter contains fields outside the whitelist (such as `slug`, `published`, `comment`, `layout`, `toc`, `tocDepth`, `cost`, `related`, `createdAt`, `publishedAt`, `cover_image`)
- **THEN** the Markdown twin does not include them

#### Scenario: summary and description are independent

- **WHEN** a post has a `summary` but no `description`, or vice versa
- **THEN** the twin emits whichever field is present and omits the absent one, without substituting one for the other

#### Scenario: New fields are private by default

- **WHEN** a frontmatter field is added to the blog schema that is not in the whitelist
- **THEN** it is not exposed in the Markdown twin unless explicitly added to the whitelist

### Requirement: Sanitized Markdown body

The system SHALL sanitize the Markdown twin body so that it carries the full post content while normalizing inline HTML, stripping comments, and resolving local image references.

#### Scenario: HTML comments stripped

- **WHEN** the post body contains HTML comments
- **THEN** the Markdown twin body does not contain them

#### Scenario: Ruby degraded via author fallback

- **WHEN** the post body contains a `<ruby>` element with `<rp>` fallback delimiters and `<rt>` annotation
- **THEN** the Markdown twin renders it as base text followed by the annotation wrapped in the author's `<rp>` delimiters, without the ruby tag skeleton

#### Scenario: Semantic inline HTML preserved

- **WHEN** the post body contains semantically meaningful inline HTML such as `<details>`, `<summary>`, `<u>`, or `<kbd>`
- **THEN** the Markdown twin preserves those tags

#### Scenario: Layout-only HTML unwrapped or dropped

- **WHEN** the post body contains layout-only or non-exposed HTML such as `<br>` or `<center>`
- **THEN** the Markdown twin unwraps it (keeping inner content) or drops it when it carries no content

#### Scenario: Unknown HTML keeps inner content

- **WHEN** the post body contains an HTML tag with no explicit policy
- **THEN** the Markdown twin keeps its inner text content rather than silently dropping it

#### Scenario: Local body images degrade to text placeholder (interim)

- **WHEN** the post body references a local image (Markdown image node) via a relative or content-root path
- **THEN** the Markdown twin replaces it with a text placeholder carrying the readable alt description (image-processing directives such as `?size=` stripped), and does not emit an original-image URL
- **NOTE**: Body images are optimized by Astro and their originals are not published, so an original-image URL would 404. Pointing the twin at a published optimized image is deferred to a follow-up change; see design.

#### Scenario: Local image-pointing links drop the link (interim)

- **WHEN** the post body contains a Markdown link pointing to a local image (e.g. "view original")
- **THEN** the Markdown twin keeps the link text but drops the link target, because original images are not published

#### Scenario: Remote image references unchanged

- **WHEN** the post body references an image via `http`, `https`, or `data` URL
- **THEN** the Markdown twin leaves the URL unchanged

### Requirement: llms.txt site index

The system SHALL emit a `/llms.txt` file listing all published blog posts as links to their Markdown twins.

#### Scenario: Index lists published posts

- **WHEN** an agent requests `/llms.txt`
- **THEN** the file contains an H1 site name, a blockquote intro, and a Blog section listing each published post as a Markdown link to its `/blog/<slug>.md` twin

#### Scenario: Summary annotation only when present

- **WHEN** a listed post has a `summary`
- **THEN** its index entry is annotated with that summary; posts without a `summary` are listed with title and link and no annotation

#### Scenario: Unpublished posts excluded

- **WHEN** a post does not pass the published filter
- **THEN** it does not appear in `/llms.txt`

### Requirement: Markdown twin discovery from HTML

The system SHALL advertise each post's Markdown twin from that post's HTML `<head>` via a `rel="alternate"` link, without affecting human-facing rendering.

#### Scenario: Post page advertises its twin

- **WHEN** a blog post HTML page is rendered
- **THEN** its `<head>` contains `<link rel="alternate" type="text/markdown" href="/blog/<slug>.md">`

#### Scenario: Non-post pages carry no Markdown link

- **WHEN** a non-post page is rendered
- **THEN** its `<head>` does not contain a `text/markdown` alternate link unless one is explicitly provided
