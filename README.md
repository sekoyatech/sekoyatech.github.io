# Sekoya.tech

The official website for **Sekoya Group Information and Technology** — a software development and technology consulting company specializing in custom software, mobile/web applications, IoT, AI/ML, and cloud solutions.

**Live:** [https://sekoya.tech](https://sekoya.tech)

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | [Astro 6](https://astro.build) — Static output, island architecture |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) — CSS-first `@theme` configuration |
| Content | MDX + Astro Content Collections with Zod schemas |
| Icons | [astro-icon](https://github.com/natemoo-re/astro-icon) + Heroicons |
| Fonts | Inter Variable + JetBrains Mono (self-hosted via Fontsource) |
| Search | [Pagefind](https://pagefind.app) — Static search, built at build time |
| Forms | [Web3Forms](https://web3forms.com) — Serverless form handling |
| Analytics | [Plausible](https://plausible.io) — Privacy-first, cookieless |
| Deployment | GitHub Pages via GitHub Actions |

## Getting Started

### Prerequisites

- Node.js **22+** (required by Astro 6)

### Installation

```bash
git clone https://github.com/sekoyatech/sekoyatech.github.io.git
cd sekoyatech.github.io
npm install
```

### Development

```bash
npm run dev        # Start dev server at http://localhost:4321
npm run build      # Production build → dist/
npm run preview    # Preview production build locally
npm run check      # TypeScript type checking
```

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
PUBLIC_WEB3FORMS_KEY=your-web3forms-access-key
```

## Project Structure

```
src/
├── assets/              # Logo, images (processed by Astro)
├── components/
│   ├── layout/          # Header, Footer
│   ├── ui/              # Button, Card, Section, Badge, ThemeToggle
│   ├── home/            # Hero, ServicesPreview, AboutPreview, Testimonials, BlogPreview, CTA
│   ├── services/        # ServiceCard
│   ├── blog/            # BlogCard, BlogList
│   ├── portfolio/       # ProjectCard
│   ├── team/            # TeamMember
│   └── contact/         # ContactForm (Web3Forms)
├── content/
│   ├── blog/en/         # Blog posts (MDX)
│   ├── services/en/     # Service descriptions (MDX)
│   ├── portfolio/en/    # Project case studies (MDX)
│   ├── team/en/         # Team member bios (MDX)
│   └── testimonials/en/ # Client testimonials (MDX)
├── i18n/                # Internationalization (EN default, extensible)
├── layouts/             # BaseLayout, PageLayout, BlogLayout
├── lib/                 # Constants, SEO helpers, utilities
├── pages/               # All routes (15 page files)
└── styles/
    └── global.css       # Tailwind @theme, dark/light tokens, typography
```

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Hero, services preview, about, testimonials, blog preview, CTA |
| About | `/about/` | Company story, mission, stats, timeline |
| Services | `/services/` | All 8 services in grid |
| Service Detail | `/services/[slug]/` | Individual service with FAQ section |
| Blog | `/blog/` | All blog posts |
| Blog Post | `/blog/[slug]/` | Article with reading time, share links |
| Portfolio | `/portfolio/` | Project showcases |
| Project Detail | `/portfolio/[slug]/` | Case study with tech stack |
| Team | `/team/` | Team member cards |
| Careers | `/careers/` | Culture, benefits, open positions |
| Contact | `/contact/` | Contact form + company info |
| Privacy Policy | `/privacy-policy/` | GDPR-compliant privacy policy |
| 404 | `/404.html` | Custom error page with helpful links |
| RSS | `/rss.xml` | Blog RSS feed |

## Features

### Design
- **Dark-first theme** with light mode toggle (persists via localStorage)
- **Mobile-first** responsive design with Tailwind CSS v4
- **Emerald + Indigo** brand palette inspired by the Sequoia tree
- Custom MDX typography system (no @tailwindcss/typography dependency)
- CSS-only animations + Astro View Transitions (ClientRouter)

### SEO & AI Discoverability
- **robots.txt** with rules for 15+ crawlers (Googlebot, GPTBot, ClaudeBot, PerplexityBot, etc.)
- **llms.txt** — AI-readable site index ([llmstxt.org](https://llmstxt.org) spec)
- **llms-full.txt** — Auto-generated complete site content for LLM ingestion
- **JSON-LD** structured data: ProfessionalService, FAQPage, BlogPosting, BreadcrumbList, Organization, Service, Person
- Open Graph + Twitter Card meta tags on every page
- Auto-generated sitemap (`/sitemap-index.xml`) and RSS feed (`/rss.xml`)
- Pagefind static search indexing

### Performance
- Zero client-side JS by default (Astro island architecture)
- Self-hosted fonts (no external font requests)
- Static output — all pages pre-rendered at build time
- Images optimized via Astro Image Service

### Accessibility
- WCAG 2.1 AA target
- Semantic HTML landmarks
- Skip navigation link
- Keyboard navigable with visible focus indicators
- `aria-expanded`, `aria-current`, `aria-label` attributes
- `prefers-reduced-motion` support

### Internationalization
- Built-in i18n infrastructure (Astro routing)
- English as default locale
- UI strings centralized in `src/i18n/en.json` (70+ keys)
- Content organized by locale (`content/*/en/`)
- Ready to add Turkish, German, or other languages

## Content Management

All content is managed via MDX files in `src/content/`. Each collection has a Zod schema defined in `src/content.config.ts`.

### Adding a Blog Post

Create `src/content/blog/en/your-post-slug.mdx`:

```mdx
---
title: "Your Post Title"
description: "A brief description for SEO and previews"
pubDate: 2026-03-15
tags: ["web", "technology"]
author: "Your Name"
draft: false
---

Your content here in MDX...
```

### Adding a Service

Create `src/content/services/en/your-service.mdx`:

```mdx
---
title: "Service Name"
description: "Brief description"
icon: "heroicon-name"
order: 9
features:
  - "Feature one"
  - "Feature two"
---

Detailed service description here...
```

### Adding a Team Member

Create `src/content/team/en/name.mdx`:

```mdx
---
name: "Full Name"
role: "Job Title"
bio: "Short biography"
linkedin: "https://linkedin.com/in/username"
github: "https://github.com/username"
order: 3
---
```

## Deployment

The site auto-deploys to GitHub Pages on every push to `main` via GitHub Actions.

**Workflow:** `.github/workflows/deploy.yml`

### Custom Domain

The `public/CNAME` file contains `sekoya.tech`. DNS must have:
- A record pointing to GitHub Pages IPs, or
- CNAME record pointing to `sekoyatech.github.io`

### Manual Deploy

```bash
npm run build    # Builds to dist/ and runs Pagefind indexing
```

## Adding a New Language

1. Add locale to `astro.config.mjs`:
   ```js
   locales: ['en', 'tr'],
   ```
2. Create `src/i18n/tr.json` with translated UI strings
3. Create content directories: `src/content/blog/tr/`, `src/content/services/tr/`, etc.
4. Turkish pages will be auto-generated at `/tr/`, `/tr/about/`, etc.

## Discovery Files

| File | URL | Purpose |
|------|-----|---------|
| `robots.txt` | `/robots.txt` | Crawler access rules (15+ bots) |
| `llms.txt` | `/llms.txt` | AI/LLM site index |
| `llms-full.txt` | `/llms-full.txt` | Full site content for AI ingestion |
| `sitemap` | `/sitemap-index.xml` | XML sitemap for search engines |
| `rss` | `/rss.xml` | Blog RSS feed |
| `humans.txt` | `/humans.txt` | Team & technology info |
| `security.txt` | `/.well-known/security.txt` | Security contact |

## License

All rights reserved. Copyright (c) 2024-present Sekoya Group Information and Technology.
