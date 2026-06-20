## ADDED Requirements

### Requirement: 单一样式范式

样式 SHALL 统一为 Tailwind CSS（工具类优先）+ 原生 CSS 嵌套 + CSS 自定义属性，项目中 MUST NOT 存在 Sass（`.scss`）文件或 `lang="scss"` 内联块。

#### Scenario: 仓库不含 Sass

- **WHEN** 检索 `src/` 下的样式来源
- **THEN** 不存在任何 `.scss` 文件，也不存在 `lang="scss"` 的 `<style>` 块

#### Scenario: 复杂样式使用原生嵌套

- **WHEN** 某组件需要嵌套选择器或伪类（如 `&:hover`）
- **THEN** 使用原生 CSS 嵌套写在 `.astro` 的 `<style>` 中，不引入 Sass

### Requirement: 设计 token 单一来源

颜色与主题 token SHALL 仅来自统一来源（Tailwind `@theme` 与 `src/styles` 定义的 CSS 自定义属性），组件 MUST NOT 使用未定义的硬编码颜色。

#### Scenario: 暗色模式切换

- **WHEN** 根元素 `data-scheme` 在 `dark` 与默认之间切换
- **THEN** 通过 CSS 自定义属性切换主题，无需重新编译，页面颜色随之更新

#### Scenario: 引用未定义颜色

- **WHEN** 组件样式中出现未在 token 来源中定义的颜色值
- **THEN** 视为违反约定，应改为引用已定义的 CSS 变量 / Tailwind token

### Requirement: 工具类优先

可由 Tailwind 工具类表达的样式 SHALL 内联到元素 `class`，`<style>` 块仅承载工具类难以表达的少量样式。

#### Scenario: 常规样式

- **WHEN** 为元素设置间距、颜色、排版等常规样式
- **THEN** 使用 Tailwind 工具类内联，而非在 `<style>` 中另写规则
