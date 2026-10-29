import { getCollection } from 'astro:content';

export async function getPosts() {
	const posts = await getCollection('til', ({ data }) => import.meta.env.DEV || !data.draft);
	return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function countTags(posts: Awaited<ReturnType<typeof getPosts>>) {
	const counts = new Map<string, number>();
	for (const post of posts) {
		for (const tag of post.data.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
	}
	return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

export function formatDate(date: Date) {
	return date.toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });
}
