import type { CollectionEntry } from 'astro:content';

/**
 * 按日期降序（从新到旧）排序博客文章
 * @param posts 博客文章集合
 * @returns 排序后的博客文章集合
 */
export function getSortedPosts<T extends CollectionEntry<'blog'>>(posts: T[]): T[] {
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}
