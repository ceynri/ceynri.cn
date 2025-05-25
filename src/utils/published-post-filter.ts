import type { CollectionEntry } from 'astro:content';

/**
 * 已发布的博客文章过滤器
 * 在开发环境中所有文章都会通过
 */
export const publishedPostFilter = ({ data }: CollectionEntry<'blog'>): boolean => import.meta.env.DEV || data.published;
