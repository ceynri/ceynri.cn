import { describe, expect, it } from 'vitest';

import { imageSrcToImportId, isNonOptimizableImage } from '../core';

describe('imageSrcToImportId', () => {
  it('拼接相对路径与 importer，与 astro content-assets.mjs 的 key 形态一致', () => {
    const id = imageSrcToImportId('./assets/slug/a.jpg', 'blog/2022/post.md');
    expect(id).toBe('./assets/slug/a.jpg?astroContentImageFlag=&importer=blog%2F2022%2Fpost.md');
  });

  it('filePath 缺省时只带 flag', () => {
    const id = imageSrcToImportId('./assets/slug/a.jpg');
    expect(id).toBe('./assets/slug/a.jpg?astroContentImageFlag=');
  });

  it('中文 filePath 会被 URL 编码（与实测 key 一致）', () => {
    const id = imageSrcToImportId('./assets/x/a.jpg', 'blog/2022/疫情第三年.md');
    expect(id).toContain(`importer=${encodeURIComponent('blog/2022/疫情第三年.md')}`);
  });

  it('远程图返回 undefined', () => {
    expect(imageSrcToImportId('https://example.com/a.jpg', 'blog/x.md')).toBeUndefined();
  });

  it('非图片扩展名返回 undefined', () => {
    expect(imageSrcToImportId('./assets/slug/a.txt', 'blog/x.md')).toBeUndefined();
  });
});

describe('isNonOptimizableImage', () => {
  it('SVG/GIF 不优化', () => {
    expect(isNonOptimizableImage('./a.svg')).toBe(true);
    expect(isNonOptimizableImage('./a.gif')).toBe(true);
  });

  it('常见位图格式可优化', () => {
    expect(isNonOptimizableImage('./a.jpg')).toBe(false);
    expect(isNonOptimizableImage('./a.png')).toBe(false);
    expect(isNonOptimizableImage('./a.webp')).toBe(false);
  });

  it('忽略查询串与 hash', () => {
    expect(isNonOptimizableImage('./a.svg?size=small')).toBe(true);
    expect(isNonOptimizableImage('./a.png?size=large')).toBe(false);
  });
});
