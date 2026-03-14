# SEO, GEO & LLM/AI Agent Optimization — Implementation Summary

**Date:** 2026-03-15
**Scope:** Traditional Search Engines + AI/LLM Systems + AI Agents + Bots

---

## What Was Done

A comprehensive SEO and AI discoverability layer was implemented for sekoya.tech, covering three pillars:

1. **Traditional SEO** — Search engine crawling, indexing, and structured data
2. **GEO (Generative Engine Optimization)** — Optimizing for AI-generated citations (ChatGPT, Claude, Perplexity, Google AI Overviews)
3. **LLM/AI Agent Accessibility** — Making the site machine-readable for AI systems via llms.txt and rich structured data

---

## Files Created

| File | Location | Lines | Purpose |
|------|----------|------:|---------|
| `robots.txt` | `public/robots.txt` | 82 | Comprehensive bot access rules for 15+ crawlers |
| `llms.txt` | `public/llms.txt` | 42 | AI-readable site index (the "sitemap for LLMs") |
| `llms-full.txt` | `src/pages/llms-full.txt.ts` | — | Auto-generated at build time; full site content as single Markdown |
| `humans.txt` | `public/humans.txt` | 16 | Team and technology information |
| `security.txt` | `public/.well-known/security.txt` | 6 | Security contact per securitytxt.org standard |
| `seo-and-ai-optimization-plan.md` | `docs/` | — | Full strategy document with priorities and next steps |

## Files Modified

| File | Change |
|------|--------|
| `src/lib/seo.ts` | Added `professionalServiceJsonLd()` and `faqPageJsonLd()` functions |
| `src/pages/index.astro` | Added ProfessionalService JSON-LD structured data |
| `src/pages/services/[slug].astro` | Added per-service FAQ content (20+ Q&As) with FAQPage JSON-LD schema and visual accordion UI |

---

## Detailed Breakdown

### 1. robots.txt — AI Bot Access Policy

**Strategy:** Full allow. Sekoya is a B2B service company that benefits from maximum visibility across all search engines and AI systems.

**Bot categories addressed:**

| Category | Bots | Purpose |
|----------|------|---------|
| Traditional Search | Googlebot, Bingbot, YandexBot, Baiduspider, DuckDuckBot | Standard search indexing |
| AI Search & Retrieval | OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot, Google-Extended, Applebot, FacebookBot | Real-time content retrieval for AI-generated answers |
| AI Training | GPTBot, ClaudeBot, anthropic-ai, CCBot, cohere-ai | Model training data ingestion |

**Key decision:** Unlike publishers who block AI training bots to protect content, Sekoya explicitly allows all bots. Being present in AI training data increases the likelihood of AI systems recommending Sekoya when users ask about software development services.

### 2. llms.txt — The AI Sitemap

