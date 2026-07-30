<script lang="ts">
	import type { BoxingArticle } from '$lib/types';

	let {
		article,
		formatTime,
		sourceColor
	}: {
		article: BoxingArticle;
		formatTime: (iso: string) => string;
		sourceColor: string;
	} = $props();

	let imgError = $state(false);
</script>

<a
	href={article.url}
	target="_blank"
	rel="noopener noreferrer"
	class="article-card"
	id="article-{article.id}"
>
	<div class="article-card__image-wrap">
		{#if article.imageUrl && !imgError}
			<img
				src={article.imageUrl}
				alt={article.title}
				class="article-card__image"
				loading="lazy"
				onerror={() => (imgError = true)}
			/>
		{:else}
			<div class="article-card__image-placeholder">🥊</div>
		{/if}
		<div class="article-card__source-badge">
			<span class="article-card__source-dot" style="background: {sourceColor}"></span>
			{article.source}
		</div>
	</div>
	<div class="article-card__body">
		<h3 class="article-card__title">{article.title}</h3>
		{#if article.description}
			<p class="article-card__description">{article.description}</p>
		{/if}
	</div>
	<div class="article-card__footer">
		<span class="article-card__time">
			🕐 {formatTime(article.publishedAt)}
		</span>
		<span class="article-card__read-more">
			Read more →
		</span>
	</div>
</a>
