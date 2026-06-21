import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { ContentAssetNotFoundError, isLocalImageAssetUrl, resolveContentAssetReference } from '../index';

let tmpDir: string;
let mdFile: string;

beforeAll(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'content-assets-test-'));
  fs.mkdirSync(path.join(tmpDir, 'blog/assets/my-post'), { recursive: true });
  fs.mkdirSync(path.join(tmpDir, 'assets'), { recursive: true });
  fs.writeFileSync(path.join(tmpDir, 'blog/assets/my-post/diagram.png'), '');
  fs.writeFileSync(path.join(tmpDir, 'assets/common.png'), '');
  fs.writeFileSync(path.join(tmpDir, 'blog/my-post.md'), '');
  mdFile = path.join(tmpDir, 'blog/my-post.md');
});

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true });
});

describe('isLocalImageAssetUrl', () => {
  it('识别内容根 URL', () => {
    expect(isLocalImageAssetUrl('/blog/assets/my-post/diagram.png')).toBe(true);
  });

  it('识别相对路径', () => {
    expect(isLocalImageAssetUrl('./assets/my-post/diagram.png')).toBe(true);
    expect(isLocalImageAssetUrl('../assets/common.png')).toBe(true);
  });

  it('排除 https URL', () => {
    expect(isLocalImageAssetUrl('https://example.com/a.png')).toBe(false);
  });

  it('排除 http URL', () => {
    expect(isLocalImageAssetUrl('http://example.com/a.png')).toBe(false);
  });

  it('排除 data URL', () => {
    expect(isLocalImageAssetUrl('data:image/png;base64,xxx')).toBe(false);
  });

  it('排除非图片扩展名', () => {
    expect(isLocalImageAssetUrl('/blog/assets/my-post/doc.pdf')).toBe(false);
  });

  it('排除空字符串', () => {
    expect(isLocalImageAssetUrl('')).toBe(false);
  });
});

describe('resolveContentAssetReference', () => {
  describe('内容根 URL', () => {
    it('解析 blog 原图链接', () => {
      const result = resolveContentAssetReference('/blog/assets/my-post/diagram.png', {
        markdownFilePath: mdFile,
        contentBase: tmpDir,
      });
      expect(result.contentUrl).toBe('/blog/assets/my-post/diagram.png');
      expect(result.sourcePath).toBe(path.join(tmpDir, 'blog/assets/my-post/diagram.png'));
      expect(result.publicUrl).toBe('/blog/assets/my-post/diagram.png');
    });

    it('解析内容源根目录下的图片', () => {
      const result = resolveContentAssetReference('/assets/common.png', {
        markdownFilePath: mdFile,
        contentBase: tmpDir,
      });
      expect(result.contentUrl).toBe('/assets/common.png');
      expect(result.publicUrl).toBe('/assets/common.png');
    });
  });

  describe('相对路径', () => {
    it('从 md 文件相对路径推导最终访问 URL', () => {
      const result = resolveContentAssetReference('./assets/my-post/diagram.png', {
        markdownFilePath: mdFile,
        contentBase: tmpDir,
      });
      expect(result.contentUrl).toBe('/blog/assets/my-post/diagram.png');
      expect(result.publicUrl).toBe('/blog/assets/my-post/diagram.png');
    });
  });

  describe('重复引用', () => {
    it('同一 asset 多次解析结果稳定', () => {
      const r1 = resolveContentAssetReference('/blog/assets/my-post/diagram.png', {
        markdownFilePath: mdFile,
        contentBase: tmpDir,
      });
      const r2 = resolveContentAssetReference('/blog/assets/my-post/diagram.png', {
        markdownFilePath: mdFile,
        contentBase: tmpDir,
      });
      expect(r1.publicUrl).toBe(r2.publicUrl);
    });
  });

  describe('缺失文件', () => {
    it('抛出 ContentAssetNotFoundError', () => {
      expect(() =>
        resolveContentAssetReference('/blog/assets/my-post/nonexist.png', {
          markdownFilePath: mdFile,
          contentBase: tmpDir,
        }),
      ).toThrow(ContentAssetNotFoundError);
    });

    it('错误包含诊断信息', () => {
      try {
        resolveContentAssetReference('/blog/assets/my-post/nonexist.png', {
          markdownFilePath: mdFile,
          contentBase: tmpDir,
        });
      } catch (e) {
        const err = e as ContentAssetNotFoundError;
        expect(err.markdownFilePath).toBe(mdFile);
        expect(err.originalUrl).toBe('/blog/assets/my-post/nonexist.png');
        expect(err.expectedSourcePath).toContain('nonexist.png');
      }
    });
  });
});
