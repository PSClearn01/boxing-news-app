import * as cheerio from 'cheerio';
import type { BoxingArticle, NewsSource } from '$lib/types';
import crypto from 'crypto';

/** Generate a stable ID from a URL */
function hashId(url: string): string {
	return crypto.createHash('md5').update(url).digest('hex').slice(0, 12);
}

/** Safely fetch with timeout */
async function safeFetch(url: string, timeoutMs = 10000): Promise<string | null> {
	try {
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), timeoutMs);
		const res = await fetch(url, {
			signal: controller.signal,
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
				Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
			}
		});
		clearTimeout(timer);
		if (!res.ok) return null;
		return await res.text();
	} catch {
		return null;
	}
}

/** Parse RSS/Atom XML feed into articles */
function parseRSSFeed(
	xml: string,
	source: string,
	sourceId: string,
	defaultImage: string
): BoxingArticle[] {
	const $ = cheerio.load(xml, { xml: true });
	const articles: BoxingArticle[] = [];

	// Try RSS 2.0 items
	$('item').each((_, el) => {
		const $el = $(el);
		const title = $el.find('title').first().text().trim();
		const url = $el.find('link').first().text().trim() || $el.find('guid').first().text().trim();
		const description = cleanHtml(
			$el.find('description').first().text().trim() ||
				$el.find('content\\:encoded').first().text().trim()
		);
		const pubDate =
			$el.find('pubDate').first().text().trim() || $el.find('dc\\:date').first().text().trim();

		// Try to find image from media:content, media:thumbnail, enclosure, or content
		let imageUrl =
			$el.find('media\\:content').attr('url') ||
			$el.find('media\\:thumbnail').attr('url') ||
			$el.find('enclosure[type^="image"]').attr('url') ||
			'';

		// Try extracting image from description/content HTML
		if (!imageUrl) {
			const contentHtml =
				$el.find('content\\:encoded').first().text() ||
				$el.find('description').first().text() ||
				'';
			const $content = cheerio.load(contentHtml);
			imageUrl = $content('img').first().attr('src') || '';
		}

		if (title && url) {
			articles.push({
				id: hashId(url),
				title,
				url,
				description: description.slice(0, 300),
				publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
				imageUrl: imageUrl || defaultImage,
				source,
				sourceId
			});
		}
	});

	// Try Atom entries if no RSS items found
	if (articles.length === 0) {
		$('entry').each((_, el) => {
			const $el = $(el);
			const title = $el.find('title').first().text().trim();
			const url =
				$el.find('link[rel="alternate"]').attr('href') || $el.find('link').attr('href') || '';
			const description = cleanHtml(
				$el.find('summary').first().text().trim() ||
					$el.find('content').first().text().trim()
			);
			const pubDate =
				$el.find('published').first().text().trim() ||
				$el.find('updated').first().text().trim();

			if (title && url) {
				articles.push({
					id: hashId(url),
					title,
					url,
					description: description.slice(0, 300),
					publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
					imageUrl: defaultImage,
					source,
					sourceId
				});
			}
		});
	}

	return articles;
}

/** Strip HTML tags from text */
function cleanHtml(html: string): string {
	if (!html) return '';
	const $ = cheerio.load(html);
	return $.text().replace(/\s+/g, ' ').trim();
}

/** Fetch ESPN Boxing news via Google News RSS (ESPN's boxing API is unavailable) */
async function scrapeESPNBoxing(): Promise<BoxingArticle[]> {
	const rssUrl = 'https://news.google.com/rss/search?q=site:espn.com+boxing&hl=en-US&gl=US&ceid=US:en';
	const xml = await safeFetch(rssUrl);
	if (!xml) return [];

	const articles = parseRSSFeed(xml, 'ESPN Boxing', 'espn', '');

	// Google News wraps the real URL — extract actual ESPN URL from title link
	return articles.map((a) => ({
		...a,
		// Remove " - ESPN" suffix from titles if present
		title: a.title.replace(/\s*[-–]\s*ESPN.*$/, '').trim() || a.title
	})).slice(0, 15);
}

/** Scrape BoxingScene via RSS */
async function scrapeBoxingScene(): Promise<BoxingArticle[]> {
	const rssUrl = 'https://www.boxingscene.com/rss/rss.xml';
	const xml = await safeFetch(rssUrl);
	if (!xml) {
		// Fallback to HTML scraping
		return scrapeBoxingSceneHtml();
	}
	return parseRSSFeed(xml, 'BoxingScene', 'boxingscene', '');
}

