import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { remarkContentImageLinks } from '../remark-content-image-links';

let tmpDir: string;
let mdFile: string;

beforeAll(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'remark-content-image-links-test-'));
  fs.mkdirSync(path.join(tmpDir, 'blog/assets/my-post'), { recursive: true });
  fs.writeFileSync(path.join(tmpDir, 'blog/assets/my-post/body.jpg'), '');
  fs.writeFileSync(path.join(tmpDir, 'blog/assets/my-post/original.jpg'), '');
  fs.writeFileSync(path.join(tmpDir, 'blog/my-post.md'), '');
  mdFile = path.join(tmpDir, 'blog/my-post.md');
});

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true });
});

describe('remarkContentImageLinks', () => {
  it('不改写 Markdown image，保留给 Astro 图片管线优化', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'image',
          url: './assets/my-post/body.jpg',
          alt: '正文图',
        },
      ],
    };

    remarkContentImageLinks({ contentBase: tmpDir })(tree, { history: [mdFile] });

    expect(tree.children[0].url).toBe('./assets/my-post/body.jpg');
  });

  it('将 Markdown link 中的图片路径转换为最终原图链接', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'link',
          url: './assets/my-post/original.jpg',
          children: [{ type: 'text', value: '查看原图' }],
        },
      ],
    };

    remarkContentImageLinks({ contentBase: tmpDir })(tree, { history: [mdFile] });

    expect(tree.children[0].url).toBe('/blog/assets/my-post/original.jpg');
  });
});
