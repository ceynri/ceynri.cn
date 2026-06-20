## ADDED Requirements

### Requirement: Content image asset URI resolution

The system SHALL resolve local image asset references in Markdown content through content-root asset URI semantics.

#### Scenario: Resolve blog-private asset URI
- **WHEN** public Markdown content references `/blog/assets/post-slug/diagram.png`
- **THEN** the system resolves it to `<contentBase>/blog/assets/post-slug/diagram.png` and records `/blog/assets/post-slug/diagram.png` as the initial output URL

#### Scenario: Resolve shared asset URI
- **WHEN** public Markdown content references `/assets/common.png`
- **THEN** the system resolves it to `<contentBase>/assets/common.png` and records `/assets/common.png` as the initial output URL

#### Scenario: Resolve relative asset URI
- **WHEN** public Markdown content references a relative image path such as `./assets/post-slug/diagram.png` or `../assets/common.png`
- **THEN** the system resolves it relative to the Markdown file path before deriving the content asset URI and output URL

### Requirement: Markdown image asset collection

The system SHALL collect supported local image assets from Markdown AST nodes during Markdown compilation.

#### Scenario: Markdown image node references local asset
- **WHEN** a Markdown image node references a supported local image asset
- **THEN** the system resolves the asset, records it in the in-memory asset manifest, and rewrites the node URL to the resolved output URL

#### Scenario: Markdown link node references local image asset
- **WHEN** a Markdown link node references a supported local image asset
- **THEN** the system resolves the asset, records it in the in-memory asset manifest, and rewrites the link URL to the resolved output URL

#### Scenario: External image reference
- **WHEN** a Markdown image or link node references an `http`, `https`, or `data` URL
- **THEN** the system does not collect or rewrite it as a local content asset

#### Scenario: Unsupported local file extension
- **WHEN** a Markdown link references a local file whose extension is not a supported image extension
- **THEN** the system does not collect or rewrite it as a content image asset

### Requirement: Missing asset failure

The system MUST fail when public content references a missing local image asset.

#### Scenario: Referenced local image does not exist
- **WHEN** public Markdown content references a local image asset whose source file cannot be found
- **THEN** the system throws an error that includes the Markdown file path, the original URL, and the expected source path

### Requirement: Referenced asset publishing

The system SHALL publish only image assets collected from public content references.

#### Scenario: Build copies collected assets
- **WHEN** the production build completes Markdown compilation and the manifest contains resolved image assets
- **THEN** the system copies each manifest asset from `sourcePath` to the build output path represented by `outputUrl`

#### Scenario: Unreferenced asset remains unpublished
- **WHEN** an image file exists under `<contentBase>/assets` or `<contentBase>/blog/assets` but is not referenced by public content
- **THEN** the system does not publish that file solely because it exists in the directory

#### Scenario: Duplicate asset references
- **WHEN** multiple public Markdown files reference the same resolved image asset
- **THEN** the system records and publishes that asset once

### Requirement: Dev server asset serving

The system SHALL serve resolved content image assets during local development without relying on `public` symlinks.

#### Scenario: Dev request for resolved asset URL
- **WHEN** the dev server receives a request for a resolved content image asset output URL
- **THEN** the system streams the corresponding source file from the active content source

#### Scenario: Dev request for missing resolved asset URL
- **WHEN** the dev server receives a request for a supported content image asset URL whose source file does not exist
- **THEN** the request is not silently satisfied from an unrelated `public` symlink target

### Requirement: Route mapping extension point

The system SHALL represent each resolved image asset with separate `contentUri`, `sourcePath`, and `outputUrl` fields.

#### Scenario: Initial identity mapping
- **WHEN** the first implementation resolves `/blog/assets/post-slug/diagram.png`
- **THEN** `outputUrl` is `/blog/assets/post-slug/diagram.png`

#### Scenario: Future route remapping
- **WHEN** a future route policy maps content URI `/blog/assets/post-slug/diagram.png` to output URL `/assets/post-slug/diagram.png`
- **THEN** Markdown source does not need to change for the asset to be published at the new output URL
