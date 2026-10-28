// @ts-check
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// TODO: Cloudflare Pages のURL（または独自ドメイン）が決まったら書き換える
export default defineConfig({
	site: 'https://til.pages.dev',
	integrations: [mdx(), sitemap()],
	markdown: {
		shikiConfig: {
			themes: { light: 'github-light', dark: 'github-dark' },
		},
	},
});
