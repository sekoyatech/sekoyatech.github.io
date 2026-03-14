# Sekoya.tech Website Redesign - Design Specification

**Date:** 2026-03-14
**Status:** Draft
**Author:** Claude (AI-assisted design)
**Stakeholder:** Sekoya Group

---

## 1. Context & Goals

### Problem
Sekoya Group's current website (sekoya.tech) runs on WordPress + Be Theme. It works but suffers from:
- Heavy JS payload (~300KB+) from jQuery, Revolution Slider, etc.
- Limited customization without theme constraints
- No content versioning (WordPress DB vs. git-tracked MDX)
- Vendor lock-in to WordPress ecosystem

### Goal
Build a modern, mobile-first, high-performance static website using **Astro 6 + Tailwind CSS v4**, deployed on **GitHub Pages**. The site should:
- Score 95+ on all Lighthouse categories
- Support i18n infrastructure (EN default, TR/DE later)
- Dark-first theme with light mode toggle
- Full content management via git-tracked MDX files
- Automated CI/CD via GitHub Actions

### Non-Goals (MVP)
- CMS integration (Sanity/Contentful) — static MDX is sufficient
- Server-side rendering — GitHub Pages is static only
- E-commerce or payment features
- User authentication
- Real-time features

---

## 2. Technology Stack

| Category | Technology | Notes |
|----------|-----------|-------|
| Framework | Astro 6 (static output) | Island architecture, zero JS by default |
| Styling | Tailwind CSS v4 | Via `@tailwindcss/vite` plugin (NOT `@astrojs/tailwind`) |
| Content | MDX + Content Collections | Type-safe, build-time, git-tracked |
| i18n | Astro built-in i18n routing | EN default, extensible to TR/DE |
| Forms | Web3Forms | 250 submissions/month free, hCaptcha |
| Search | Pagefind | Static search index, built at build time |
| Icons | astro-icon + @iconify-json/heroicons | Tree-shakable SVG icons |
| Animations | CSS-only + View Transitions | Zero JS animation overhead |
| Fonts | Inter + JetBrains Mono via Fontsource | Self-hosted, optimized (`@fontsource/inter`, `@fontsource/jetbrains-mono`) |
| Analytics | Plausible | Privacy-first, lightweight script |
| Deployment | GitHub Pages + GitHub Actions | Free, custom domain (sekoya.tech) |
| Node | 22+ | Astro 6 requirement |

### Packages (Corrected from Requirements)

```json
{
  "dependencies": {
    "astro": "^6.0.0",
    "@astrojs/mdx": "^4.0.0",
    "@astrojs/sitemap": "^3.0.0",
    "@astrojs/rss": "^4.0.0",
    "@iconify-json/heroicons": "^1.0.0",
    "astro-icon": "^1.0.0",
    "@fontsource/inter": "^5.0.0",
    "@fontsource/jetbrains-mono": "^5.0.0",
    "pagefind": "^1.0.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.7.0",
    "@types/node": "^22.0.0"
  }
}
```

> **Note:** Package versions should be verified against npm registry at implementation time. Use `npm info <package> version` to confirm latest compatible versions.

**Removed from original requirements:**
- `@astrojs/tailwind` — deprecated for Tailwind v4
- `@astrojs/vercel` / `@astrojs/node` — not needed for static output
- `@sentry/astro` — overkill for static site MVP

---

## 3. Project Structure