async function scrapeBoxingSceneHtml(): Promise<BoxingArticle[]> {
	const html = await safeFetch('https://www.boxingscene.com/');
	if (!html) return [];
	const $ = cheerio.load(html);
	const articles: BoxingArticle[] = [];

	$('article, .post-item, .news-item, .story-item').each((_, el) => {
		const $el = $(el);
		const $link = $el.find('a').first();
		const href = $link.attr('href') || '';
		const title = $link.text().trim() || $el.find('h2, h3, h4').first().text().trim();
		const img = $el.find('img').first().attr('src') || '';
		const desc = $el.find('p, .excerpt, .summary').first().text().trim();

		if (!title || !href) return;

		const fullUrl = href.startsWith('http') ? href : `https://www.boxingscene.com${href}`;

		articles.push({
			id: hashId(fullUrl),
			title,
			url: fullUrl,
			description: desc.slice(0, 300),
			publishedAt: new Date().toISOString(),
			imageUrl: img,
			source: 'BoxingScene',
			sourceId: 'boxingscene'
		});
	});

	return articles.slice(0, 15);
}

/** Scrape BoxingNews24 via RSS */
async function scrapeBoxingNews24(): Promise<BoxingArticle[]> {
	const rssUrl = 'https://www.boxingnews24.com/feed/';
	const xml = await safeFetch(rssUrl);
	if (!xml) {
		return scrapeBoxingNews24Html();
	}
	return parseRSSFeed(xml, 'BoxingNews24', 'boxingnews24', '');
}

async function scrapeBoxingNews24Html(): Promise<BoxingArticle[]> {
	const html = await safeFetch('https://www.boxingnews24.com/');
	if (!html) return [];
	const $ = cheerio.load(html);
	const articles: BoxingArticle[] = [];

	$('.post, article, .entry, .td-module-container').each((_, el) => {
		const $el = $(el);
		const $link = $el.find('a[href*="boxingnews24"]').first();
		const href = $link.attr('href') || '';
		const title = $el.find('.entry-title, h3, h2').first().text().trim() || $link.text().trim();
		const img =
			$el.find('img').first().attr('data-src') || $el.find('img').first().attr('src') || '';
		const desc = $el.find('.td-excerpt, .entry-summary, p').first().text().trim();
		const dateStr = $el.find('time').attr('datetime') || '';

		if (!title || !href) return;

		articles.push({
			id: hashId(href),
			title,
			url: href,
			description: desc.slice(0, 300),
			publishedAt: dateStr ? new Date(dateStr).toISOString() : new Date().toISOString(),
			imageUrl: img,
			source: 'BoxingNews24',
			sourceId: 'boxingnews24'
		});
	});

	return articles.slice(0, 15);
}

/** Scrape Bad Left Hook via RSS (SB Nation / Vox Media) */
async function scrapeBadLeftHook(): Promise<BoxingArticle[]> {
	const rssUrl = 'https://www.badlefthook.com/rss/current.xml';
	const xml = await safeFetch(rssUrl);
	if (!xml) {
		return scrapeBadLeftHookHtml();
	}
	return parseRSSFeed(xml, 'Bad Left Hook', 'badlefthook', '');
}

async function scrapeBadLeftHookHtml(): Promise<BoxingArticle[]> {
	const html = await safeFetch('https://www.badlefthook.com/');
	if (!html) return [];
	const $ = cheerio.load(html);
	const articles: BoxingArticle[] = [];

	$('h2 a, .c-entry-box--compact a, .c-compact-river__entry a').each((_, el) => {
		const $el = $(el);
		const href = $el.attr('href') || '';
		const title = $el.text().trim();

		if (!title || title.length < 10 || !href) return;
		const fullUrl = href.startsWith('http') ? href : `https://www.badlefthook.com${href}`;
		if (articles.some((a) => a.url === fullUrl)) return;

		articles.push({
			id: hashId(fullUrl),
			title,
			url: fullUrl,
			description: '',
			publishedAt: new Date().toISOString(),
			imageUrl: '',
			source: 'Bad Left Hook',
			sourceId: 'badlefthook'
		});
	});

	return articles.slice(0, 15);
}

/** Scrape World Boxing News via RSS */
async function scrapeWorldBoxingNews(): Promise<BoxingArticle[]> {
	const rssUrl = 'https://www.worldboxingnews.net/feed/';
	const xml = await safeFetch(rssUrl);
	if (!xml) {
		return scrapeWorldBoxingNewsHtml();
	}
	return parseRSSFeed(xml, 'World Boxing News', 'worldboxingnews', '');
}

