import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';

import { SITE_DESCRIPTION, SITE_TITLE } from '~/consts';
import { getSortedPosts, publishedPostFilter } from '~/utils';

const parser = new MarkdownIt({
  html: true,
});

export async function GET(context) {
  const rawPosts = await getCollection('blog', publishedPostFilter);
  const posts = getSortedPosts(rawPosts);
  const items = await Promise.all(posts.map(async (post) => {
    return {
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.lastmod || post.data.date,
      link: `/blog/${post.id}/`,
      content: post.body
        ? sanitizeHtml(parser.render(post.body), {
            allowedTags: [
              ...sanitizeHtml.defaults.allowedTags,
              'img',
              'iframe',
            ],
            allowedAttributes: {
              ...sanitizeHtml.defaults.allowedAttributes,
              iframe: ['src', 'title', 'allowfullscreen'],
            },
            allowedIframeHostnames: ['player.bilibili.com'],
          })
        : '',
      categories: post.data.tags,
    };
  }));

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    items,
    customData: `
      <language>zh-CN</language>
      <follow_challenge>
        <feedId>109567107934380032</feedId>
        <userId>67823700625606656</userId>
      </follow_challenge>
    `,
    stylesheet: '/rss/style.xsl',
  });
}
