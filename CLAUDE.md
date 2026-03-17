# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Dev server at localhost:4321
npm run build      # Production build → dist/ (also runs pagefind postbuild)
npm run preview    # Preview production build
npm run check      # Astro TypeScript checking
```

## Architecture

Astro 6 static site for sekoya.tech, deployed to GitHub Pages. Output is purely static HTML — no SSR, no server adapters.

### Key Constraints

- **Static only**: No server-side features. Content Collections use `glob()` loaders, not live/CMS loaders.
- **Tailwind v4**: Uses `@tailwindcss/vite` plugin (NOT `@astrojs/tailwind` which is deprecated). Theme is configured via CSS `@theme` block in `src/styles/global.css`, not a JS config file.
- **No `@tailwindcss/typography`**: MDX content uses custom `.mdx-content` styles in `global.css` instead of `prose` classes.
- **Dark-first theme**: Default is dark (colors in `@theme`), light mode via `.light` class on `<html>`. Do NOT use Tailwind `dark:` variant — it uses `prefers-color-scheme` which conflicts with our class-based approach.
- **Cookie consent**: Google Analytics (GA4) is loaded only after user consent via the `CookieConsent.astro` component. Plausible remains cookieless. Consent state is stored in `localStorage` key `cookie-consent` (`accepted` / `rejected`). Do not add additional cookie-setting tools without integrating them into the consent flow.

### Layout Hierarchy

- `BaseLayout.astro` — Root HTML shell. Every page uses this. Contains: theme init script, ClientRouter, meta tags, JSON-LD, Plausible, Header, Footer, CookieConsent.
- `PageLayout.astro` — Wraps BaseLayout. Adds hero section with breadcrumbs. Used by most inner pages.
- `BlogLayout.astro` — Wraps BaseLayout. Article-specific: reading time, date, tags, share links. Used by blog post pages.

Home page and 404 use BaseLayout directly (custom hero / no hero).

### Content Collections

Defined in `src/content.config.ts` (NOT root `content.config.ts`). Uses Astro 6 `glob()` loaders:

| Collection | Base path | Key fields |
|---|---|---|
| blog | `./src/content/blog/en` | title, pubDate, tags, draft |
| services | `./src/content/services/en` | title, icon, order, features |
| testimonials | `./src/content/testimonials/en` | quote, author, company, order |

Content is organized by locale (`/en/`). Only English exists now; adding a language means creating `src/content/*/tr/` dirs and adding `'tr'` to `astro.config.mjs` locales.

### JSON Data Files

Team and portfolio data live in `src/data/` as JSON files (not Content Collections). This allows editing via the GitHub web UI without touching source code:

- **`src/data/team.json`** — Team members. Fields: `name`, `role`, `bio`, `photo` (GitHub avatar URL), `linkedin`, `github`, `skills` (string array), `order`. Used by `src/pages/team.astro` and `llms-full.txt.ts`.
- **`src/data/portfolio.json`** — Portfolio projects. Fields: `slug`, `title`, `description`, `techStack`, `year`, `featured`, `client`, `url`, `challenge` (string), `approach` (array of `{label, text}`), `results` (string array). Used by `src/pages/portfolio/index.astro`, `src/pages/portfolio/[slug].astro`, and `llms-full.txt.ts`.

In dynamic routes (`[slug].astro`), use `entry.id` for the slug param — Astro 6 with glob loaders uses `.id`, not `.slug`. For JSON-based routes (portfolio), use the `slug` field from the JSON entry.

### Theme System

Colors are CSS custom properties in `global.css` `@theme` block. Dark values are the defaults. Light overrides are in the `.light` class. Use these as Tailwind utilities: `bg-bg`, `text-text`, `text-text-muted`, `bg-surface`, `border-border`, `text-primary`, etc.

The theme toggle script is in `ThemeToggle.astro`. It uses **class-based selectors** (`.theme-toggle`, `.theme-icon-sun`, `.theme-icon-moon`) because the component renders twice (desktop nav + mobile nav). Never use `id` attributes on components that appear in both desktop and mobile navigation.

### i18n

UI strings are in `src/i18n/en.json`. Access via `useTranslations()` from `src/i18n/utils.ts`. Navigation labels in `constants.ts` reference i18n keys (e.g., `'nav.about'`).

### SEO

`src/lib/seo.ts` exports JSON-LD generators: `organizationJsonLd`, `websiteJsonLd`, `breadcrumbJsonLd`, `blogPostingJsonLd`, `serviceJsonLd`, `personJsonLd`, `professionalServiceJsonLd`, `faqPageJsonLd`. BaseLayout injects Organization + WebSite on every page. PageLayout adds BreadcrumbList.

AI discovery files: `public/llms.txt` (static), `src/pages/llms-full.txt.ts` (auto-generated at build from content collections + JSON data files).

### Mobile Menu

The mobile menu overlay is rendered **outside** `<header>` in `Header.astro` to avoid a CSS `backdrop-filter` containing block issue. It uses a small inline `<script>` for open/close (not CSS-only checkbox). The script must re-init on `astro:after-swap` for View Transitions.

### Footer Service Links

Footer nav links are defined in `FOOTER_NAV` in `src/lib/constants.ts`. The href values must match actual content collection entry IDs (file names without `.mdx`). If a service file is renamed, update `FOOTER_NAV` to match.
