# content-assets Specification

## Purpose

定义内容图片资产的解析、校验、收集与发布行为。图片资产属于上游内容源（ceynri-words），Markdown 只是资产的消费者。本 spec 定义 ceynri.cn 如何消费、发布和服务这些资产。

## Requirements

### Requirement: 内容图片资产 URI 解析

系统 SHALL 通过内容根 URI 语义解析 Markdown 中的本地图片引用。

#### Scenario: 解析博客私有资产 URI
- **WHEN** 公开 Markdown 内容引用 `/blog/assets/post-slug/diagram.png`
- **THEN** 系统将其解析为 `<contentBase>/blog/assets/post-slug/diagram.png`，并记录 `/blog/assets/post-slug/diagram.png` 为初始 output URL

#### Scenario: 解析公共资产 URI
- **WHEN** 公开 Markdown 内容引用 `/assets/common.png`
- **THEN** 系统将其解析为 `<contentBase>/assets/common.png`，并记录 `/assets/common.png` 为初始 output URL

#### Scenario: 解析相对路径资产 URI
- **WHEN** 公开 Markdown 内容引用相对路径如 `./assets/post-slug/diagram.png` 或 `../assets/common.png`
- **THEN** 系统先相对于 Markdown 文件解析，再推导 contentUri 和 outputUrl

### Requirement: Markdown 图片资产收集

系统 SHALL 在 Markdown 编译期间从 AST 节点收集受支持的本地图片资产。

#### Scenario: Markdown image 节点引用本地资产
- **WHEN** Markdown image 节点引用受支持的本地图片
- **THEN** 系统解析该资产，记录到内存 manifest，并将节点 URL 改写为 outputUrl

#### Scenario: Markdown link 节点引用本地图片资产
- **WHEN** Markdown link 节点引用受支持的本地图片
- **THEN** 系统解析该资产，记录到内存 manifest，并将链接 URL 改写为 outputUrl

#### Scenario: 外部图片引用
- **WHEN** Markdown image 或 link 节点引用 `http`、`https` 或 `data` URL
- **THEN** 系统不作为本地内容资产收集或改写

#### Scenario: 非图片扩展名的本地文件
- **WHEN** Markdown link 引用的本地文件扩展名不受支持
- **THEN** 系统不作为内容图片资产收集或改写

### Requirement: 缺失资产报错

系统 MUST 在公开内容引用不存在的本地图片资产时失败。

#### Scenario: 引用的本地图片不存在
- **WHEN** 公开 Markdown 内容引用了一个源文件不存在的本地图片资产
- **THEN** 系统抛出包含 Markdown 文件路径、原始 URL 和预期源路径的错误

### Requirement: 按引用发布资产

系统 SHALL 仅发布公开内容引用到的图片资产。

#### Scenario: 构建时复制收集的资产
- **WHEN** 生产构建完成 Markdown 编译且 manifest 包含已解析的图片资产
- **THEN** 系统将 manifest 中每条资产从 `sourcePath` 复制到 `outputUrl` 对应的构建产物路径

#### Scenario: 未被引用的资产不发布
- **WHEN** 图片文件存在于 `<contentBase>/assets` 或 `<contentBase>/blog/assets` 但未被公开内容引用
- **THEN** 系统不因目录中存在而发布该文件

#### Scenario: 重复引用去重
- **WHEN** 多个公开 Markdown 文件引用同一个已解析的图片资产
- **THEN** 系统仅记录并发布一次

### Requirement: Dev Server 资产服务

系统 SHALL 在本地开发时服务已解析的内容图片资产，不依赖 `public` 软链接。

#### Scenario: Dev 请求已解析资产 URL
- **WHEN** dev server 收到对已解析内容图片资产 output URL 的请求
- **THEN** 系统从活动内容源流式传输对应源文件

#### Scenario: Dev 请求不存在的资产 URL
- **WHEN** dev server 收到对受支持内容图片资产 URL 的请求但其源文件不存在
- **THEN** 系统不会从无关的 `public` 软链接静默响应

### Requirement: 路由映射扩展点

系统 SHALL 用独立的 `contentUri`、`sourcePath`、`outputUrl` 字段表示每条已解析的图片资产。

#### Scenario: 初始恒等映射
- **WHEN** 当前实现解析 `/blog/assets/post-slug/diagram.png`
- **THEN** `outputUrl` 为 `/blog/assets/post-slug/diagram.png`

#### Scenario: 未来路由重映射
- **WHEN** 未来路由策略将 content URI `/blog/assets/post-slug/diagram.png` 映射为 output URL `/assets/post-slug/diagram.png`
- **THEN** Markdown 源码无需修改即可使资产按新 output URL 发布
