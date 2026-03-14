# Sekoya.tech Website Redesign - Implementation Plan

## Context

Sekoya Group's current website runs on WordPress + Be Theme. We're rebuilding it from scratch using **Astro 6 + Tailwind CSS v4**, deployed on **GitHub Pages** as a static site. The goal is a modern, mobile-first, dark-themed, high-performance site scoring 95+ Lighthouse across all categories.

**Design Spec:** `docs/superpowers/specs/2026-03-14-sekoya-website-redesign-design.md`

**Key Decisions:**
- Static output only (GitHub Pages) — no SSR, no CMS, no Live Collections
- i18n infrastructure ready, MVP English only
- Dark-first + light toggle, emerald/indigo palette
- CSS-only animations + Astro View Transitions
- Web3Forms (HTML POST) for contact
- Fontsource for self-hosted fonts (Inter, JetBrains Mono)
- ~77 files total across 10 phases

---

## Phase 1: Project Scaffold (S)

**Goal:** Astro 6 project init, all deps installed, dev server running.

**Create:**
- `package.json` — all dependencies from spec section 2 (astro@^6, @tailwindcss/vite, @fontsource/inter, pagefind, etc.)
- `astro.config.mjs` — static output, site URL, Tailwind vite plugin, MDX, sitemap, i18n, CSP
- `tsconfig.json` — extends `astro/tsconfigs/strict`
- `.gitignore` — standard Astro ignores
- `.nvmrc` — pin Node 22
- `src/styles/global.css` — `@import "tailwindcss"`, Fontsource imports, `@theme` block, `.light` overrides
- `src/pages/index.astro` — minimal placeholder

**Verify:** `npm install` succeeds, `npm run dev` starts, page renders dark bg with Inter font, `npx astro check` clean, `npm run build` produces `dist/`.

---

## Phase 2: Static Assets, Utilities, i18n (S)

**Goal:** Public files, shared helpers, i18n string system.

**Create:**
- `public/CNAME` — `sekoya.tech`
- `public/favicon.svg`, `public/robots.txt`, `public/og-default.png`
- `src/assets/logo.svg`
- `src/lib/constants.ts` — site name, URL, social links, nav items, Web3Forms key
- `src/lib/seo.ts` — meta tag generators, JSON-LD helpers (Organization, Breadcrumb, BlogPosting, Person)
- `src/lib/utils.ts` — formatDate(), calculateReadingTime(), slugify()
- `src/i18n/en.json` — all UI strings
- `src/i18n/ui.ts` — type definitions
- `src/i18n/utils.ts` — useTranslations() helper

**Verify:** TypeScript checks pass, constants importable, i18n returns English strings, static files in `dist/`.

---

## Phase 3: Layouts (M)

**Goal:** BaseLayout, PageLayout, BlogLayout — the HTML shells every page uses.

**Create:**
- `src/layouts/BaseLayout.astro` — doctype, head (meta, fonts, CSP meta tag, ClientRouter, inline theme script for FOUC prevention, Plausible, referrer meta), body (skip-nav, Header slot, main, Footer slot), reduced-motion CSS
- `src/layouts/PageLayout.astro` — wraps BaseLayout + page hero/title + breadcrumb JSON-LD
- `src/layouts/BlogLayout.astro` — wraps BaseLayout + article wrapper, reading time, date, ToC, share links, related posts, BlogPosting JSON-LD
- Stub `src/components/layout/Header.astro` and `Footer.astro` (minimal, replaced in Phase 4)

**Verify:** Placeholder index uses BaseLayout, dark bg renders, Plausible script in head, ClientRouter present, theme script before body.

---

## Phase 4: UI + Layout Components (M)

**Goal:** All reusable UI primitives and Header/Footer/MobileMenu.