async function scrapeWorldBoxingNewsHtml(): Promise<BoxingArticle[]> {
	const html = await safeFetch('https://www.worldboxingnews.net/');
	if (!html) return [];
	const $ = cheerio.load(html);
	const articles: BoxingArticle[] = [];

	$('article, .post, .entry').each((_, el) => {
		const $el = $(el);
		const $link = $el.find('a').first();
		const href = $link.attr('href') || '';
		const title = $el.find('h2, h3, .entry-title').first().text().trim() || $link.text().trim();
		const img = $el.find('img').first().attr('src') || '';
		const desc = $el.find('.entry-summary, .excerpt, p').first().text().trim();
		const dateStr = $el.find('time').attr('datetime') || '';

		if (!title || !href) return;

		articles.push({
			id: hashId(href),
			title,
			url: href,
			description: desc.slice(0, 300),
			publishedAt: dateStr ? new Date(dateStr).toISOString() : new Date().toISOString(),
			imageUrl: img,
			source: 'World Boxing News',
			sourceId: 'worldboxingnews'
		});
	});

	return articles.slice(0, 15);
}

/** Fetch The Ring Magazine news via Google News RSS (ringtv.com feed is unavailable) */
async function scrapeRingMagazine(): Promise<BoxingArticle[]> {
	const rssUrl = 'https://news.google.com/rss/search?q=site:ringtv.com&hl=en-US&gl=US&ceid=US:en';
	const xml = await safeFetch(rssUrl);
	if (!xml) return [];

	const articles = parseRSSFeed(xml, 'The Ring', 'thering', '');

	return articles.map((a) => ({
		...a,
		title: a.title.replace(/\s*[-–]\s*The Ring.*$/, '').trim() || a.title
	})).slice(0, 15);
}

/** Source metadata */
const SOURCE_META: Record<string, { name: string; url: string; logo: string; color: string }> = {
	espn: {
		name: 'ESPN Boxing',
		url: 'https://www.espn.com/boxing/',
		logo: '🏟️',
		color: '#d00'
	},
	boxingscene: {
		name: 'BoxingScene',
		url: 'https://www.boxingscene.com/',
		logo: '🥊',
		color: '#1a73e8'
	},
	boxingnews24: {
		name: 'BoxingNews24',
		url: 'https://www.boxingnews24.com/',
		logo: '📰',
		color: '#ff6b00'
	},
	badlefthook: {
		name: 'Bad Left Hook',
		url: 'https://www.badlefthook.com/',
		logo: '🤛',
		color: '#e91e63'
	},
	worldboxingnews: {
		name: 'World Boxing News',
		url: 'https://www.worldboxingnews.net/',
		logo: '🌍',
		color: '#00897b'
	},
	thering: {
		name: 'The Ring',
		url: 'https://www.ringtv.com/',
		logo: '💍',
		color: '#ffd600'
	}
};

/** In-memory cache */
let cachedData: { sources: NewsSource[]; allArticles: BoxingArticle[]; lastUpdated: string } | null =
	null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/** Fetch all news sources in parallel */
export async function fetchAllNews(): Promise<{
	sources: NewsSource[];
	allArticles: BoxingArticle[];
	lastUpdated: string;
}> {
	// Return cache if fresh
	if (cachedData && Date.now() - cacheTimestamp < CACHE_DURATION) {
		return cachedData;
	}

	const scrapers: [string, () => Promise<BoxingArticle[]>][] = [
		['espn', scrapeESPNBoxing],
		['boxingscene', scrapeBoxingScene],
		['boxingnews24', scrapeBoxingNews24],
		['badlefthook', scrapeBadLeftHook],
		['worldboxingnews', scrapeWorldBoxingNews],
		['thering', scrapeRingMagazine]
	];

	const results = await Promise.allSettled(scrapers.map(([, fn]) => fn()));

	const sources: NewsSource[] = [];
	const allArticles: BoxingArticle[] = [];

	results.forEach((result, idx) => {
		const [sourceId] = scrapers[idx];
		const meta = SOURCE_META[sourceId];
		const articles = result.status === 'fulfilled' ? result.value : [];

		sources.push({
			id: sourceId,
			name: meta.name,
			url: meta.url,
			logo: meta.logo,
			color: meta.color,
			articles: articles.sort(
				(a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
			)
		});

		allArticles.push(...articles);
	});

	// Sort all articles by date, newest first
	allArticles.sort(
		(a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
	);

	const data = {
		sources,
		allArticles,
		lastUpdated: new Date().toISOString()
	};

	// Cache results
	cachedData = data;
	cacheTimestamp = Date.now();

	return data;
}
