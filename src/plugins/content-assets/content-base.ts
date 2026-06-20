import fs from 'node:fs';
import path from 'node:path';

/**
 * 从 .env 文件手动读取环境变量（用于 Vite 初始化前的场景如 astro.config.ts）
 */
function loadEnvVar(key: string, projectRoot: string): string | undefined {
  try {
    const envContent = fs.readFileSync(path.resolve(projectRoot, '.env'), 'utf-8');
    const match = envContent.match(new RegExp(`^${key}=(.+)$`, 'm'));
    return match?.[1]?.trim();
  } catch {
    return undefined;
  }
}

/**
 * 获取内容源根目录
 *
 * 优先级：CONTENT_BASE 环境变量 > 默认 ./content（submodule）
 *
 * @param projectRoot 项目根目录绝对路径
 * @returns 内容源根目录绝对路径
 */
export function resolveContentBase(projectRoot: string): string {
  const envValue = loadEnvVar('CONTENT_BASE', projectRoot);
  const raw = envValue || './content';
  return path.resolve(projectRoot, raw);
}
