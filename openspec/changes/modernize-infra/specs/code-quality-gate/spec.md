## ADDED Requirements

### Requirement: PR 质量门禁

每个面向主分支的 Pull Request SHALL 通过自动化质量门禁后方可合入；门禁 MUST 包含类型检查、lint、构建三项，任一失败即阻止合入。

#### Scenario: 校验失败

- **WHEN** PR 的 `astro check`、`biome ci` 或 `astro build` 任一步骤失败
- **THEN** 门禁标记为失败，PR 不可合入

#### Scenario: 校验全部通过

- **WHEN** 类型检查、lint、构建三项全部成功
- **THEN** 门禁标记为通过，PR 可合入

### Requirement: 死链检查

质量门禁 SHALL 检测构建产物中的内部链接与图片引用，存在断裂引用时 MUST 使门禁失败。

#### Scenario: 内部引用断裂

- **WHEN** 构建产物中存在指向不存在页面或图片资源的内部链接
- **THEN** 死链检查报告断裂项并使门禁失败

#### Scenario: 引用完整

- **WHEN** 所有内部链接与图片引用均可解析
- **THEN** 死链检查通过