```
sekoyatech.github.io/
├── public/
│   ├── CNAME                        # sekoya.tech
│   ├── favicon.svg
│   ├── robots.txt
│   └── og-default.png
├── src/
│   ├── assets/
│   │   ├── images/
│   │   └── logo.svg
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.astro
│   │   │   ├── Footer.astro
│   │   │   └── MobileMenu.astro
│   │   ├── ui/
│   │   │   ├── Button.astro
│   │   │   ├── Card.astro
│   │   │   ├── Section.astro
│   │   │   ├── Badge.astro
│   │   │   └── ThemeToggle.astro
│   │   ├── home/
│   │   │   ├── Hero.astro
│   │   │   ├── ServicesPreview.astro
│   │   │   ├── AboutPreview.astro
│   │   │   ├── TestimonialsSlider.astro
│   │   │   ├── BlogPreview.astro
│   │   │   └── CTA.astro
│   │   ├── services/
│   │   │   └── ServiceCard.astro
│   │   ├── blog/
│   │   │   ├── BlogCard.astro
│   │   │   └── BlogList.astro
│   │   ├── portfolio/
│   │   │   └── ProjectCard.astro
│   │   ├── team/
│   │   │   └── TeamMember.astro
│   │   └── contact/
│   │       └── ContactForm.astro
│   ├── content/
│   │   ├── blog/en/
│   │   ├── services/en/
│   │   ├── portfolio/en/
│   │   ├── team/en/
│   │   └── testimonials/en/
│   ├── i18n/
│   │   ├── ui.ts
│   │   ├── en.json
│   │   └── utils.ts
│   ├── lib/                         # Shared utilities
│   │   ├── constants.ts             # Site-wide constants
│   │   ├── seo.ts                   # SEO/meta tag helpers
│   │   └── utils.ts                 # Date formatting, reading time, etc.
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   ├── PageLayout.astro
│   │   └── BlogLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── services/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   ├── blog/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   ├── portfolio/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   ├── team.astro
│   │   ├── careers.astro
│   │   ├── contact.astro
│   │   ├── privacy-policy.astro
│   │   └── 404.astro
│   └── styles/
│       └── global.css
├── .github/workflows/deploy.yml
├── astro.config.mjs
├── content.config.ts
├── package.json
└── tsconfig.json
```

---

## 4. Design System

### 4.1 Color Palette

**Dark Theme (Default):**

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | #0F172A (Slate 900) | Page background |
| `--color-surface` | #1E293B (Slate 800) | Cards, modals, sections |
| `--color-border` | #334155 (Slate 700) | Subtle borders |
| `--color-text` | #F8FAFC (Slate 50) | Primary text |
| `--color-text-muted` | #94A3B8 (Slate 400) | Secondary text |
| `--color-primary` | #10B981 (Emerald 500) | CTA, links, accents |
| `--color-primary-dark` | #059669 (Emerald 600) | Hover states |
| `--color-secondary` | #6366F1 (Indigo 500) | Badges, highlights |
| `--color-accent` | #F59E0B (Amber 500) | Warnings, special |

**Light Theme:**

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | #FFFFFF | Page background |
| `--color-surface` | #F8FAFC (Slate 50) | Cards, modals |
| `--color-border` | #E2E8F0 (Slate 200) | Borders |
| `--color-text` | #0F172A (Slate 900) | Primary text |
| `--color-text-muted` | #64748B (Slate 500) | Secondary text |
| `--color-primary` | #059669 (Emerald 600) | CTA (darker for contrast) |
| `--color-secondary` | #4F46E5 (Indigo 600) | Badges |
| `--color-accent` | #D97706 (Amber 600) | Warnings |

### 4.2 Typography

| Level | Mobile | Desktop | Weight |
|-------|--------|---------|--------|
| Hero H1 | 2.25rem (36px) | 3.75rem (60px) | 800 |
| Section H2 | 1.875rem (30px) | 3rem (48px) | 700 |
| Card H3 | 1.25rem (20px) | 1.5rem (24px) | 600 |
| Body | 1rem (16px) | 1rem (16px) | 400 |
| Small | 0.875rem (14px) | 0.875rem (14px) | 400 |
| Caption | 0.75rem (12px) | 0.75rem (12px) | 400 |

**Fonts:**
- Sans: Inter via Fontsource (`@fontsource/inter`, self-hosted, `--font-inter`)
- Mono: JetBrains Mono via Fontsource (`@fontsource/jetbrains-mono`, `--font-mono`)

### 4.3 Spacing & Layout

- Container max-width: 1280px, centered, px-4 sm:px-6 lg:px-8
- Section vertical padding: py-16 md:py-24
- Card padding: p-6 md:p-8
- Grid gaps: gap-6 md:gap-8

### 4.4 Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Default | < 640px | Single column, stacked |
| sm | 640px | 2 columns where appropriate |
| md | 768px | Tablet layout |
| lg | 1024px | Full desktop layout |
| xl | 1280px | Wide desktop |

### 4.5 Global CSS Structure (`src/styles/global.css`)

