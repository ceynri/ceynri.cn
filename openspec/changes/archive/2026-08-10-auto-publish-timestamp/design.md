# Design: 自动捕获首次发布时间

## 背景与目标

`publishedAt` 表达「文章首次对外发布的时刻」。它当前靠手写，易漏、粒度粗。目标是把这一元数据的维护从人转移到部署流水线，做到：首次发布即自动落秒级时间戳、可重入、不引发部署风暴。

## 关键决策

### D1: 首次发布信号 = `published=true 且 无 publishedAt`

**为何不检测「`published` 由 false 变 true」**：需要在 CI 检出内容仓库的父提交做 diff，且对「历史上已翻 true 但漏写 `publishedAt` 的存量文章」无效（diff 只覆盖本次变更），还要决定「回填多少个历史提交」，复杂且语义摇摆。

**为何字段缺失检测正确**：
- **幂等**：一旦写入，`publishedAt` 存在，信号永久失效，重跑/重部署/重触发都不会二次改写。
- **天然覆盖真实工作流**：草稿长期在 Git 中以 `published: false` 存在（如 `blog/draft/工作感悟.md`），文件 add 时间远早于发布时间；只有「翻 true」那一刻才对应首次发布，而「翻 true 且无 `publishedAt`」恰好命中。
- **兼容存量**：历史上已发布但漏写的文章，下一次部署会被一次性补齐（符合预期）。

**已显式否决的信号**：「本次 push 的 added 文件」——草稿早已入库，add 时间不等于发布时间，错误。

### D2: 时间戳粒度与格式 —— 秒级 ISO 8601 带时区，历史不动

- 新写入：`YYYY-MM-DDTHH:mm:ss±HH:mm`（如 `2026-08-10T15:42:07+08:00`），由部署环境 `TZ=Asia/Shanghai` 产生，作者读写友好。
- 历史 20 篇 date-only 值（如 `2021-05-16`）**保留原样**：
  - `z.coerce.date()` 兼容两种粒度，schema 不破；
  - RSS 有 `publishedAt || date` 兜底；
  - date-only 视为「当日」，与新秒级值只在同一天内的精细排序上有差异，可接受。
- **显式否决**：用「该文件首次进入 git 的 commit 时间」回填历史——commit 时间是构建/版本副作用，不是作者表达的发布时间，是错误数据源。相关 `--backfill-from-git` 模式一并废弃，不存在于脚本。

### D3: 脚本实现 —— 零依赖、单行正则改写

用 Node 内置 `node:fs`/`node:path`，不引入 frontmatter 解析库：
- 仅扫描 `content/blog/**/*.md`（递归，跳过 `assets/`）。
- 用「行锚定正则」（`/^published:\s*true/m`、`/^publishedAt:/m`）判断，避免依赖完整 YAML 解析——正文里不太可能出现行首的 `published: true`。
- 插入位置：优先锚定现有 `createdAt:` 行之后；无 `createdAt` 则锚定 `date:` 行之后；再退化到 frontmatter 收尾前。尽量贴近作者手写习惯，使自动 diff 与手写 diff 视觉一致。
- 重写仅触及单行插入，frontmatter 其余部分逐字节保留（不重排、不重新序列化），把意外破坏降到最低。
- 支持 `--dry-run` 打印将改动的文件，不写盘。
- **风险与缓解**：YAML 解析库会重排键序、丢注释、改引号，污染 diff——故刻意零依赖。已在本地对真实内容树跑通（见 tasks 验证）。

### D4: 回写时机 —— 部署构建之前

step 顺序：`checkout(submodules)` →（可选）submodule 指针更新 → **回写 publishedAt** → setup/install → build。保证 build 吃到刚写入的值，本次部署即含新时间戳，无需二次部署。

**CI 子模块游离 HEAD 的处理**（实测踩坑）：`actions/checkout` 把子模块检出为 detached HEAD，直接 `push` 报「not currently on a branch」。回写 step 内必须先 `git -C content checkout main` 切回分支，再 `pull --rebase` 对齐远端，**然后才**跑脚本生成时间戳（时间戳取自 `new Date()` 每次不同，先写再 rebase 必冲突），最后提交推送。

### D5: 破环 —— 提交信息哨兵 + 并发收敛（双闸）

环路：`回写 push 到 content main` →（content 的 `update-parent-repository.yml`，`paths: blog/**` 命中）→ `repository_dispatch(submodule-update)` → `deploy-tencent-cos.yml`。

- **闸 A（必需，非可选）**：回写 commit message 固定前缀 `[skip deploy]`。`deploy-tencent-cos.yml` 的 `push` 事件加 job 级守卫：当 `github.event.head_commit.message` 含 `[skip deploy]` 时跳过。这是 GitHub Actions 原生做法，等效 `[skip ci]`。注意哨兵**只挂在 `push` 事件**（dispatch 事件无 `head_commit`，避免表达式短路语义误判）。
- **闸 B（已存在的收敛）**：`concurrency: tencent-cos-deployment / cancel-in-progress: true` 使「偶发漏过闸 A 的空部署」最多顶替当前部署、内容无实质变化，最坏情况是多发一次无变化部署，不会指数扩散。
- **单写者**：`publishedAt` 只由「主仓库部署流水线」写，content 仓库自身不写，避免多写者竞争。

## 数据流

```
作者将 published 翻 true → push content main
  → update-parent-repository.yml → dispatch(submodule-update)
    → deploy-tencent-cos.yml
        checkout(content@main)
        backfill-published-at.mjs：命中 → 写 publishedAt(秒级) → commit "[skip deploy] ..." → push content
        （该 push 再触发的 dispatch 被闸 A 短路）
        build → deploy
```

## 非目标

- 不回填历史 date-only 值。
- 不改动 `pages`、`poems` 集合（它们的 schema 无 `publishedAt`，且发布语义不同）。
- 不引入测试框架；脚本靠 dry-run + 本地真实数据人工核验。
