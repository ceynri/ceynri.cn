# 知识库初始化

首次为项目启用知识库时执行下述两个动作，然后回到「知识更新流程」第 1 步继续。

## 1. 创建 `knowledge/README.md`

将 `references/readme-template.md` 的全部内容原样写入项目根的 `knowledge/README.md`（目录不存在则新建）。

不要预填示例条目——索引表保持空表头，等真正沉淀第一条知识时再写入。

## 2. 在全局加载入口挂钩

知识库要发挥作用，依赖一个**始终被 AI 加载的入口**提示 AI 在改业务代码前先查阅 `knowledge/README.md` 索引。按下列优先级选落点，**只挂一处**：

1. 项目根已有 `AGENTS.md`：在其中追加「项目知识库」小节
2. 项目已有 always-apply 类规则文件（`.codebuddy/rules/`、`.claude/rules/`、`.cursor/rules/`、`.agents/rules/` front matter 中 `alwaysApply: true`）：在其中合适的通用规则文档的合适位置追加（没有合适位置就不加）
3. 以上都没有：新建 `AGENTS.md`（兼容性最广，多数 AI 工具都会读），仅写入「项目知识库」小节

写入的小节内容可以参考：

```markdown
## 项目知识库

修改业务代码前，先查阅 `knowledge/README.md` 中的知识索引表，根据"使用场景"列判断是否有相关文档需要读取。
```

挂钩已存在时不重复添加；文案有出入但语义一致时保留原文，不强行覆盖用户的措辞调整。
