import { describe, expect, it } from 'vitest';

import { sanitizeMarkdown } from '../sanitize-markdown';

const run = (body: string) => sanitizeMarkdown(body, {});

describe('sanitizeMarkdown', () => {
  it('保留普通 Markdown 结构', async () => {
    const out = await run('# 标题\n\n正文 **加粗** 与 `代码`。\n\n- 列表项\n');
    expect(out).toContain('# 标题');
    expect(out).toContain('**加粗**');
    expect(out).toContain('`代码`');
    expect(out).toContain('- 列表项');
  });

  it('删除 HTML 注释', async () => {
    const out = await run('前文\n\n<!-- 这是注释 -->\n\n后文');
    expect(out).not.toContain('注释');
    expect(out).not.toContain('<!--');
    expect(out).toContain('前文');
    expect(out).toContain('后文');
  });

  it('ruby 用 <rp> 降级为「主体（注音）」', async () => {
    const out = await run('读音：<ruby>漢<rp>（</rp><rt>かん</rt><rp>）</rp></ruby>字。');
    // 严格相等，防止状态机重复拼接降级文本
    expect(out).toBe('读音：漢（かん）字。');
    expect(out).not.toContain('<ruby>');
    expect(out).not.toContain('<rt>');
  });

  it('保留 details/summary/u/kbd 语义标签', async () => {
    const out = await run('<details>\n<summary>展开</summary>\n\n内容 <u>下划线</u> 与 <kbd>Ctrl</kbd>。\n</details>');
    expect(out).toContain('<details>');
    expect(out).toContain('<summary>展开</summary>');
    expect(out).toContain('<u>下划线</u>');
    expect(out).toContain('<kbd>Ctrl</kbd>');
  });

  it('br 标签被丢弃但保留相邻文本', async () => {
    const out = await run('第一行<br>第二行');
    expect(out).not.toContain('<br>');
    expect(out).toContain('第一行');
    expect(out).toContain('第二行');
  });

  it('center 解包保留内部内容', async () => {
    const out = await run('<center>居中文本</center>');
    expect(out).not.toContain('<center>');
    expect(out).toContain('居中文本');
  });

  it('未知标签默认保留（交给 Agent 理解）', async () => {
    const out = await run('公式 <var>x</var> 标注。');
    expect(out).toContain('<var>x</var>');
  });

  it('本地正文图降级为 alt 文本占位', async () => {
    const out = await run('![示意图](./assets/my-post/diagram.png)');
    expect(out).toContain('（图：示意图）');
    expect(out).not.toContain('./assets/');
    expect(out).not.toContain('![');
  });

  it('无 alt 的本地正文图用默认占位', async () => {
    const out = await run('![](./assets/my-post/diagram.png)');
    expect(out).toContain('（图：图片）');
  });

  it('占位文本剥离 alt 里的 ?size= 图片处理指令', async () => {
    const out = await run('![功能截图?size=small](./assets/my-post/diagram.png)');
    expect(out).toContain('（图：功能截图）');
    expect(out).not.toContain('size=');
  });

  it('远程正文图保持不变', async () => {
    const out = await run('![外链](https://example.com/a.png)');
    expect(out).toContain('![外链](https://example.com/a.png)');
  });

  it('本地图片链接（查看原图）去链接留文字', async () => {
    const out = await run('[查看原图](./assets/my-post/diagram.png)');
    expect(out).toContain('查看原图');
    expect(out).not.toContain('./assets/');
    expect(out).not.toContain('[查看原图](');
  });

  it('远程链接保持不变', async () => {
    const out = await run('[参考](https://example.com/page)');
    expect(out).toContain('[参考](https://example.com/page)');
  });

  it('stripLeadingHeading 剥掉正文首个 H1', async () => {
    const out = await sanitizeMarkdown('# 年记\n\n正文。\n\n## 小节\n\n内容', {
      stripLeadingHeading: true,
    });
    expect(out).not.toMatch(/^# 年记/m);
    expect(out).toContain('正文。');
    expect(out).toContain('## 小节');
  });

  it('stripLeadingHeading 不影响正文中间的同名 H1', async () => {
    const out = await sanitizeMarkdown('开头段落。\n\n# 年记\n\n正文。', {
      stripLeadingHeading: true,
    });
    // 首个块是段落而非 H1，不剥
    expect(out).toContain('# 年记');
  });

  it('stripLeadingHeading 关闭时保留正文首 H1', async () => {
    const out = await run('# 年记\n\n正文。');
    expect(out).toContain('# 年记');
  });

  it('综合 fixture：标题 + 注释 + ruby + 图片 + 保留标签', async () => {
    const body = [
      '# 年记',
      '',
      '<!-- 草稿注：待删 -->',
      '',
      '读作 <ruby>山风<rp>（</rp><rt>shān fēng</rt><rp>）</rp></ruby>。',
      '',
      '![封面](./assets/my-post/diagram.png)',
      '',
      '<details><summary>更多</summary>细节</details>',
    ].join('\n');
    const out = await run(body);
    expect(out).toContain('# 年记');
    expect(out).not.toContain('草稿注');
    // 严格匹配降级结果，防止重复拼接
    expect(out).toContain('读作 山风（shān fēng）。');
    expect(out).not.toContain('山风（shān fēng）山风');
    // 本地图降级为占位
    expect(out).toContain('（图：封面）');
    expect(out).toContain('<summary>更多</summary>');
  });
});
