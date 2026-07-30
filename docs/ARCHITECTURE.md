# Boxing News App — Architecture

## SvelteKit Architecture Overview

This application follows the standard **SvelteKit** architecture, which is a file-system based routing framework built on top of Svelte 5 and Vite.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Client (Browser)                       │
│  ┌────────────────────────────────────────────────────────┐  │
│  │            Svelte 5 Components (Runes Mode)            │  │
│  │  +page.svelte → +layout.svelte → app.html             │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP / SSR
┌──────────────────────────▼──────────────────────────────────┐
│                    SvelteKit Server (Vite)                    │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │ Route Handlers│  │ Server Load  │  │ API Endpoints      │  │
│  │ +page.svelte │  │ +page.server │  │ +server.ts         │  │
│  └─────────────┘  └──────────────┘  └────────────────────┘  │
│                                          │                    │
│                          ┌───────────────▼──────────────┐    │
│                          │  Cheerio (HTML Scraping)      │    │
│                          │  External News Sources        │    │
│                          └──────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Routing Structure

SvelteKit uses **file-system routing**. Each file under `src/routes/` maps to a URL path.

### Current Routes

| File                        | URL   | Purpose                          |
|-----------------------------|-------|----------------------------------|
| `src/routes/+page.svelte`   | `/`   | Homepage (placeholder)           |
| `src/routes/+layout.svelte` | `*`   | Root layout (wraps all pages)    |

### Planned Routes (Anticipated)

Based on the project name and dependencies, the app will likely need:

| Route Pattern                     | Purpose                                    |
|-----------------------------------|--------------------------------------------|
| `/`                               | Homepage with latest boxing news           |
| `/news/[slug]`                    | Individual news article page               |
| `/fighters` or `/boxers`          | Fighter profiles / directory               |
| `/schedule`                       | Upcoming fights / events                   |
| `/api/news`                       | Server endpoint for fetching/scraping news |

---

## Data Flow Patterns

### Server-Side Data Loading (SvelteKit Convention)

```
+page.server.ts (load function)
        │
        ▼
  Fetch/scrape data using Cheerio
        │
        ▼
  Return data object
        │
        ▼
+page.svelte (receives data via $props())
        │
        ▼
  Render UI with boxing news data
```

### Expected Scraping Pipeline

```
External Boxing News Site(s)
        │
        ▼
  HTTP fetch() on server
        │
        ▼
  Cheerio.load(html)
        │
        ▼
  Extract articles, fighters, events
        │
        ▼
  Return structured data to Svelte pages
```

---

## Svelte 5 Runes Mode

The project enforces **Svelte 5 Runes mode** globally. Key implications:

| Feature          | Legacy Svelte          | Runes Mode (This Project) |
|------------------|------------------------|---------------------------|
| State            | `let count = 0`        | `let count = $state(0)`   |
| Derived values   | `$: double = count * 2`| `let double = $derived(count * 2)` |
| Props            | `export let name`      | `let { name } = $props()` |
| Effects          | `$: { ... }`           | `$effect(() => { ... })`  |

This is enforced in `vite.config.ts`:
```typescript
compilerOptions: {
    runes: ({ filename }) =>
        filename.split(/[/\\]/).includes('node_modules') ? undefined : true
}
```

---

## Deployment

The project includes two adapters:

1. **`adapter-auto`** (configured in `vite.config.ts`) — Auto-detects deployment platform (Vercel, Netlify, Cloudflare, etc.)
2. **`adapter-node`** (installed as dependency) — Available for self-hosted Node.js deployment

To switch to the Node adapter, update `vite.config.ts`:

```diff
-import adapter from '@sveltejs/adapter-auto';
+import adapter from '@sveltejs/adapter-node';
```

---

## Directory Conventions

| Directory         | Purpose                                              |
|-------------------|------------------------------------------------------|
| `src/routes/`     | Pages, layouts, server endpoints (file-system router) |
| `src/lib/`        | Shared code, importable via `$lib` alias             |
| `src/lib/assets/` | Static assets processed by Vite (SVGs, images)       |
| `static/`         | Static files served as-is (robots.txt, etc.)         |
| `.svelte-kit/`    | Auto-generated SvelteKit files (gitignored)          |
