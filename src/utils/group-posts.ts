import type { CollectionEntry } from 'astro:content';

/**
 * 按指定属性或条件对博客文章进行分组
 * @param posts 博客文章集合
 * @param getGroupKey 获取分组键的函数，接收文章返回分组键
 * @returns 按指定条件分组后的博客文章集合
 */
export function groupPosts<T extends CollectionEntry<'blog'>, K extends string | number>(
  posts: T[],
  getGroupKey: (post: T) => K[] | K | undefined,
): Record<string, T[]> {
  return posts.reduce((acc, post) => {
    const keys = getGroupKey(post);

    // 异常情况
    if (!keys || (Array.isArray(keys) && keys.length === 0)) {
      return acc;
    }

    // 统一处理单个键和多个键的情况
    const keyArray = Array.isArray(keys) ? keys : [keys];

    keyArray.forEach((key) => {
      if (!key) {
        return;
      }
      const stringKey = String(key);
      if (!acc[stringKey]) {
        acc[stringKey] = [];
      }
      acc[stringKey].push(post);
    });

    return acc;
  }, {} as Record<string, T[]>);
}
