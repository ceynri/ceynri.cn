# Tasks: 自动捕获首次发布时间

## 1. 脚本

- [x] 1.1 新建 `scripts/backfill-published-at.mjs`：递归扫描 `<contentBase>/blog/**/*.md`（跳过 `assets/`），命中 `published: true` 且无 `publishedAt` 的文章，在 frontmatter 注入秒级 ISO 时间戳（锚定 `createdAt:`/`date:` 行后插入）。
- [x] 1.2 支持 `--dry-run`：仅打印将改动的文件清单，不写盘、退出码恒 0。
- [x] 1.3 时间戳格式为 `YYYY-MM-DDTHH:mm:ss±HH:mm`，尊重进程 `TZ`（CI 设 `Asia/Shanghai`）。
- [x] 1.4 内容源路径解析：优先 `--base <path>` 参数，其次 `CONTENT_BASE` 环境变量，默认 `./content`。

## 2. 流水线

- [x] 2.1 在 `deploy-tencent-cos.yml` 的「checkout / 子模块就绪」之后、「Setup Node.js」之前插入回写 step：配置 git identity、`TZ=Asia/Shanghai` 跑脚本，若有改动则在 `content/` 内以 `[skip deploy]` 前缀 commit 并 push。
- [x] 2.2 给 `build-and-deploy` job 增加守卫：`push` 事件且 `head_commit.message` 含 `[skip deploy]` 时跳过（短路回写自触发环）；dispatch/手动触发不受影响。

## 3. 验证

- [x] 3.1 本地 `--dry-run` 对真实 `content/` 树打印命中清单，人工核对（应仅含 `published:true` 且缺 `publishedAt` 者）。
- [x] 3.2 在临时目录构造样例文章（含「应命中 / 已有 publishedAt / published:false / 无 published 字段」四类）实测写盘结果，确认插入位置与格式正确、其余字节不变。
- [x] 3.3 对改动后的工作区跑 `pnpm exec astro check` 与构建，确认 schema 与新 frontmatter 兼容。

## 4. 文档与沉淀

- [x] 4.1 更新 `AGENTS.md` 目录结构，补充 `scripts/` 说明。
- [x] 4.2 通过 knowledge-manager 沉淀「自动发布时间戳 + 流水线破环」知识。