**Spec:** [llmstxt.org](https://llmstxt.org/)

llms.txt is a Markdown file at the site root that provides structured information specifically for Large Language Models. While robots.txt tells bots where NOT to go, llms.txt tells them where the valuable content IS.

**Structure implemented:**
- H1: Company name and description
- Contact information block
- **Services section**: All 8 services with URLs and descriptions
- **Company section**: About, Team, Portfolio, Careers, Contact pages
- **Blog section**: All published blog posts with URLs
- **Optional section**: Privacy policy, RSS feed, sitemap, link to llms-full.txt

### 3. llms-full.txt — Complete Site Content for AI Ingestion

**Implementation:** Astro API endpoint (`src/pages/llms-full.txt.ts`) that auto-generates at build time.

This file concatenates ALL site content into a single Markdown document so AI systems can ingest the entire site in one request. Sections include:

- Company overview and contact details
- Full service descriptions with features lists
- Portfolio case studies with tech stacks
- Team member bios
- Client testimonials
- Blog post summaries with links

**Output:** 207 lines of structured Markdown at `/llms-full.txt`, regenerated on every build.

### 4. ProfessionalService JSON-LD (Home Page)

Added to the home page, replacing the generic Organization schema with a more specific ProfessionalService type that includes:

- `knowsAbout`: 17 technology/domain keywords (Software Development, Flutter, React, IoT, Machine Learning, AWS, Kubernetes, etc.)
- `hasOfferCatalog`: All 8 services as structured Offer items
- `areaServed`: Worldwide
- `sameAs`: LinkedIn, GitHub, Facebook, Instagram profiles
- `foundingDate`, `email`, `telephone`

**Why ProfessionalService?** It's more specific than Organization for a B2B tech company, and AI systems use it to understand what the company does and recommend it for relevant queries.

### 5. FAQPage JSON-LD + Visual FAQ Sections (Service Pages)

Each of the 8 service detail pages now includes:

- **FAQ content**: 2-3 industry-relevant questions and answers per service
- **FAQPage JSON-LD**: Structured data that search engines and AI systems parse directly
- **Visual accordion**: `<details>/<summary>` elements for user-friendly FAQ browsing

**Total: ~20 FAQ items across 8 services**

Example FAQs for Mobile & Web Development:
- "What technologies do you use for mobile development?"
- "How long does it take to develop a mobile app?"
- "Do you develop for both iOS and Android?"

**Why FAQs matter for GEO:** AI systems heavily favor FAQ content because it's already in Q&A format — exactly how users query ChatGPT/Claude/Perplexity. FAQ schema gives AI systems pre-formatted answers to cite.

### 6. humans.txt and security.txt

Standard web files that signal professionalism:

- **humans.txt**: Team info, technology stack, standards compliance
- **security.txt**: Security contact information per [securitytxt.org](https://securitytxt.org/) standard, placed at `/.well-known/security.txt`

---

## Complete JSON-LD Schema Coverage

| Schema Type | Pages | Purpose |
|------------|-------|---------|
| **ProfessionalService** | Home | Company entity with services catalog and expertise areas |
| **Organization** | All pages | Base company info, social profiles |
| **WebSite** | All pages | Site identity with SearchAction |
| **BreadcrumbList** | All inner pages | Navigation hierarchy |
| **FAQPage** | 8 service pages | Service-specific Q&As for AI citation |
| **Service** | 8 service pages | Individual service descriptions |
| **BlogPosting** | Blog posts | Article metadata, author, dates |
| **Person** | Team page | Team member info |

---

## AI/LLM Discoverability Architecture

```
sekoya.tech/
├── robots.txt          ← Tells ALL bots (15+) they can access everything
├── llms.txt            ← AI-readable site index with curated links
├── llms-full.txt       ← Complete site content in one Markdown file
├── sitemap-index.xml   ← Standard XML sitemap for search engines
├── rss.xml             ← Blog syndication feed
├── humans.txt          ← Human-readable site info
├── .well-known/
│   └── security.txt    ← Security contact
└── [every page]
    ├── <meta> tags      ← Title, description, OG, Twitter Card
    ├── JSON-LD          ← Structured data (Organization, Service, FAQ, etc.)
    └── Semantic HTML    ← Proper headings, landmarks, ARIA labels
```

**How an AI system discovers Sekoya:**

1. **Training phase**: GPTBot/ClaudeBot crawl the site → allowed by robots.txt → content enters training data
2. **Search query**: User asks "best IoT development company" → AI retrieves via OAI-SearchBot/Claude-SearchBot
3. **Content parsing**: AI reads llms.txt for site overview → follows links to relevant service pages
4. **Deep ingestion**: AI reads llms-full.txt for complete context in one request
5. **Structured understanding**: JSON-LD (ProfessionalService, FAQPage) provides machine-readable facts
6. **Citation**: AI cites Sekoya with accurate service descriptions and FAQ answers

---

## Verification

All implementations were verified via production build:

```
Build: 23 pages in 4.34s
Pagefind: 23 pages indexed, 1410 words

Verified outputs:
✓ robots.txt — 82 lines, 15+ bot rules
✓ llms.txt — 42 lines, all services/pages linked
✓ llms-full.txt — 207 lines, auto-generated from content collections
✓ humans.txt — Present in dist/
✓ security.txt — Present in dist/.well-known/
✓ ProfessionalService JSON-LD — 1 instance on home page
✓ FAQPage JSON-LD — Present on service detail pages
✓ sitemap-index.xml — Auto-generated by @astrojs/sitemap
✓ rss.xml — Blog feed with draft filtering
```

---

## Research Sources

| Topic | Source |
|-------|--------|
| llms.txt specification | [llmstxt.org](https://llmstxt.org/) |
| llms.txt implementation guide | [oneline.ch/en/llms-txt-explained](https://oneline.ch/en/llms-txt-explained/) |
| GEO (Generative Engine Optimization) | [Search Engine Land — Mastering GEO 2026](https://searchengineland.com/mastering-generative-engine-optimization-in-2026-full-guide-469142) |
| GEO complete guide | [Frase.io — What is GEO](https://www.frase.io/blog/what-is-generative-engine-optimization-geo) |
| AI crawler management | [Robots.txt Strategy 2026](https://witscode.com/blogs/robots-txt-strategy-2026-managing-ai-crawlers/) |
| Claude bot framework | [Search Engine Journal — Anthropic Claude Bots](https://www.searchenginejournal.com/anthropics-claude-bots-make-robots-txt-decisions-more-granular/568253/) |
| JSON-LD best practices | [SEO Strategy — JSON-LD Guide](https://www.seostrategy.co.uk/schema-structured-data/json-ld-guide/) |
| AI agent optimization | [guillaume.id — Optimize for AI Agents](https://guillaume.id/blog/optimize-your-website-for-ai-agents/) |
| 2026 web design trends | [Figma — Web Design Trends](https://www.figma.com/resource-library/web-design-trends/) |
| Astro 6 features | [astro.build/blog/astro-6](https://astro.build/blog/astro-6/) |
