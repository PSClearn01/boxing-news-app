# Boxing News App — Development Guide

## Prerequisites

- **Node.js** (version enforced via `engine-strict=true` in `.npmrc`)
- **npm** (ships with Node.js)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd boxing-news-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` by default.

To open the app in your browser automatically:

```bash
npm run dev -- --open
```

---

## Available Commands

| Command                | Description                                      |
|------------------------|--------------------------------------------------|
| `npm run dev`          | Start Vite dev server with HMR                   |
| `npm run build`        | Create production build                          |
| `npm run preview`      | Preview the production build locally             |
| `npm run check`        | Run svelte-check for type errors                 |
| `npm run check:watch`  | Run svelte-check in watch mode                   |
| `npm run prepare`      | Sync SvelteKit generated types                   |

---

## Project Conventions

### File Naming (SvelteKit Routes)

| File Name              | Purpose                                           |
|------------------------|---------------------------------------------------|
| `+page.svelte`         | Page component (renders UI)                       |
| `+page.ts`             | Universal load function (runs on server + client) |
| `+page.server.ts`      | Server-only load function                         |
| `+layout.svelte`       | Layout component (wraps child pages)              |
| `+layout.ts`           | Universal layout load function                    |
| `+layout.server.ts`    | Server-only layout load function                  |
| `+server.ts`           | API endpoint (GET, POST, etc.)                    |
| `+error.svelte`        | Custom error page                                 |

### Import Aliases

| Alias    | Resolves To        | Usage                           |
|----------|--------------------|---------------------------------|
| `$lib`   | `src/lib/`         | Shared utilities and components |
| `$app`   | SvelteKit internals | Navigation, stores, env vars    |

### Svelte 5 Runes

This project uses **Runes mode exclusively**. Do not use legacy Svelte syntax:

```svelte
<!-- ✅ Correct (Runes) -->
<script lang="ts">
    let count = $state(0);
    let doubled = $derived(count * 2);
    let { data } = $props();
</script>

<!-- ❌ Wrong (Legacy) -->
<script lang="ts">
    let count = 0;
    $: doubled = count * 2;
    export let data;
</script>
```

---

## Adding New Pages

### 1. Create a route directory

```bash
mkdir -p src/routes/news
```

### 2. Add a page component

Create `src/routes/news/+page.svelte`:

```svelte
<script lang="ts">
    let { data } = $props();
</script>

<h1>Boxing News</h1>
<!-- Render news articles -->
```

### 3. Add server-side data loading (optional)

Create `src/routes/news/+page.server.ts`:

```typescript
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    // Fetch boxing news data here
    return {
        articles: []
    };
};
```

---

## Adding API Endpoints

Create `src/routes/api/news/+server.ts`:

```typescript
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
    // Scrape or fetch news
    return json({ articles: [] });
};
```

---

## Using Cheerio for Scraping

Cheerio is installed as a production dependency for server-side HTML parsing:

```typescript
import * as cheerio from 'cheerio';

async function scrapeNews(url: string) {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const articles = $('article').map((_, el) => ({
        title: $(el).find('h2').text(),
        summary: $(el).find('p').text(),
        link: $(el).find('a').attr('href')
    })).get();

    return articles;
}
```

> **Important:** Cheerio should only be used in server-side code (`+page.server.ts`, `+server.ts`, or `$lib` files imported by server code). It will not work in the browser.

---

## Type Checking

Run the TypeScript/Svelte type checker:

```bash
# One-time check
npm run check

# Watch mode (re-checks on file changes)
npm run check:watch
```

---

## Building for Production

```bash
# Build
npm run build

# Preview the build
npm run preview
```

The build output depends on which adapter is active:

- **adapter-auto**: Output format determined by deployment platform
- **adapter-node**: Creates a standalone Node.js server in `build/`

---

## Environment Variables

SvelteKit supports environment variables through:

- `$env/static/private` — Build-time private variables
- `$env/static/public` — Build-time public variables (prefixed with `PUBLIC_`)
- `$env/dynamic/private` — Runtime private variables
- `$env/dynamic/public` — Runtime public variables

Create a `.env` file (gitignored by default):

```env
# Private (server-only)
NEWS_API_KEY=your_api_key_here

# Public (accessible in browser)
PUBLIC_SITE_NAME=Boxing News
```
