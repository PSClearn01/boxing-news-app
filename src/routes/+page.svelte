<script lang="ts">
	import type { BoxingArticle, NewsSource } from '$lib/types';
	import ArticleCard from '$lib/components/ArticleCard.svelte';

	let { data } = $props();

	let activeSource = $state('all');
	let viewMode = $state<'grid' | 'list'>('grid');

	const sources: NewsSource[] = $derived(data.sources);
	const allArticles: BoxingArticle[] = $derived(data.allArticles);
	const lastUpdated: string = $derived(data.lastUpdated);

	const filteredArticles = $derived(
		activeSource === 'all'
			? allArticles
			: allArticles.filter((a) => a.sourceId === activeSource)
	);

	const totalArticles = $derived(allArticles.length);
	const activeSources = $derived(sources.filter((s) => s.articles.length > 0).length);

	function formatTime(iso: string): string {
		const date = new Date(iso);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMins / 60);
		const diffDays = Math.floor(diffHours / 24);

		if (diffMins < 1) return 'Just now';
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 7) return `${diffDays}d ago`;
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	}

	function formatLastUpdated(iso: string): string {
		return new Date(iso).toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		});
	}

	const sourceColors: Record<string, string> = {
		espn: '#d00',
		boxingscene: '#1a73e8',
		boxingnews24: '#ff6b00',
		badlefthook: '#e91e63',
		worldboxingnews: '#00897b',
		thering: '#ffd600'
	};
</script>

<!-- Header -->
<header class="header" id="header">
	<div class="header__inner">
		<div class="header__brand">
			<div class="header__icon">🥊</div>
			<div>
				<div class="header__title">Boxing News Live</div>
				<div class="header__subtitle">Real-time fight coverage</div>
			</div>
		</div>
		<div class="header__meta">
			<div class="header__stat">
				<span class="header__stat-value">{totalArticles}</span>
				<span class="header__stat-label">Stories</span>
			</div>
			<div class="header__stat">
				<span class="header__stat-value">{activeSources}</span>
				<span class="header__stat-label">Sources</span>
			</div>
			<div class="header__updated">
				<span class="header__live-dot"></span>
				Updated {formatLastUpdated(lastUpdated)}
			</div>
		</div>
	</div>
</header>

<!-- Main Content -->
<main class="main" id="main-content">
	<!-- Filter Bar -->
	<nav class="filter-bar" id="source-filter" aria-label="Filter by source">
		<button
			class="filter-btn"
			class:filter-btn--active={activeSource === 'all'}
			onclick={() => (activeSource = 'all')}
			id="filter-all"
		>
			<span class="filter-btn__dot" style="background: linear-gradient(135deg, #ff2d55, #ffd700)"></span>
			All Sources
			<span class="filter-btn__count">{totalArticles}</span>
		</button>
		{#each sources as source (source.id)}
			{#if source.articles.length > 0}
				<button
					class="filter-btn"
					class:filter-btn--active={activeSource === source.id}
					onclick={() => (activeSource = source.id)}
					id="filter-{source.id}"
				>
					<span
						class="filter-btn__dot"
						style="background: {sourceColors[source.id] || '#888'}"
					></span>
					{source.name}
					<span class="filter-btn__count">{source.articles.length}</span>
				</button>
			{/if}
		{/each}
	</nav>

	<!-- Toolbar -->
	<div class="toolbar" id="toolbar">
		<div class="toolbar__title">
			{#if activeSource === 'all'}
				Latest from <span>All Sources</span>
			{:else}
				Latest from <span>{sources.find((s) => s.id === activeSource)?.name || ''}</span>
			{/if}
		</div>
		<div class="view-toggle" id="view-toggle">
			<button
				class="view-toggle__btn"
				class:view-toggle__btn--active={viewMode === 'grid'}
				onclick={() => (viewMode = 'grid')}
				aria-label="Grid view"
				id="view-grid"
			>⊞</button>
			<button
				class="view-toggle__btn"
				class:view-toggle__btn--active={viewMode === 'list'}
				onclick={() => (viewMode = 'list')}
				aria-label="List view"
				id="view-list"
			>☰</button>
		</div>
	</div>

	<!-- Articles -->
	{#if activeSource === 'all'}
		<!-- All articles in a single sorted grid -->
		{#if filteredArticles.length > 0}
			<div class="article-grid" class:article-grid--list={viewMode === 'list'} id="articles-grid">
				{#each filteredArticles as article (article.id)}
					<ArticleCard {article} {formatTime} sourceColor={sourceColors[article.sourceId] || '#888'} />
				{/each}
			</div>
		{:else}
			<div class="empty-state" id="empty-state">
				<div class="empty-state__icon">📡</div>
				<div class="empty-state__text">No articles found. Sources may be temporarily unavailable.</div>
			</div>
		{/if}
	{:else}
		<!-- Source-specific view with header -->
		{@const source = sources.find((s) => s.id === activeSource)}
		{#if source && source.articles.length > 0}
			<div class="source-section" id="source-{source.id}">
				<div class="source-header">
					<div
						class="source-header__icon"
						style="background: {sourceColors[source.id]}22"
					>
						{source.logo}
					</div>
					<div class="source-header__info">
						<div class="source-header__name">{source.name}</div>
						<div class="source-header__count">{source.articles.length} articles</div>
					</div>
					<a
						href={source.url}
						target="_blank"
						rel="noopener noreferrer"
						class="source-header__link"
					>
						Visit site →
					</a>
				</div>
				<div class="article-grid" class:article-grid--list={viewMode === 'list'}>
					{#each source.articles as article (article.id)}
						<ArticleCard {article} {formatTime} sourceColor={sourceColors[source.id] || '#888'} />
					{/each}
				</div>
			</div>
		{:else}
			<div class="empty-state" id="empty-state">
				<div class="empty-state__icon">📡</div>
				<div class="empty-state__text">No articles from this source at the moment.</div>
			</div>
		{/if}
	{/if}
</main>

<!-- Footer -->
<footer class="footer" id="footer">
	<p>
		Boxing News Live — Aggregating stories from
		<a href="https://www.espn.com/boxing/" target="_blank" rel="noopener">ESPN</a>,
		<a href="https://www.boxingscene.com/" target="_blank" rel="noopener">BoxingScene</a>,
		<a href="https://www.boxingnews24.com/" target="_blank" rel="noopener">BoxingNews24</a>,
		<a href="https://www.badlefthook.com/" target="_blank" rel="noopener">Bad Left Hook</a>,
		<a href="https://www.worldboxingnews.net/" target="_blank" rel="noopener">World Boxing News</a>,
		and <a href="https://www.ringtv.com/" target="_blank" rel="noopener">The Ring</a>.
	</p>
</footer>
