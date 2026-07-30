/**
 * Represents a single boxing news article.
 */
export interface BoxingArticle {
	/** Unique identifier (hash of url) */
	id: string;
	/** Article headline */
	title: string;
	/** Full URL to the article */
	url: string;
	/** Short description or excerpt */
	description: string;
	/** Publication date as ISO string */
	publishedAt: string;
	/** Thumbnail image URL */
	imageUrl: string;
	/** Source website name */
	source: string;
	/** Source website identifier slug */
	sourceId: string;
	/** Category/tag if available */
	category?: string;
}

/**
 * Represents a news source with its articles.
 */
export interface NewsSource {
	id: string;
	name: string;
	url: string;
	logo: string;
	color: string;
	articles: BoxingArticle[];
}

/**
 * API response shape.
 */
export interface NewsResponse {
	sources: NewsSource[];
	allArticles: BoxingArticle[];
	lastUpdated: string;
}
