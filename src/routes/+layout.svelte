<script>
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>Boxing News Live — Latest Headlines from Top Boxing Sources</title>
	<meta
		name="description"
		content="Stay up-to-date with the latest boxing news, fight results, and headlines aggregated from ESPN, BoxingScene, BoxingNews24, Bad Left Hook, World Boxing News, and The Ring."
	/>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🥊</text></svg>" />
</svelte:head>

{@render children()}