**Create:**
- `src/components/ui/Button.astro` — variants (primary/secondary/outline/ghost), sizes (sm/md/lg), renders as `<a>` or `<button>`, 44px min touch target
- `src/components/ui/Card.astro` — surface bg, border, rounded, hover effect
- `src/components/ui/Section.astro` — max-w-7xl, centered, py-16 md:py-24
- `src/components/ui/Badge.astro` — pill badge for tags
- `src/components/ui/ThemeToggle.astro` — sun/moon toggle, inline script for localStorage
- `src/components/layout/Header.astro` — sticky, glassmorphism bg, logo, nav, theme toggle, hamburger
- `src/components/layout/Footer.astro` — 4-col grid, company info, links, social, copyright
- `src/components/layout/MobileMenu.astro` — CSS checkbox hack for zero-JS, full-screen overlay

**Verify:** Theme toggle works + persists, Header responsive (hamburger on mobile), all button variants render, keyboard navigation through Header links, focus rings visible.

---

## Phase 5: Content Schemas + Seed Data (M)

**Goal:** Define 5 content collections, create 2-3 seed entries each.

**Create:**
- `content.config.ts` — defineCollection for blog, services, portfolio, team, testimonials (exact Zod schemas from spec section 11)
- `src/content/services/en/` — 8 service MDX files (mobile-web, custom-app, consultancy, pm, iot, ml, ai, devops)
- `src/content/blog/en/` — 3 seed posts (welcome, modern-web-dev, why-astro)
- `src/content/portfolio/en/` — 2 seed projects
- `src/content/team/en/` — 2 seed members
- `src/content/testimonials/en/` — 3 seed testimonials

**Verify:** `npm run build` parses all collections, `getCollection('services')` returns 8 entries, draft filtering works.

---

## Phase 6: Domain Components (M)

**Goal:** All page-specific components — home sections, cards, forms.

**Create:**
- `src/components/home/Hero.astro` — gradient bg, headline, 2 CTAs, decorative element
- `src/components/home/ServicesPreview.astro` — 8-card grid from collection
- `src/components/home/AboutPreview.astro` — split layout, stats
- `src/components/home/TestimonialsSlider.astro` — scroll-snap horizontal slider (no auto-rotate)
- `src/components/home/BlogPreview.astro` — latest 3 posts
- `src/components/home/CTA.astro` — gradient banner
- `src/components/services/ServiceCard.astro` — icon + title + description + link
- `src/components/blog/BlogCard.astro` — image + date + title + excerpt + tags
- `src/components/blog/BlogList.astro` — grid of BlogCards
- `src/components/portfolio/ProjectCard.astro` — image + title + tech stack
- `src/components/team/TeamMember.astro` — photo + name + role + social
- `src/components/contact/ContactForm.astro` — Web3Forms HTML POST, fields, honeypot

**Verify:** Each component renders in isolation, ServicesPreview shows 8 cards, testimonials scroll-snap works, contact form action points to Web3Forms.

---

## Phase 7: All Pages (L) ← Largest phase

**Goal:** Build all 13+ page files.

**Create:**
- `src/pages/index.astro` — Home (Hero + ServicesPreview + AboutPreview + Testimonials + BlogPreview + CTA)
- `src/pages/about.astro` — Story, vision, stats, timeline, team preview
- `src/pages/services/index.astro` — Full grid of 8 services
- `src/pages/services/[slug].astro` — Dynamic service detail with MDX content, features, related services
- `src/pages/blog/index.astro` — All posts (no pagination MVP), Pagefind search placeholder
- `src/pages/blog/[slug].astro` — BlogLayout, MDX render, ToC, share links, related posts
- `src/pages/portfolio/index.astro` — Project showcase grid
- `src/pages/portfolio/[slug].astro` — Project detail, tech badges, narrative
- `src/pages/team.astro` — Team member cards, Person JSON-LD
- `src/pages/careers.astro` — Culture, benefits, open positions, application CTA
- `src/pages/contact.astro` — ContactForm + sidebar info
- `src/pages/privacy-policy.astro` — Static prose
- `src/pages/404.astro` — Branded 404, helpful links (no Pagefind)
- `src/pages/rss.xml.ts` — RSS feed from blog collection (filtered !draft)

