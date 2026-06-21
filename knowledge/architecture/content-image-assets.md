# 内容图片与原图链接链路

## 概述

内容图片能力的行为契约以 `openspec/specs/content-assets/spec.md` 为准；本文只记录设计背景、模块关系和易踩坑点。

`ceynri.cn` 是 `ceynri-words` 的下游消费者。内容图片来自 `CONTENT_BASE` 指向的内容源，而不是站点仓库的 `public/images` 软链。

当前设计把 Markdown 中的两类图片意图分开：

- 正文图片：`![图](./assets/a.jpg)` 保持相对路径，交给 Astro 原生图片管线生成压缩产物、`srcset` 和尺寸信息。
- 原图链接：`[查看原图](./assets/a.jpg)` 转换成最终内容 URL，例如 `/blog/assets/a.jpg`，再由站点补齐 dev/build 访问能力。

这个分工的关键原因是：Astro 只会把 Markdown image 中的本地相对路径识别为可优化图片；如果提前改成 `/blog/assets/...`，它会被当成普通 public URL，从而绕过图片优化。

## 能力关系

```text
Markdown 正文图片
![图](./assets/a.jpg)
        │
        ├─ remarkContentImageLinks：跳过
        │
        ▼
Astro 原生图片优化
        │
        ▼
dist/assets/a.hash.webp + srcset
```

```text
Markdown 原图链接 / floating image 链接
[原图](./assets/a.jpg)
        │
        ▼
remarkContentImageLinks
        │
        ▼
resolveContentAssetReference
        │
        ├─ 校验源文件存在
        └─ 转换为最终内容 URL：/blog/assets/a.jpg
        │
        ▼
contentAssetsIntegration
        │
        ├─ dev：请求时从 contentBase 读取并返回
        └─ build：扫描 dist HTML，把仍被引用的原图复制到 dist
```

## 关键设计决策

### 正文图片不走自定义内容资产管线

正文图片的目标是展示优化后的图片，而不是暴露原图路径。自定义管线只要改写 Markdown image URL，就会破坏 Astro 对本地图片的收集条件。

因此，正文图片的相对路径不是临时形态，而是刻意保留给 Astro 的输入契约。

### dev 与 build 是同一语义、不同执行时机

`contentAssetsIntegration` 统一表达「最终 HTML 中残留的内容原图 URL 应该可访问」这个能力，但内部仍按阶段分开实现：

- dev 没有 `dist`，只能在浏览器请求 `/blog/assets/...` 时从 `contentBase` 读取源文件。
- build 后只有静态产物，preview/deploy 不会运行 dev middleware，所以必须在 build 完成后把最终 HTML 仍引用的原图复制到 `dist`。

不要为了统一而让 dev 依赖提前复制，也不要让 build 依赖 dev server。

### 不再使用内存 manifest 作为发布依据

Astro content layer/cache 会影响 Markdown 编译与 build 进程内状态的可靠性。资源落盘不能依赖 remark 插件副作用写入的内存 manifest。

当前以最终 `dist/**/*.html` 的实际引用作为 build 复制依据：正文图片已经被 Astro 优化成 `/assets/...` 后不会再被复制原图，只有仍残留的 `/blog/assets/...` 原图链接会进入 `dist`。

## 注意事项

- 如果 build 后正文图片又变回 `/blog/assets/...` 原图路径，优先检查是否有逻辑改写了 Markdown image 节点。
- 验证图片优化问题时需要注意 Astro 缓存；必要时清理 `.astro` 和 `node_modules/.astro` 后再判断。
- 修改 `remarkContentImageLinks` 时，不要把它扩展回“处理所有 Markdown 图片”的总管职责。
