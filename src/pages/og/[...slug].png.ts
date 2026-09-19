import { getCollection } from 'astro:content';
import type { APIRoute, GetStaticPaths } from 'astro';
import { publishedPostFilter } from '~/utils';
import { extractCoverSrcFromMarkdown, processCoverForOg } from '~/utils/og-cover';
import { generateOgImage } from '~/utils/og-image';

/**
 * 文章 OG 分享卡片端点：构建时（SSG）为每篇文章静态产出 /og/<slug>.png。
 * 图片由 satori + resvg-js 生成（见 ~/utils/og-image）；有封面的文章整幅背景式
 * 融入去噪压暗后的封面并取主色当 accent（见 ~/utils/og-cover），dev 下亦可实时预览。
 */
export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('blog', publishedPostFilter);
  return posts.map((post) => ({ params: { slug: post.id }, props: post }));
};

export const GET: APIRoute = async ({ props: post }) => {
  const { title, date } = post.data;

  // 有封面则处理为右侧图版（去噪），失败或无封面走 logo 符号版
  let coverDataUri: string | undefined;
  if (post.filePath) {
    const coverSrc = await extractCoverSrcFromMarkdown(post.filePath);
    if (coverSrc) {
      coverDataUri = (await processCoverForOg(coverSrc, post.filePath, process.cwd())) ?? undefined;
    }
  }

  const png = await generateOgImage({
    title,
    date: date.toISOString().slice(0, 10),
    coverDataUri,
  });
  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      // OG 图内容随文章而定，长缓存 + immutable
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
