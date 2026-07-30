# Boxing News App — Project Overview

## Status: 🟡 Early Development (Scaffolding Phase)

**Last reviewed:** 2026-07-29

---

## Summary

The Boxing News App is a web application built with **SvelteKit** and **TypeScript**. The project is currently in its **initial scaffolding phase** — the SvelteKit skeleton has been generated, dependencies are installed, but no boxing-specific features, pages, or styling have been implemented yet.

---

## Technology Stack

| Layer          | Technology                  | Version     |
|----------------|-----------------------------|-------------|
| Framework      | SvelteKit                   | ^2.63.0     |
| UI Library     | Svelte 5 (Runes mode)      | ^5.56.1     |
| Language       | TypeScript                  | ^6.0.3      |
| Build Tool     | Vite                        | ^8.0.16     |
| Adapter        | @sveltejs/adapter-auto      | ^7.0.1      |
| Node Adapter   | @sveltejs/adapter-node      | ^5.5.7      |
| HTML Parsing   | Cheerio                     | ^1.2.0      |
| Type Checking  | svelte-check                | ^4.6.0      |

### Notable Configuration

- **Svelte 5 Runes Mode** is enforced globally via `vite.config.ts` (except for `node_modules`).
- **Strict TypeScript** is enabled with `moduleResolution: "bundler"`.
- **Preload strategy** is set to `"hover"` in `app.html`.
- **`engine-strict=true`** in `.npmrc` enforces Node.js engine requirements.

---

## Project Structure

```
boxing-news-app/
├── .gitignore
├── .npmrc                    # engine-strict=true
├── .vscode/
│   └── extensions.json       # Recommended VS Code extensions
├── package.json
├── package-lock.json
├── README.md                 # Default SvelteKit README
├── tsconfig.json             # Strict TS config extending .svelte-kit
├── vite.config.ts            # Vite + SvelteKit with runes mode
├── node_modules/
├── static/
│   └── robots.txt            # Allow all crawlers
├── src/
│   ├── app.d.ts              # Global type declarations (empty stubs)
│   ├── app.html              # HTML shell template
│   ├── lib/
│   │   ├── index.ts          # Lib entry point (empty)
│   │   └── assets/
│   │       └── favicon.svg   # Default SvelteKit favicon
│   └── routes/
│       ├── +layout.svelte    # Root layout (favicon only)
│       └── +page.svelte      # Homepage (default "Welcome to SvelteKit")
└── docs/                     # ← You are here
```

---

## Current State of Implementation

### What Exists

| Component             | Status      | Notes                                     |
|-----------------------|-------------|-------------------------------------------|
| SvelteKit skeleton    | ✅ Complete | Generated via `npx sv create`             |
| Dependencies          | ✅ Installed| `node_modules` present, lock file exists  |
| TypeScript config     | ✅ Complete | Strict mode, bundler resolution           |
| Vite config           | ✅ Complete | Runes mode enforced                       |
| Root layout           | ✅ Minimal  | Only sets favicon                         |
| Homepage              | ⚠️ Placeholder | Default SvelteKit welcome message     |
| Cheerio dependency    | ✅ Installed| Available for server-side HTML scraping   |
| Node adapter          | ✅ Installed| Ready for Node.js deployment              |

### What Does NOT Exist Yet

- ❌ **No boxing-related content, pages, or components**
- ❌ **No styling / CSS** (no global styles, no component styles)
- ❌ **No API routes or server endpoints**
- ❌ **No data fetching logic** (Cheerio is installed but unused)
- ❌ **No additional routes** beyond the default homepage
- ❌ **No custom favicon or branding**
- ❌ **No environment variables or configuration**
- ❌ **No tests**

---

## Git History

The repository has a single commit:

```
b930096 (HEAD -> master, origin/master) Initial commit
```

All SvelteKit scaffold files are currently **untracked** (not yet committed to git). This suggests the project was initialized with an empty initial commit, and the SvelteKit scaffold was generated afterward but not yet committed.

---

## Key Dependencies Explained

### `cheerio` (^1.2.0)
A fast, flexible implementation of jQuery for server-side HTML parsing. This is a **production dependency**, indicating the app is likely planned to **scrape boxing news** from external sources on the server side.

### `@sveltejs/adapter-node` (^5.5.7)
Allows the SvelteKit app to be deployed as a standalone Node.js server. This is separate from the default `adapter-auto` and suggests the app is intended to run on a **self-hosted Node.js environment** (not just static hosting).

---

## NPM Scripts

| Script         | Command                                               | Purpose                           |
|----------------|-------------------------------------------------------|-----------------------------------|
| `dev`          | `vite dev`                                            | Start development server          |
| `build`        | `vite build`                                          | Build for production              |
| `preview`      | `vite preview`                                        | Preview production build          |
| `prepare`      | `svelte-kit sync \|\| echo ''`                        | Sync SvelteKit generated files    |
| `check`        | `svelte-kit sync && svelte-check --tsconfig ...`      | Run type checking                 |
| `check:watch`  | `svelte-kit sync && svelte-check --tsconfig ... --watch` | Run type checking in watch mode |
