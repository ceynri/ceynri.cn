// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';

import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://astro.build/config
export default defineConfig({
	site: 'https://ceynri.cn',
	integrations: [mdx(), sitemap(), tailwind()],
	server: {
		host: true,
		port: 4321,
	},
	vite: {
		resolve: {
			alias: {
				'~': path.resolve(__dirname, './src'),
			},
		},
	},
});
