import type { ResolvedContentAsset } from './resolve-content-asset';

/**
 * 内容图片资源的内存 manifest
 *
 * 进程级单例，在 Markdown 编译阶段收集，在 dev serve / build copy 阶段消费。
 * 以 outputUrl 为 key 去重。
 */
const manifest = new Map<string, ResolvedContentAsset>();

/** 记录一条解析后的资源到 manifest */
export function recordAsset(asset: ResolvedContentAsset): void {
  manifest.set(asset.outputUrl, asset);
}

/** 获取整个 manifest（只读视图） */
export function getManifest(): ReadonlyMap<string, ResolvedContentAsset> {
  return manifest;
}

/** 清空 manifest（用于测试或 rebuild 前重置） */
export function clearManifest(): void {
  manifest.clear();
}
