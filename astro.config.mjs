// @ts-check
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

/**
 * ビルド完了時に Pagefind の検索索引を dist/pagefind に作る。
 * デプロイ先のビルドコマンドが `astro build` でも検索が動くよう、package.json の script ではなくここで実行する。
 * @returns {import('astro').AstroIntegration}
 */
function pagefind() {
	return {
		name: 'pagefind',
		hooks: {
			'astro:build:done': async ({ dir, logger }) => {
				const { createIndex, close } = await import('pagefind');
				const site = fileURLToPath(dir);
				const { index } = await createIndex();
				if (!index) throw new Error('Pagefind の初期化に失敗しました');
				const { page_count } = await index.addDirectory({ path: site });
				await index.writeFiles({ outputPath: `${site}/pagefind` });
				await close();
				logger.info(`indexed ${page_count} pages`);
			},
		},
	};
}

// TODO: workers.dev のURL（または独自ドメイン）に書き換える
export default defineConfig({
	site: 'https://til.pages.dev',
	integrations: [mdx(), sitemap(), pagefind()],
	markdown: {
		shikiConfig: {
			themes: { light: 'github-light', dark: 'github-dark' },
		},
	},
});
