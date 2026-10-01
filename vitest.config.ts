import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // 只跑站点自身的测试；content 子模块里的用例（node:test）由内容仓库自己负责
    include: ['src/**/*.test.ts'],
  },
});
