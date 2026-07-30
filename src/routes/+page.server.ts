import type { PageServerLoad } from './$types';
import { fetchAllNews } from '$lib/server/scraper';

export const load: PageServerLoad = async () => {
	const data = await fetchAllNews();
	return {
		sources: data.sources,
		allArticles: data.allArticles,
		lastUpdated: data.lastUpdated
	};
};
