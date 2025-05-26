# GitHub Actions 部署配置说明

## 概述

本项目使用 GitHub Actions 自动构建并部署到腾讯云 COS，并自动刷新 CDN 缓存。

## 需要配置的环境变量

在 GitHub 仓库的 Settings > Secrets and variables > Actions 中配置以下密钥：

### 必需的 Secrets

| 变量名               | 说明                         | 示例                        |
| -------------------- | ---------------------------- | --------------------------- |
| `TENCENT_SECRET_ID`  | 腾讯云 API 密钥 ID           | `AKIDxxxxxxxxxxxxxxxxxxxxx` |
| `TENCENT_SECRET_KEY` | 腾讯云 API 密钥 Key          | `xxxxxxxxxxxxxxxxxxxxxxxx`  |
| `TENCENT_COS_BUCKET` | COS 存储桶名称               | `my-website-1234567890`     |
| `TENCENT_COS_REGION` | COS 存储桶区域               | `ap-shanghai`               |
| `TENCENT_CDN_PREFIX` | CDN 域名前缀（可选）         | `https://cdn.example.com/`  |
| `GH_PAT`             | GitHub Personal Access Token | `ghp_xxxxxxxxxxxxxxxxxxxx`  |

### 腾讯云密钥获取方法

1. 登录 [腾讯云控制台](https://console.cloud.tencent.com/)
2. 进入 [访问管理 > API 密钥管理](https://console.cloud.tencent.com/cam/capi)
3. 点击"新建密钥"创建新的 API 密钥
4. 记录生成的 SecretId 和 SecretKey

### COS 存储桶配置

1. 进入 [对象存储 COS 控制台](https://console.cloud.tencent.com/cos)
2. 创建存储桶或选择现有存储桶
3. 记录存储桶名称和区域信息
4. 配置存储桶为静态网站托管：
   - 进入存储桶 > 基础配置 > 静态网站
   - 启用静态网站功能
   - 设置首页文档为 `index.html`
   - 设置错误文档为 `404.html`（如果有）

### CDN 配置（可选）

如果你使用腾讯云 CDN 加速：

1. 进入 [内容分发网络 CDN 控制台](https://console.cloud.tencent.com/cdn)
2. 添加域名，源站选择刚创建的 COS 存储桶
3. 记录 CDN 域名，填入 `TENCENT_CDN_PREFIX`

### GitHub PAT 配置

1. 进入 GitHub Settings > Developer settings > Personal access tokens
2. 点击 "Generate new token"
3. 选择适当的权限（至少需要 repo 权限）
4. 复制生成的 token 并保存为 `GH_PAT`

## 工作流特性

### 性能优化

- **缓存策略**：缓存 pnpm store 和 Astro 构建产物
- **增量构建**：利用 Astro 的增量构建功能
- **并发控制**：避免多个部署任务同时运行

### 部署优化

- **清理部署**：`clean: true` 确保删除 COS 上多余的文件
- **CDN 刷新**：自动刷新 CDN 缓存，确保用户看到最新内容
- **原子性部署**：构建成功后才进行部署

### 触发条件

- 推送到 `main` 分支时自动触发
- 支持手动触发（workflow_dispatch）
- 支持通过 repository_dispatch 触发（用于子模块更新）

## 监控和通知

部署完成后，可以在 GitHub Actions 页面查看详细的构建和部署日志。每个步骤都有清晰的名称和状态指示。

## 故障排除

### 常见问题

1. **权限错误**：检查腾讯云 API 密钥是否正确，是否有足够的权限
2. **存储桶不存在**：确认存储桶名称和区域是否正确
3. **CDN 刷新失败**：检查 CDN 域名配置是否正确
4. **构建失败**：检查代码是否有语法错误，依赖是否正确

### 调试方法

1. 查看 GitHub Actions 的详细日志
2. 确认所有环境变量都已正确配置
3. 测试腾讯云 API 密钥是否有效
4. 验证本地构建是否成功

## 安全注意事项

- 所有敏感信息都应存储在 GitHub Secrets 中，不要硬编码在代码中
- 定期轮换 API 密钥
- 为 API 密钥设置最小权限原则
- 启用 GitHub 仓库的分支保护规则
