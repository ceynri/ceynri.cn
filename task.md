# TASKS

## P0

DONE

## P1

- [ ] 利用 Astro 所提供的各种性能优化特性对项目做性能优化
  - [ ] 使用 Astro 的 View Transitions API 实现页面过渡动画
  - [ ] 利用 Astro 的 Partial Hydration 特性优化组件加载
  - [x] 配置 Astro 的资源预加载策略
  - [x] 使用 Astro 的 Content Collections API 优化内容管理
  - [ ] 配置 Astro 的图片优化选项
- [ ] 升级 Tailwind 4
  - https://docs.astro.build/zh-cn/guides/styling/#%E4%BB%8E-tailwind-3-%E5%8D%87%E7%BA%A7%E5%88%B0-4
- [ ] 支持定位到文章的指定标题（锚点导航）
  - [ ] 实现标题点击复制链接功能
  - [ ] 支持通过 URL 哈希自动滚动到指定标题
- [ ] 文章底部添加返回按钮
- [ ] 根据 Markdown frontmatter 添加相关文章链接
  - [ ] 在文章 frontmatter 中添加相关文章字段
  - [ ] 创建 RelatedPosts 组件
  - [ ] 在文章页面集成相关文章展示
- [ ] 优化背景纹理效果
  - [ ] 设计并创建背景纹理 SVG
  - [ ] 实现深色/浅色模式下不同的纹理效果
- [ ] 文章字数提示
- [x] 自动部署能力
  - [x] 配置 GitHub Actions 工作流
  - [x] 设置自动构建和部署流程
  - [x] 配置环境变量和密钥
  - [x] 添加部署状态检查和通知
- [ ] 导入 content/poems 下的内容

## P2

- [ ] 将特殊格式的链接显示为卡片
  - [ ] 创建 LinkCard 组件
  - [ ] 实现链接元数据抓取
  - [ ] 为卡片添加预览图像和描述
  - [ ] 匹配 markdown 的特定格式，使用该组件渲染
- [ ] 支持展示文章目录
  - [ ] 创建 TableOfContents 组件
  - [ ] 从文章内容解析标题并生成目录
  - [ ] 实现目录项与页面内容的联动高亮
  - [ ] 添加目录折叠/展开功能
- [ ] 开发更多有趣的首页主题
  - [ ] 设计新的首页布局方案
  - [ ] 创建主题切换机制
  - [ ] 实现首页主题选择器
- [ ] 添加首页酷炫加载动画
  - [ ] 设计加载动画效果
  - [ ] 实现使用 CSS/JS 的动画
  - [ ] 添加页面加载完成后的过渡效果
- [ ] atom.xml
- [ ] OG image（https://astro.build/integrations?search=images）

## P3

- [ ] 实现图片库/相册功能
  - [ ] 创建 Gallery 和 GalleryItem 组件
  - [ ] 实现图片懒加载和渐进式加载
  - [ ] 添加图片查看器和轮播功能
- [ ] 添加"关于"文章的英文版本
  - [ ] 创建 `about.en.md` 文件
  - [ ] 将中文内容翻译成英文
  - [ ] 添加英文版本的元数据
  - [ ] 更新关于页面组件支持语言切换
