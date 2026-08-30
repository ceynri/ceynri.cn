import { type CollectionEntry, getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

import { SITE_DESCRIPTION, SITE_TITLE } from '~/consts';
import { publishedPostFilter } from '~/utils';

type BlogPost = CollectionEntry<'blog'>;

const getPubDate = (post: BlogPost) => post.data.publishedAt || post.data.date;

/**
 * /llms.txt：面向 AI Agent 的站点索引（遵循 llms.txt 约定）。
 * H1 站点名 + blockquote 简介 + H2 分组的博客文章链接列表，
 * 每条链接指向该文的 Markdown 孪生，仅在作者写有 summary 时附摘要注释。
 */
export const GET: APIRoute = async ({ site }) => {
  if (!site) {
    throw new Error('Astro site URL is not configured');
  }

  const posts = (await getCollection('blog', publishedPostFilter)).sort(
    (a, b) => getPubDate(b).getTime() - getPubDate(a).getTime(),
  );

  const lines = posts.map((post) => {
    const url = new URL(`/blog/${post.id}.md`, site).href;
    const { title, summary } = post.data;
    return summary ? `- [${title}](${url}): ${summary}` : `- [${title}](${url})`;
  });

  const body = [`# ${SITE_TITLE}`, '', `> ${SITE_DESCRIPTION}`, '', '## Blog', '', ...lines, ''].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