**Verify:** `npm run build` generates all expected HTML files in `dist/`, every page accessible in dev, dynamic routes resolve, responsive at 375/768/1280px.

---

## Phase 8: Pagefind Search (S)

**Goal:** Static search on blog index.

**Create/Modify:**
- `src/components/search/Search.astro` — Pagefind UI component
- Modify `src/pages/blog/index.astro` — add Search component
- Modify `package.json` — add `"postbuild": "npx pagefind --site dist"`
- Add `data-pagefind-body` to main content areas, `data-pagefind-ignore` to nav/footer

**Verify:** Build creates `dist/pagefind/`, search works in preview, results link to correct posts, dark theme compatible.

---

## Phase 9: CI/CD (S)

**Goal:** GitHub Actions auto-deploy.

**Create:**
- `.github/workflows/deploy.yml` — push to main triggers build+deploy via `withastro/action@v3` with Node 22

**Verify:** Push triggers workflow, build succeeds, GitHub Pages deployment works, site accessible at URL.

---

## Phase 10: Polish + Final Verification (M)

**Goal:** Accessibility, performance, SEO, visual polish.

**Tasks:**
1. **Accessibility:** Skip-nav works, all images have alt, form labels present, color contrast ≥4.5:1 both themes, keyboard navigation complete, focus indicators visible, aria-current on active nav, prefers-reduced-motion respected
2. **Performance:** All images use Astro `<Image>`, no external font requests, near-zero first-party JS, font preloads present, lazy loading on below-fold images
3. **SEO:** Unique title/description on every page, OG tags present, canonical URLs correct, sitemap includes all pages, robots.txt references sitemap, JSON-LD valid
4. **Visual:** Consistent spacing, smooth View Transitions, theme toggle transition, hover states on all interactive elements
5. **Content:** No placeholder/lorem ipsum text remaining, all links work, contact form submits

**Verify:**
- `npm run build` — zero warnings
- `npx astro check` — zero errors
- Lighthouse: Performance ≥95, Accessibility ≥95, Best Practices ≥95, SEO ≥95
- All nav links work, contact form submits to Web3Forms
- Theme persists across navigation and refresh
- RSS feed valid, sitemap valid

---

## Phase Dependency Graph

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7 → Phase 8 → Phase 9 → Phase 10
```

| Phase | Description | Complexity | ~Files |
|-------|-------------|:----------:|:------:|
| 1 | Scaffold | S | 7 |
| 2 | Assets + Utils + i18n | S | 11 |
| 3 | Layouts | M | 5 |
| 4 | UI + Layout Components | M | 8 |
| 5 | Content Schemas + Seed | M | ~20 |
| 6 | Domain Components | M | 12 |
| 7 | All Pages | L | 14 |
| 8 | Pagefind | S | 1+mods |
| 9 | CI/CD | S | 1 |
| 10 | Polish | M | mods only |

**Total: ~77 files**

---

## Risk Areas

1. **Astro 6 API**: `ClientRouter` vs `ViewTransitions` — verify at implementation time
2. **Tailwind v4 `@theme`**: Verify syntax against installed version
3. **CSP `security.csp`**: May be experimental still — fallback to manual `<meta>` tag
4. **MobileMenu zero-JS**: CSS checkbox hack may need a11y fix (small inline script for aria-expanded)
5. **Pagefind version**: Verify `PagefindUI` constructor against installed version

---

## Requirements.txt Updates

The `requirements.txt` file should be updated to reflect these corrections:
- `@astrojs/tailwind` → `@tailwindcss/vite` (deprecated)
- Live Content Collections → Build-time Content Collections (GitHub Pages = static)
- `@astrojs/vercel` / `@astrojs/node` → removed (static output)
- Astro Fonts API → Fontsource packages
- Add i18n section
- Add light theme colors
- Update CSP to note GitHub Pages meta-tag limitation
- Add RSS feed
- Add `src/lib/` utilities