```css
@import "tailwindcss";

/* Fontsource imports */
@import "@fontsource/inter/400.css";
@import "@fontsource/inter/600.css";
@import "@fontsource/inter/700.css";
@import "@fontsource/inter/800.css";
@import "@fontsource/jetbrains-mono/400.css";

/* Tailwind v4 theme customization */
@theme {
  --font-sans: "Inter", sans-serif;
  --font-mono: "JetBrains Mono", monospace;

  --color-bg: #0F172A;
  --color-surface: #1E293B;
  --color-border: #334155;
  --color-text: #F8FAFC;
  --color-text-muted: #94A3B8;
  --color-primary: #10B981;
  --color-primary-dark: #059669;
  --color-secondary: #6366F1;
  --color-accent: #F59E0B;
}

/* Light theme overrides via class on <html> */
.light {
  --color-bg: #FFFFFF;
  --color-surface: #F8FAFC;
  --color-border: #E2E8F0;
  --color-text: #0F172A;
  --color-text-muted: #64748B;
  --color-primary: #059669;
  --color-secondary: #4F46E5;
  --color-accent: #D97706;
}
```

### 4.6 Theme Toggle Mechanism

Dark mode is the default. Theme is toggled via a `.light` class on `<html>`:

1. **BaseLayout.astro** includes an inline `<script is:inline>` in `<head>` (before body renders) that:
   - Reads `localStorage.getItem('theme')`
   - If `'light'`, adds `.light` class to `<html>`
   - This prevents flash of wrong theme (FOUC)

2. **ThemeToggle.astro** component:
   - Toggles `.light` class on `<html>` on click
   - Saves preference to `localStorage`
   - This is an intentional, minimal JS exception (~10 lines inline)

3. **Reduced motion**: If `prefers-reduced-motion: reduce`, disable View Transitions animations

### 4.7 View Transitions

Include `<ClientRouter />` (Astro 6 replacement for deprecated `<ViewTransitions />`) in `BaseLayout.astro` `<head>`:

```astro
---
import { ClientRouter } from 'astro:transitions';
---
<head>
  <ClientRouter />
</head>
```

### 4.8 Analytics (Plausible)

Add in `BaseLayout.astro` before `</head>`:

```html
<script defer data-domain="sekoya.tech" src="https://plausible.io/js/script.js"></script>
```

Plausible is cookieless and GDPR-compliant — no cookie consent banner needed for analytics.

### 4.9 Component Design Principles

- **Mobile-first**: All styles start mobile, scale up with breakpoints
- **Touch targets**: Minimum 44x44px clickable area
- **Focus states**: Visible focus rings for accessibility
- **Dark/Light**: All components must work in both themes
- **View Transitions**: Smooth page transitions via Astro API

---

## 5. Page Specifications

### 5.1 Home Page (`/`)

**Sections (top to bottom):**

1. **Hero**
   - Full-width with gradient background (emerald-to-indigo)
   - Large headline: "We accompany you on your digital journey."
   - Subtitle paragraph
   - Primary CTA button → Contact
   - Secondary CTA → Services
   - Right side: Abstract tech illustration or animated code snippet (CSS only)

2. **Services Preview**
   - Section title: "Our Services"
   - 8 service cards in 4x2 grid (desktop), 2x4 (tablet), 1x8 (mobile)
   - Each card: Icon + Title + Short description + "Learn More" link
   - Cards link to individual service pages

3. **About Preview**
   - Split layout: Text left, visual right
   - Company description paragraph
   - Key stats: Founded 2024, N+ projects, N+ clients
   - CTA: "Learn More About Us" → About page

4. **Testimonials**
   - Horizontal scroll with `scroll-snap-type` (user-initiated, no auto-rotation)
   - Client quote, name, company, avatar
   - 3-5 testimonial cards, swipeable on mobile
   - Respects `prefers-reduced-motion` (disables scroll-snap animation)

5. **Blog Preview**
   - Latest 3 blog posts as cards
   - Card: Featured image, date, title, excerpt
   - "View All Posts" link → Blog

6. **CTA Banner**
   - Full-width emerald gradient
   - "Ready to start your digital journey?"
   - Large Contact button

### 5.2 About Page (`/about`)

- Company story and mission
- Vision and values
- Key statistics
- Timeline/milestones
- Team preview section → links to Team page

### 5.3 Services Index (`/services`)

- 8 service cards in grid
- Each with icon, title, description
- Click → service detail page

### 5.4 Service Detail (`/services/[slug]`)

- Hero with service icon and title
- Detailed description (MDX content)
- Key features/benefits list
- Related services sidebar
- CTA: Contact for this service

### 5.5 Blog Index (`/blog`)

- Blog post cards in grid (show all posts in MVP; pagination in future iteration)
- Featured image, date, title, excerpt, tags
- Pagefind search integration
- Category/tag filtering (future)

