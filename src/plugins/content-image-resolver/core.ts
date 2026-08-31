/**
 * Astro content 图片映射的虚拟模块（importId → ImageMetadata）。
 * 该模块由 Astro 在 dev/build 时经 vite 插件生成，无类型声明。
 * 注意：这是 Astro 内部 API，跨版本可能变动（见 knowledge/content-image-assets）。
 *
 * astro:assets / astro:asset-imports 均为 astro 运行时虚拟模块，只能在
 * Astro 渲染上下文（dev/build）动态加载，故不顶层 import，保证纯逻辑可独立单测。
 */
interface ImageMetadataLike {
  src: string;
  width: number;
  height: number;
  format: string;
}

type ImageAssetMap = Map<string, ImageMetadataLike>;

/** 解析结果 */
export interface ResolvedOptimizedImage {
  /** 发布后可访问的优化图 URL，如 /assets/x.Hash_hash.webp */
  url: string;
  width: number;
  height: number;
}

export interface ResolveOptimizedImageOptions {
  /** 目标宽度（默认 1080，落在 image.breakpoints 内） */
  width?: number;
  /** 输出格式（默认 webp） */
  format?: string;
}

const DEFAULT_WIDTH = 1080;
const DEFAULT_FORMAT = 'webp';

/**
 * 复刻 astro 内部 imageSrcToImportId 的拼接逻辑。
 * 原始实现见 astro/dist/assets/utils/resolveImports.js（未公共导出）：
 *   id = `${src}?${CONTENT_IMAGE_FLAG}&importer=${filePath}`
 * CONTENT_IMAGE_FLAG 常量值为 'astroContentImageFlag'。
 * 正文原始 src 不含 IMAGE_IMPORT_PREFIX（__ASTRO_IMAGE_），无需剥离。
 */
export function imageSrcToImportId(imageSrc: string, filePath?: string): string | undefined {
  // 远程图无 importId
  if (/^https?:\/\//.test(imageSrc)) return undefined;
  const ext = imageSrc.split('.').at(-1)?.toLowerCase();
  if (!ext || !VALID_INPUT_FORMATS.has(ext)) return undefined;
  const params = new URLSearchParams('astroContentImageFlag');
  if (filePath) params.set('importer', filePath);
  return `${imageSrc}?${params.toString()}`;
}

/** 与 astro VALID_INPUT_FORMATS 对齐的输入格式（SVG 走单独分支，不在优化之列） */
const VALID_INPUT_FORMATS = new Set(['jpeg', 'jpg', 'png', 'tiff', 'webp', 'gif', 'svg', 'avif']);

/** 不适合走 Astro 光栅优化的格式（SVG 矢量、GIF 动帧） */
const NON_OPTIMIZABLE_FORMATS = new Set(['svg', 'gif']);

/** 判断 src 是否应跳过优化（SVG/GIF 原样保留，避免丢帧/光栅化） */
export function isNonOptimizableImage(src: string): boolean {
  const clean = src.split('?')[0].split('#')[0];
  const ext = clean.split('.').at(-1)?.toLowerCase() ?? '';
  return NON_OPTIMIZABLE_FORMATS.has(ext);
}

async function loadImageAssetMap(): Promise<ImageAssetMap> {
  // @ts-expect-error - astro:asset-imports 是 astro 运行时虚拟模块，无类型声明
  const mod = (await import('astro:asset-imports')) as { default: ImageAssetMap };
  return mod.default;
}

/**
 * 将内容源图片引用解析为发布优化图 URL。
 * 通过 Astro content 管线维护的 imageAssetMap 拿到合法 ImageMetadata，再经 getImage 优化。
 * 查不到映射 / 源不适合优化 / getImage 失败时返回 null（调用方决定降级）。
 */
export async function resolveOptimizedImage(
  imageSrc: string,
  filePath: string,
  options: ResolveOptimizedImageOptions = {},
): Promise<ResolvedOptimizedImage | null> {
  if (isNonOptimizableImage(imageSrc)) return null;

  const id = imageSrcToImportId(imageSrc, filePath);
  if (!id) return null;

  try {
    const map = await loadImageAssetMap();
    const metadata = map.get(id);
    if (!metadata) return null;

    const { getImage } = await import('astro:assets');
    const width = options.width ?? DEFAULT_WIDTH;
    const format = options.format ?? DEFAULT_FORMAT;
    const result = await getImage({ src: metadata as never, width, format });
    return { url: result.src, width: result.options.width ?? width, height: result.options.height ?? 0 };
  } catch {
    // imageAssetMap 不可用 / getImage 失败：降级
    return null;
  }
}
