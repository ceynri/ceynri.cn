## MODIFIED Requirements

### Requirement: Sanitized Markdown body

The system SHALL sanitize the Markdown twin body so that it carries the full post content while normalizing inline HTML, stripping comments, and resolving local image references to published optimized images.

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

#### Scenario: Local body images become optimized image URLs

- **WHEN** the post body references a local image (Markdown image node) via a relative or content-root path
- **THEN** the Markdown twin emits a Markdown image pointing at the published Astro-optimized image URL (本站 `build.assets='assets'`，即 `![alt](/assets/....webp)`，可用 site 拼绝对), preserving the readable alt text with image-processing directives such as `?size=` stripped

#### Scenario: Local image-pointing links drop the link, keep the text (interim)

- **WHEN** the post body contains a Markdown link pointing to a local image (e.g. "view original")
- **THEN** the Markdown twin keeps the link text but drops the link target, because link-target images are not collected into Astro's image map and cannot be resolved to an optimized URL, and emitting a raw-original URL would 404 in the twin (see content-assets spec note); this is an accepted interim until link images are brought into the optimization pipeline

#### Scenario: Twin-referenced optimized asset is emitted

- **WHEN** the Markdown twin references an optimized image URL
- **THEN** a corresponding optimized asset file exists in the build output (the twin does not link to a 404)

#### Scenario: Remote image references unchanged

- **WHEN** the post body references an image via `http`, `https`, or `data` URL
- **THEN** the Markdown twin leaves the URL unchanged