### 5.6 Blog Post (`/blog/[slug]`)

- BlogLayout with reading time, date, author
- MDX content with syntax highlighting
- Table of contents (auto-generated)
- Related posts at bottom
- Share links (anchor-tag based: X/Twitter, LinkedIn, email via platform URL schemes)

### 5.7 Portfolio Index (`/portfolio`)

- Project showcase cards
- Featured image, title, tech stack tags, description
- Filter by technology (future)

### 5.8 Portfolio Detail (`/portfolio/[slug]`)

- Project hero image
- Challenge → Solution → Results narrative
- Tech stack badges
- Screenshots gallery
- Client testimonial (if available)

### 5.9 Team Page (`/team`)

- Team member cards in grid
- Photo, name, role, short bio
- Social links (LinkedIn, GitHub)

### 5.10 Careers Page (`/careers`)

- Company culture section
- Open positions list (MDX-managed)
- Benefits list
- Application CTA (link to email or form)

### 5.11 Contact Page (`/contact`)

- Web3Forms contact form (HTML `action` POST to Web3Forms endpoint)
  - Name, email, subject, message fields
  - hCaptcha optional (requires external JS ~50-80KB, loaded only on this page)
  - On submission: redirects to Web3Forms thank-you page (no client JS needed)
  - Alternative: Use `fetch()` for in-page success/error (requires small `<script>` island)
- Contact info sidebar: Phone, email, WhatsApp
- Social media links
- Office location (if applicable)

### 5.12 Privacy Policy (`/privacy-policy`)

- Static MDX content
- Standard privacy policy text

### 5.13 404 Page

- Custom branded 404 with Sekoya branding
- Helpful links: Home, Services, Contact, Blog
- Link back to home (prominent CTA)
- Note: Pagefind search omitted from 404 to keep it lightweight

---

## 6. SEO Strategy

### Per-Page Meta

Every page includes:
- `<title>` with pattern: `{Page Title} | Sekoya`
- `<meta name="description">` unique per page
- `<link rel="canonical">` to self
- Open Graph tags (og:title, og:description, og:image, og:url)
- Twitter Card tags

### Structured Data (JSON-LD)

- **Organization**: Company info on all pages
- **WebSite**: With SearchAction for Pagefind
- **BreadcrumbList**: On all inner pages
- **Service**: On service detail pages
- **BlogPosting**: On blog post pages
- **Person**: On team page

### Technical SEO

- `/sitemap.xml` auto-generated by `@astrojs/sitemap`
- `/robots.txt` allowing all crawlers, referencing sitemap
- Canonical URLs on all pages
- hreflang tags when i18n languages are added
- Image alt text on all images

---

## 7. Performance Strategy

### Targets

| Metric | Target |
|--------|--------|
| Lighthouse Performance | > 95 |
| Lighthouse Accessibility | > 95 |
| Lighthouse Best Practices | > 95 |
| Lighthouse SEO | > 95 |
| LCP | < 2.5s |
| INP | < 100ms |
| CLS | < 0.1 |
| Total JS (first-party) | < 10KB (theme toggle + Pagefind trigger) |
| Total JS (incl. third-party) | < 100KB (Plausible ~1KB, hCaptcha ~50-80KB on contact page only) |

### Techniques

- **Zero JS by default**: Astro ships no JS unless components use `client:*`
- **Pagefind**: Only JS component, loaded with `client:idle`
- **Image optimization**: Astro Image Service → WebP/AVIF, responsive widths
- **Font optimization**: Fontsource self-hosted fonts, preloaded in layout
- **CSS**: Tailwind v4 with tree-shaking, critical CSS inlined
- **View Transitions**: Native browser API, no library

---

## 8. Security

### CSP via `<meta>` Tag (GitHub Pages Limitation)

> **Important:** GitHub Pages does not support custom HTTP response headers. CSP must be delivered via `<meta http-equiv="Content-Security-Policy">` tags in HTML. Headers like `X-Content-Type-Options` and `Referrer-Policy` **cannot be set** on GitHub Pages.

Astro 6's `security.csp` config generates `<meta>` CSP tags in static output mode:

```javascript
// astro.config.mjs
security: {
  csp: {
    directives: [
      "default-src 'self'",
      "script-src 'self' https://plausible.io https://js.hcaptcha.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' https:",
      "font-src 'self'",
      "connect-src 'self' https://api.web3forms.com",
      "frame-src https://*.hcaptcha.com",
    ],
  },
}
```

