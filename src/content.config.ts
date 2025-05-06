import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/blog' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()),
    date: z.coerce.date(),
    lastmod: z.coerce.date().optional(),
    cover_image: image().optional(),
    slug: z.string(),
    published: z.boolean().optional().default(true),
    comment: z.boolean().optional().default(true),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/pages' }),
  schema: () => z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    lastmod: z.coerce.date().optional(),
    slug: z.string(),
    published: z.boolean().optional().default(true),
  }),
});

export const collections = {
  blog,
  pages,
};
