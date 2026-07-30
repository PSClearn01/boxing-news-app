import { json } from '@sveltejs/kit';
import { fetchAllNews } from '$lib/server/scraper';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const data = await fetchAllNews();
	return json(data, {
		headers: {
			'Cache-Control': 'public, max-age=300'
		}
	});
};