### Security Measures Available on GitHub Pages

- HTTPS enforced (GitHub Pages default)
- CSP via `<meta>` tag (as above)
- `<meta name="referrer" content="strict-origin-when-cross-origin">` in BaseLayout
- Form CSRF handled by Web3Forms
- No cookies used (Plausible is cookieless)

### Limitations Accepted

- Cannot set `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` as HTTP headers
- If custom HTTP headers become a hard requirement, consider migrating to Cloudflare Pages (supports `_headers` file)

---

## 9. i18n Architecture

### MVP (English Only)

- Default locale: `en`
- All pages at root: `/`, `/about`, `/services`, etc.
- UI strings in `src/i18n/en.json`
- Content in `src/content/*/en/`

### Future Language Addition (e.g., Turkish)

1. Add `tr` to `astro.config.mjs` locales
2. Create `src/i18n/tr.json` with translations
3. Create content in `src/content/*/tr/`
4. Turkish pages auto-generated at `/tr/`, `/tr/about`, etc.
5. hreflang tags auto-generated
6. Language switcher in Header becomes active

### Configuration

```javascript
// astro.config.mjs
i18n: {
  defaultLocale: 'en',
  locales: ['en'],  // Add 'tr', 'de' later
  routing: {
    prefixDefaultLocale: false,  // EN at root, others prefixed
  },
}
```

---

## 10. CI/CD Pipeline

### GitHub Actions Workflow

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: withastro/action@v3
        with:
          node-version: 22
```

### Post-MVP Additions

- Lighthouse CI audit on PRs
- Link checker
- Accessibility audit (axe-core)

---

## 11. Content Schema

> **Note:** Astro 6 uses `content.config.ts` with `defineCollection` and Zod schemas imported from `astro:content`. Image fields use Zod's `image()` helper.

### content.config.ts (Actual Astro 6 API)

```typescript
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: image().optional(),
    tags: z.array(z.string()).optional(),
    author: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const services = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    icon: z.string(),        // Heroicon name
    order: z.number(),
    features: z.array(z.string()).optional(),
  }),
});

const portfolio = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    heroImage: image().optional(),
    techStack: z.array(z.string()),
    client: z.string().optional(),
    year: z.number(),
    url: z.string().url().optional(),
    featured: z.boolean().default(false),
  }),
});

const team = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    name: z.string(),
    role: z.string(),
    bio: z.string(),
    photo: image().optional(),
    linkedin: z.string().url().optional(),
    github: z.string().url().optional(),
    order: z.number(),
  }),
});

const testimonials = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    quote: z.string(),
    author: z.string(),
    company: z.string(),
    avatar: image().optional(),
    order: z.number(),
  }),
});

export const collections = { blog, services, portfolio, team, testimonials };
```

---

## 12. Accessibility Requirements

- WCAG 2.1 AA compliance
- Semantic HTML (header, main, nav, footer, article, section)
- Skip navigation link
- Keyboard navigable (all interactive elements)
- Focus visible indicators
- Color contrast ratios: 4.5:1 normal text, 3:1 large text
- Alt text on all images
- ARIA labels where semantic HTML is insufficient
- Reduced motion support (`prefers-reduced-motion`)

---

## 13. Environment Variables

| Variable | Purpose | Where Used |
|----------|---------|------------|
| `PUBLIC_WEB3FORMS_KEY` | Web3Forms API access key | ContactForm.astro |
| `PUBLIC_SITE_URL` | Site URL for OG tags | BaseLayout.astro, sitemap |

These must be set as GitHub Secrets and injected in the GitHub Actions workflow.

---

## 14. RSS Feed

Include `@astrojs/rss` to generate `/rss.xml` for the blog. This is a lightweight addition that benefits SEO and user engagement.

```typescript
// src/pages/rss.xml.ts
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = (await getCollection('blog')).filter((post) => !post.data.draft);
  return rss({
    title: 'Sekoya Blog',
    description: 'Latest from Sekoya Group',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${post.id}/`,
    })),
  });
}
```

---

## 15. Out of Scope (Future Iterations)

- CMS integration (Sanity/Contentful)
- Live Content Collections (requires SSR)
- E2E testing (Playwright)
- Visual regression testing
- Blog pagination
- Blog categories/tags pages
- Newsletter subscription
- Chat widget
- Multi-language content (TR, DE)
- PWA features
