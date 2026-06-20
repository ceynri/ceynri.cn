import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Vite SSR 环境下 import.meta.env 可用
const contentBase = import.meta.env.CONTENT_BASE || './content';
// 注意：与 astro.config.ts 中 resolveContentBase 读取同一 CONTENT_BASE 变量

const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: `${contentBase}/blog` }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      summary: z.string().optional(),
      tags: z.array(z.string()),
      date: z.coerce.date(),
      createAt: z.coerce.date().optional(),
      lastmod: z.coerce.date().optional(),
      cover_image: image().optional(),
      slug: z.string(),
      status: z.enum(['seed', 'draft', 'evergreen', 'archived']).optional(),
      published: z.boolean().optional().default(true),
      comment: z.boolean().optional().default(true),
      layout: z.enum(['narrow', 'normal']).optional().default('normal'),
      cost: z.string().optional(),
      related: z.array(z.string()).optional(),
    }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: `${contentBase}/pages` }),
  schema: () =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      date: z.coerce.date(),
      lastmod: z.coerce.date().optional(),
      slug: z.string(),
      published: z.boolean().optional().default(true),
    }),
});

const poems = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: `${contentBase}/poems` }),
  schema: () =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      slug: z.string(),
      status: z.enum(['seed', 'draft', 'evergreen', 'archived']).optional(),
      published: z.boolean().optional().default(true),
      tags: z.array(z.string()).optional(),
      layout: z.enum(['narrow', 'normal']).optional(),
    }),
});

export const collections = {
  blog,
  pages,
  poems,
};
