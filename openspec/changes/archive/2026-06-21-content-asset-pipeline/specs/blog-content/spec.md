## ADDED Requirements

### Requirement: Upstream content source relationship

The system SHALL treat `ceynri-words` as the upstream content source and `ceynri.cn` as a downstream consumer of selected public content.

#### Scenario: Default content source
- **WHEN** no local content override is configured
- **THEN** the system consumes content from the repository `content/` submodule

#### Scenario: Local content source override
- **WHEN** a local content source override such as `CONTENT_BASE` is configured for development
- **THEN** the system consumes the same public collections from that local `ceynri-words` working tree without requiring upstream commits or pushes first

### Requirement: Public blog asset closure

The system SHALL include image assets in public blog output only when they are explicitly referenced by public blog content.

#### Scenario: Published blog references image asset
- **WHEN** a blog article is public and references a local image asset in Markdown content
- **THEN** the public site output includes that referenced image asset

#### Scenario: Unpublished blog references image asset
- **WHEN** a blog article is not public and references a local image asset in Markdown content
- **THEN** that image asset is not published solely because the unpublished article references it
