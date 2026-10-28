// 使い方: npm run new -- my-slug "タイトル" tag1,tag2
import { existsSync, writeFileSync } from 'node:fs';

const [slug, title = slug, tags = ''] = process.argv.slice(2);
if (!slug) {
	console.error('usage: npm run new -- <slug> [title] [tag1,tag2]');
	process.exit(1);
}
const date = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });
const path = `src/content/til/${date}-${slug}.md`;
if (existsSync(path)) {
	console.error(`already exists: ${path}`);
	process.exit(1);
}
const tagList = tags ? tags.split(',').map((t) => t.trim()).join(', ') : '';
writeFileSync(path, `---\ntitle: ${title}\ndate: ${date}\ntags: [${tagList}]\n---\n\n`);
console.log(path);
