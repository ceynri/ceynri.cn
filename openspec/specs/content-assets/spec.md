# content-assets Specification

## Purpose

定义 ceynri.cn 消费上游内容源（ceynri-words）中图片资产的行为。Markdown 正文图片与原图链接语义不同：正文图片应保留相对路径交给 Astro 图片管线优化；原图链接应转换成最终内容 URL，并在 dev/build 阶段保证可访问。本 spec 描述当前系统应有的内容图片解析、链接转换与静态产物落盘行为。

## Requirements

### Requirement: 本地图片引用识别

系统 SHALL 将非远程 URL 且扩展名受支持的图片路径识别为本地图片引用。

#### Scenario: 识别内容根 URL

- **WHEN** Markdown link 引用 `/blog/assets/post-slug/diagram.png`
- **THEN** 系统识别它为本地图片引用

#### Scenario: 识别相对路径图片

- **WHEN** Markdown link 引用 `./assets/post-slug/diagram.png` 或 `../assets/common.png`
- **THEN** 系统识别它为本地图片引用

#### Scenario: 排除远程图片

- **WHEN** Markdown image 或 link 引用 `http`、`https` 或 `data` URL
- **THEN** 系统不将其作为本地图片引用处理

#### Scenario: 排除非图片扩展名

- **WHEN** Markdown link 引用的本地文件扩展名不受支持
- **THEN** 系统不将其作为本地图片引用处理

### Requirement: 原图链接最终 URL 转换

系统 SHALL 将 Markdown link 中的本地图片路径转换为最终内容 URL。

#### Scenario: 转换相对路径原图链接

- **WHEN** 公开 Markdown 内容通过 link 节点引用 `./assets/post-slug/original.jpg`
- **THEN** 系统先相对于 Markdown 文件解析源文件，再将链接 URL 转换为 `/blog/assets/post-slug/original.jpg`

#### Scenario: 转换内容根 URL 原图链接

- **WHEN** 公开 Markdown 内容通过 link 节点引用 `/blog/assets/post-slug/original.jpg`
- **THEN** 系统将其解析为 `<contentBase>/blog/assets/post-slug/original.jpg`，并保持最终内容 URL 为 `/blog/assets/post-slug/original.jpg`

#### Scenario: 原图链接源文件不存在

- **WHEN** Markdown link 引用的本地图片源文件不存在
- **THEN** 系统抛出包含 Markdown 文件路径、原始 URL 和预期源路径的错误

### Requirement: Markdown 正文图片交给 Astro 优化

系统 SHALL 不改写 Markdown image 节点中的本地相对图片路径。

#### Scenario: 正文图片保持相对路径

- **WHEN** Markdown image 节点引用 `./assets/post-slug/body.jpg`
- **THEN** 自定义内容资产插件不改写该 URL
- **AND** Astro Markdown 图片管线可继续将其优化为 `/assets/*` 产物、`srcset` 和尺寸信息

#### Scenario: 避免正文图片变成内容原图 URL

- **WHEN** Markdown image 节点引用本地相对图片
- **THEN** 系统不得将其改写为 `/blog/assets/...` 这类内容原图 URL

### Requirement: Dev 阶段原图 URL 服务

系统 SHALL 在本地开发时服务最终内容 URL 指向的原图，不依赖 `public` 软链接。

#### Scenario: Dev 请求存在的内容原图 URL

- **WHEN** dev server 收到 `/blog/assets/post-slug/original.jpg` 请求
- **THEN** 系统从 `<contentBase>/blog/assets/post-slug/original.jpg` 流式传输源文件，并返回匹配的图片 Content-Type

#### Scenario: Dev 请求不存在的内容原图 URL

- **WHEN** dev server 收到受支持图片扩展名的内容原图 URL，但源文件不存在
- **THEN** 系统不从无关的 `public` 软链接静默响应，并将请求交回后续 middleware

### Requirement: Build 阶段按最终 HTML 引用落盘原图

系统 SHALL 在生产构建完成后，根据最终 HTML 中仍然保留的内容原图 URL 复制源文件到 `dist`。

#### Scenario: 复制最终 HTML 引用的原图

- **WHEN** `dist/**/*.html` 中存在 `/blog/assets/post-slug/original.jpg` 这类本地图片 URL
- **THEN** 系统从 `<contentBase>/blog/assets/post-slug/original.jpg` 复制文件到 `<dist>/blog/assets/post-slug/original.jpg`

#### Scenario: 不复制已被 Astro 优化接管的正文图片原图

- **WHEN** Markdown 正文图片已被 Astro 优化为 `/assets/*` 产物
- **THEN** 系统不因其源文件存在于 `<contentBase>/blog/assets` 而额外复制原图

#### Scenario: 未被最终 HTML 引用的资产不落盘

- **WHEN** 图片文件存在于 `<contentBase>/assets` 或 `<contentBase>/blog/assets`，但最终 HTML 未引用其内容原图 URL
- **THEN** 系统不因目录中存在而复制该文件到 `dist`

#### Scenario: 重复引用去重

- **WHEN** 多个最终 HTML 文件引用同一个内容原图 URL
- **THEN** 系统只需保证对应文件在 `dist` 中存在一次
