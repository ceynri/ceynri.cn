import { getCollection } from 'astro:content';
import type { APIRoute, GetStaticPaths } from 'astro';

import { sanitizeMarkdown } from '~/plugins';
import { publishedPostFilter } from '~/utils';

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('blog', publishedPostFilter);
  return posts.map((post) => ({ params: { slug: post.id }, props: post }));
};

/** YAML 字符串安全转义：含特殊字符时用双引号包裹 */
function yamlString(value: string): string {
  if (/[:#[\]{}&*!|>'"%@`]|^\s|\s$|\n/.test(value)) {
    return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  return value;
}

export const GET: APIRoute = async ({ props: post, site }) => {
  if (!site) {
    throw new Error('Astro site URL is not configured');
  }
  const { title, date, lastmod, tags, description, summary } = post.data;
  const canonical = new URL(`/blog/${post.id}/`, site).href;

  const frontmatterLines = [
    '---',
    `title: ${yamlString(title)}`,
    `date: ${date.toISOString()}`,
    ...(lastmod ? [`lastmod: ${lastmod.toISOString()}`] : []),
    ...(tags?.length ? [`tags: [${tags.map((t: string) => yamlString(t)).join(', ')}]`] : []),
    ...(description ? [`description: ${yamlString(description)}`] : []),
    ...(summary ? [`summary: ${yamlString(summary)}`] : []),
    `canonical_url: ${canonical}`,
    '---',
  ];

  const cleanBody = await sanitizeMarkdown(post.body ?? '', {
    // 正文首个 H1 与 frontmatter.title 重复，剥掉（孪生已用 title 重建 H1）
    stripLeadingHeading: true,
  });

  const lead = summary ? `\n\n> ${summary}` : '';
  const output = `${frontmatterLines.join('\n')}\n\n# ${title}${lead}\n\n${cleanBody}\n`;

  return new Response(output, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      Link: `<${canonical}>; rel="canonical"`,
    },
  });
};
