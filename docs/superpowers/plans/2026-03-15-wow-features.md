# Wow Effect Features Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 5 cinematic wow-effect features to sekoya.tech — scroll reveals, page morph transitions, animated hero, particle network, and custom cursor.

**Architecture:** Astro 6 static site with Tailwind v4. All animations are client-side via `<script>` tags bundled by Vite. GSAP handles scroll-triggered and timeline animations. Canvas 2D powers hero visuals. Custom cursor is vanilla JS. View Transitions use Astro's built-in API. All scripts follow init/cleanup lifecycle for View Transitions compatibility.

**Tech Stack:** Astro 6, Tailwind v4, GSAP (with ScrollTrigger), splitting, Canvas 2D, Astro View Transitions API

**Spec:** `docs/superpowers/specs/2026-03-15-wow-features-design.md`

---

## File Map

**New files to create:**
| File | Responsibility |
|---|---|
| `src/scripts/scroll-reveal.ts` | GSAP ScrollTrigger reveal system + animated counters + Astro lifecycle |
| `src/scripts/hero-animation.ts` | GSAP timeline for hero entrance (text split, element reveals) |
| `src/scripts/hero-canvas.ts` | Combined Canvas 2D renderer (mesh gradient + particle network) |
| `src/scripts/custom-cursor.ts` | Custom cursor + magnetic button effects (desktop only) |
| `src/types/splitting.d.ts` | TypeScript type declaration for `splitting` library |

**Files to modify:**
| File | Changes |
|---|---|
| `package.json` | Add `gsap`, `splitting` dependencies |
| `src/styles/global.css` | Add `.reveal-hidden`, `.hero-hidden`, view-transition CSS, cursor styles |
| `src/components/ui/Section.astro` | No changes needed (data attrs added by page files) |
| `src/components/home/Hero.astro` | Add canvas element, `data-animate-*` attrs, import hero scripts |
| `src/components/home/AboutPreview.astro` | Add `data-counter` + `data-reveal-stagger` |
| `src/components/home/ServicesPreview.astro` | Add `data-reveal-stagger` to grid |
| `src/components/home/BlogPreview.astro` | Add `data-reveal-stagger` to grid |
| `src/components/home/TestimonialsSlider.astro` | Add `data-reveal` |
| `src/components/home/CTA.astro` | Add `data-reveal` |
| `src/components/services/ServiceCard.astro` | Add `slug` prop + `transition:name` |
| `src/components/blog/BlogCard.astro` | Add `slug` prop + `transition:name` |
| `src/components/portfolio/ProjectCard.astro` | Add `slug` prop + `transition:name` |
| `src/pages/index.astro` | Pass slug props to service cards |
| `src/pages/services/index.astro` | Pass `slug` prop |
| `src/pages/services/[slug].astro` | Add `transition:name` to hero title |
| `src/pages/blog/[slug].astro` | Add `transition:name` to blog title |
| `src/pages/portfolio/index.astro` | Pass `slug` prop |
| `src/pages/portfolio/[slug].astro` | Add `transition:name` to hero title |
| `src/pages/about.astro` | Add `data-reveal`, `data-counter` |
| `src/pages/team.astro` | Add `data-reveal` to team members |
| `src/layouts/BaseLayout.astro` | Add cursor DOM elements |
| `src/layouts/PageLayout.astro` | Add `transition:name` to hero title |
| `src/layouts/BlogLayout.astro` | Add `transition:name` to article title |
| `src/components/ui/Button.astro` | Add `data-magnetic` for primary lg variant |
| `src/components/home/ServicesPreview.astro` | Pass slug prop |
| `src/components/home/BlogPreview.astro` | Pass slug prop |

---

## Chunk 1: Scroll Reveal System (Feature 2)

### Task 1: Install GSAP dependency

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install GSAP**

```bash
cd /home/cevheri/projects/dart/sekoya/sekoyatech.github.io
npm install gsap
```

- [ ] **Step 2: Verify install**

```bash
npm ls gsap
```

Expected: `gsap@3.x.x` listed

- [ ] **Step 3: Verify build still passes**

```bash
npm run build
```

Expected: Build succeeds with no errors

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add gsap dependency for scroll animations"
```

---

### Task 2: Create scroll-reveal.ts — core animation infrastructure

**Files:**
- Create: `src/scripts/scroll-reveal.ts`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Add `.reveal-hidden` CSS class to global.css**

Add after the existing `::selection` block (around line 101), before `/* Skip navigation */`:

```css
/* Animation initial states */
.reveal-hidden {
  opacity: 0;
  transform: translateY(20px);
}
```

- [ ] **Step 2: Create `src/scripts/scroll-reveal.ts`**

```typescript
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function initScrollReveal(): void {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    // Remove hidden classes so content is visible
    document.querySelectorAll('.reveal-hidden').forEach((el) => {
      el.classList.remove('reveal-hidden');
    });
    return;
  }

  ScrollTrigger.defaults({
    start: 'top 85%',
    toggleActions: 'play none none none',
  });

  // Single element reveals: [data-reveal]
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    const direction = el.dataset.reveal || 'up';
    const from: gsap.TweenVars = { opacity: 0, duration: 0.8, ease: 'power2.out' };

    switch (direction) {
      case 'left':
        from.x = -40;
        break;
      case 'right':
        from.x = 40;
        break;
      case 'scale':
        from.scale = 0.9;
        break;
      case 'up':
      default:
        from.y = 30;
        break;
    }

    gsap.from(el, {
      ...from,
      scrollTrigger: { trigger: el },
    });
  });

  // Staggered children reveals: [data-reveal-stagger]
  document.querySelectorAll<HTMLElement>('[data-reveal-stagger]').forEach((container) => {
    const children = container.children;
    if (children.length === 0) return;

    gsap.from(children, {
      opacity: 0,
      y: 30,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out',
      scrollTrigger: { trigger: container },
    });
  });

  // Animated counters: [data-counter]
  document.querySelectorAll<HTMLElement>('[data-counter]').forEach((el) => {
    const raw = el.dataset.counter || '0';
    const match = raw.match(/^(\d+)(.*)$/);
    if (!match) return;

    const target = parseInt(match[1], 10);
    const suffix = match[2]; // e.g. "+", "%", ""
    const obj = { value: 0 };

    gsap.to(obj, {
      value: target,
      duration: 1.5,
      ease: 'power2.out',
      snap: { value: 1 },
      scrollTrigger: { trigger: el },
      onUpdate() {
        el.textContent = Math.round(obj.value) + suffix;
      },
    });
  });
}

function cleanupScrollReveal(): void {
  ScrollTrigger.getAll().forEach((t) => t.kill());
}

// Initialize
document.addEventListener('DOMContentLoaded', initScrollReveal);

// Astro View Transitions lifecycle
document.addEventListener('astro:before-swap', cleanupScrollReveal);
document.addEventListener('astro:after-swap', initScrollReveal);
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: Build succeeds (script is created but not yet imported by any page)

- [ ] **Step 4: Commit**

```bash
git add src/scripts/scroll-reveal.ts src/styles/global.css
git commit -m "feat: create scroll-reveal system with GSAP ScrollTrigger"
```

---

### Task 3: Add data attributes to home page components

**Files:**
- Modify: `src/components/home/ServicesPreview.astro:16` — add `data-reveal-stagger` to grid div
- Modify: `src/components/home/ServicesPreview.astro:12-15` — add `data-reveal` to header block
- Modify: `src/components/home/AboutPreview.astro:20-28` — add `data-reveal` to text, `data-reveal-stagger` to stats, `data-counter` to values
- Modify: `src/components/home/BlogPreview.astro:17-19` — add `data-reveal` to header, `data-reveal-stagger` to grid
- Modify: `src/components/home/TestimonialsSlider.astro:10-13` — add `data-reveal` to header
- Modify: `src/components/home/CTA.astro:10-11` — add `data-reveal` to text block

- [ ] **Step 1: Modify ServicesPreview.astro**

In `src/components/home/ServicesPreview.astro`:

Change line 12:
```astro
  <div class="text-center mb-12 md:mb-16">
```
to:
```astro
  <div class="text-center mb-12 md:mb-16" data-reveal>
```

Change line 16:
```astro
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
```
to:
```astro
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" data-reveal-stagger>
```

- [ ] **Step 2: Modify AboutPreview.astro**

In `src/components/home/AboutPreview.astro`:

Change line 20 (the text content div):
```astro
    <div>
```
to:
```astro
    <div data-reveal="left">
```

Change line 31 (the stats grid):
```astro
    <div class="grid grid-cols-2 gap-6">
```
to:
```astro
    <div class="grid grid-cols-2 gap-6" data-reveal-stagger>
```

Change line 34 (the stat value div) — replace the static text with `data-counter`:
```astro
          <div class="text-3xl md:text-4xl font-extrabold text-primary mb-2">{stat.value}</div>
```
to:
```astro
          <div class="text-3xl md:text-4xl font-extrabold text-primary mb-2" data-counter={stat.value}>{stat.value}</div>
```

- [ ] **Step 3: Modify BlogPreview.astro**

In `src/components/home/BlogPreview.astro`:

Change line 17:
```astro
  <div class="text-center mb-12">
```
to:
```astro
  <div class="text-center mb-12" data-reveal>
```

Change line 20:
```astro
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
```
to:
```astro
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10" data-reveal-stagger>
```

- [ ] **Step 4: Modify TestimonialsSlider.astro**

In `src/components/home/TestimonialsSlider.astro`:

Change line 11:
```astro
  <div class="text-center mb-12">
```
to:
```astro
  <div class="text-center mb-12" data-reveal>
```

- [ ] **Step 5: Modify CTA.astro**

In `src/components/home/CTA.astro`:

Change line 10:
```astro
  <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
```
to:
```astro
  <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center" data-reveal="scale">
```

- [ ] **Step 6: Import scroll-reveal script in BaseLayout**

In `src/layouts/BaseLayout.astro`, add after line 9 (the `import '../styles/global.css';` line):

```astro
import '../scripts/scroll-reveal';
```

- [ ] **Step 7: Build and verify**

```bash
npm run build && npm run check
```

Expected: Both pass. Scroll reveal script is now loaded on every page.

- [ ] **Step 8: Commit**

```bash
git add src/components/home/ServicesPreview.astro src/components/home/AboutPreview.astro src/components/home/BlogPreview.astro src/components/home/TestimonialsSlider.astro src/components/home/CTA.astro src/layouts/BaseLayout.astro
git commit -m "feat: add scroll reveal data attributes to home page components"
```

---

### Task 4: Add data attributes to inner pages

**Files:**
- Modify: `src/pages/about.astro` — Add `data-reveal` to sections, `data-counter` to stats
- Modify: `src/pages/services/index.astro` — Add `data-reveal-stagger` to grid
- Modify: `src/pages/portfolio/index.astro` — Add `data-reveal-stagger` to grid
- Modify: `src/pages/team.astro` — Add `data-reveal-stagger` to team list

- [ ] **Step 1: Modify about.astro**

In `src/pages/about.astro`:

Line 48, the "Our Story" section wrapper:
```astro
  <section class="mb-16 md:mb-24">
```
to:
```astro
  <section class="mb-16 md:mb-24" data-reveal>
```

Line 61, the mission/vision grid:
```astro
    <div class="grid md:grid-cols-2 gap-8">
```
to:
```astro
    <div class="grid md:grid-cols-2 gap-8" data-reveal-stagger>
```

Line 91, the stats grid:
```astro
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
```
to:
```astro
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6" data-reveal-stagger>
```

Line 94, the stat value:
```astro
          <div class="text-3xl md:text-4xl font-extrabold text-primary mb-2">{stat.value}</div>
```
to:
```astro
          <div class="text-3xl md:text-4xl font-extrabold text-primary mb-2" data-counter={stat.value}>{stat.value}</div>
```

Line 108, the timeline items container:
```astro
      <div class="space-y-12">
```
to:
```astro
      <div class="space-y-12" data-reveal-stagger>
```

Line 127, the team preview section:
```astro
  <section class="text-center">
```
to:
```astro
  <section class="text-center" data-reveal>
```

- [ ] **Step 2: Modify services/index.astro**

In `src/pages/services/index.astro`:

Line 21:
```astro
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
```
to:
```astro
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-reveal-stagger>
```

- [ ] **Step 3: Modify portfolio/index.astro**

In `src/pages/portfolio/index.astro`:

Line 21:
```astro
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
```
to:
```astro
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6" data-reveal-stagger>
```

- [ ] **Step 4: Modify team.astro**

In `src/pages/team.astro`:

Line 58:
```astro
    <div class="flex flex-col gap-8 md:gap-12">
```
to:
```astro
    <div class="flex flex-col gap-8 md:gap-12" data-reveal-stagger>
```

- [ ] **Step 5: Build and verify**

```bash
npm run build && npm run check
```

Expected: Both pass.

- [ ] **Step 6: Commit**

```bash
git add src/pages/about.astro src/pages/services/index.astro src/pages/portfolio/index.astro src/pages/team.astro
git commit -m "feat: add scroll reveal data attributes to inner pages"
```

---

## Chunk 2: Page Morph Transitions (Feature 5)

### Task 5: Add slug prop and transition:name to card components

**Files:**
- Modify: `src/components/services/ServiceCard.astro` — Add `slug` prop, `transition:name`
- Modify: `src/components/blog/BlogCard.astro` — Add `slug` prop, `transition:name`
- Modify: `src/components/portfolio/ProjectCard.astro` — Add `slug` prop, `transition:name`

- [ ] **Step 1: Modify ServiceCard.astro**

In `src/components/services/ServiceCard.astro`:

Change the interface (lines 7-11):
```astro
interface Props {
  title: string;
  description: string;
  icon: string;
  href: string;
}
```
to:
```astro
interface Props {
  title: string;
  description: string;
  icon: string;
  href: string;
  slug?: string;
}
```

Change the destructuring (line 13):
```astro
const { title, description, icon, href } = Astro.props;
```
to:
```astro
const { title, description, icon, href, slug } = Astro.props;
```

Change the anchor tag (line 17):
```astro
<a href={href} class="group block">
```
to:
```astro
<a href={href} class="group block" transition:name={slug ? `service-${slug}` : undefined}>
```

Change the h3 tag (line 23):
```astro
      <h3 class="text-lg font-semibold text-text mb-2 group-hover:text-primary transition-colors">{title}</h3>
```
to:
```astro
      <h3 class="text-lg font-semibold text-text mb-2 group-hover:text-primary transition-colors" transition:name={slug ? `service-title-${slug}` : undefined}>{title}</h3>
```

- [ ] **Step 2: Modify BlogCard.astro**

In `src/components/blog/BlogCard.astro`:

Change the interface (lines 7-13):
```astro
interface Props {
  title: string;
  description: string;
  pubDate: Date;
  tags?: string[];
  href: string;
  readingTime?: number;
}
```
to:
```astro
interface Props {
  title: string;
  description: string;
  pubDate: Date;
  tags?: string[];
  href: string;
  readingTime?: number;
  slug?: string;
}
```

Change the destructuring (line 16):
```astro
const { title, description, pubDate, tags = [], href, readingTime } = Astro.props;
```
to:
```astro
const { title, description, pubDate, tags = [], href, readingTime, slug } = Astro.props;
```

Change the anchor tag (line 20):
```astro
<a href={href} class="group block">
```
to:
```astro
<a href={href} class="group block" transition:name={slug ? `blog-${slug}` : undefined}>
```

Change the h3 tag (line 32):
```astro
      <h3 class="text-lg font-semibold text-text mb-2 group-hover:text-primary transition-colors line-clamp-2">
```
to:
```astro
      <h3 class="text-lg font-semibold text-text mb-2 group-hover:text-primary transition-colors line-clamp-2" transition:name={slug ? `blog-title-${slug}` : undefined}>
```

- [ ] **Step 3: Modify ProjectCard.astro**

In `src/components/portfolio/ProjectCard.astro`:

Change the interface (lines 6-12):
```astro
interface Props {
  title: string;
  description: string;
  techStack: string[];
  year: number;
  href: string;
  featured?: boolean;
}
```
to:
```astro
interface Props {
  title: string;
  description: string;
  techStack: string[];
  year: number;
  href: string;
  featured?: boolean;
  slug?: string;
}
```

Change the destructuring (line 15):
```astro
const { title, description, techStack, year, href, featured = false } = Astro.props;
```
to:
```astro
const { title, description, techStack, year, href, featured = false, slug } = Astro.props;
```

Change the anchor tag (line 19):
```astro
<a href={href} class="group block">
```
to:
```astro
<a href={href} class="group block" transition:name={slug ? `project-${slug}` : undefined}>
```

Change the h3 tag (line 26):
```astro
        <h3 class="text-lg font-semibold text-text group-hover:text-primary transition-colors">{title}</h3>
```
to:
```astro
        <h3 class="text-lg font-semibold text-text group-hover:text-primary transition-colors" transition:name={slug ? `project-title-${slug}` : undefined}>{title}</h3>
```

- [ ] **Step 4: Build and verify**

```bash
npm run build && npm run check
```

Expected: Both pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/services/ServiceCard.astro src/components/blog/BlogCard.astro src/components/portfolio/ProjectCard.astro
git commit -m "feat: add slug prop and transition:name to card components"
```

---

### Task 6: Pass slug prop from parent pages + add transition:name to detail pages

**Files:**
- Modify: `src/components/home/ServicesPreview.astro:17-23` — Pass `slug={service.id}`
- Modify: `src/components/home/BlogPreview.astro:21-28` — Pass `slug={post.id}`
- Modify: `src/pages/services/index.astro:22-28` — Pass `slug={service.id}`
- Modify: `src/pages/portfolio/index.astro:22-30` — Pass `slug={project.slug}`
- Modify: `src/pages/services/[slug].astro:69` — Add `transition:name` to h1
- Modify: `src/pages/portfolio/[slug].astro:29` — Add `transition:name` to heroTitle
- Modify: `src/layouts/PageLayout.astro:51` — Add `transition:name` to h1
- Modify: `src/layouts/BlogLayout.astro:92` — Add `transition:name` to h1
- Modify: `src/pages/blog/[slug].astro:19-27` — Pass slug to BlogLayout
- Modify: `src/styles/global.css` — Add view-transition CSS

- [ ] **Step 1: Pass slug from home ServicesPreview**

In `src/components/home/ServicesPreview.astro`, change line 18-23 (the ServiceCard rendering):
```astro
      <ServiceCard
        title={service.data.title}
        description={service.data.description}
        icon={service.data.icon}
        href={`/services/${service.id}/`}
      />
```
to:
```astro
      <ServiceCard
        title={service.data.title}
        description={service.data.description}
        icon={service.data.icon}
        href={`/services/${service.id}/`}
        slug={service.id}
      />
```

- [ ] **Step 2: Pass slug from home BlogPreview**

In `src/components/home/BlogPreview.astro`, change lines 21-28 (the BlogCard rendering):
```astro
      <BlogCard
        title={post.data.title}
        description={post.data.description}
        pubDate={post.data.pubDate}
        tags={post.data.tags}
        href={`/blog/${post.id}/`}
      />
```
to:
```astro
      <BlogCard
        title={post.data.title}
        description={post.data.description}
        pubDate={post.data.pubDate}
        tags={post.data.tags}
        href={`/blog/${post.id}/`}
        slug={post.id}
      />
```

- [ ] **Step 3: Pass slug from services/index.astro**

In `src/pages/services/index.astro`, change lines 22-28:
```astro
      <ServiceCard
        title={service.data.title}
        description={service.data.description}
        icon={service.data.icon}
        href={`/services/${service.id}/`}
      />
```
to:
```astro
      <ServiceCard
        title={service.data.title}
        description={service.data.description}
        icon={service.data.icon}
        href={`/services/${service.id}/`}
        slug={service.id}
      />
```

- [ ] **Step 4: Pass slug from portfolio/index.astro**

In `src/pages/portfolio/index.astro`, change lines 22-29:
```astro
      <ProjectCard
        title={project.title}
        description={project.description}
        techStack={project.techStack}
        year={project.year}
        href={`/portfolio/${project.slug}/`}
        featured={project.featured}
      />
```
to:
```astro
      <ProjectCard
        title={project.title}
        description={project.description}
        techStack={project.techStack}
        year={project.year}
        href={`/portfolio/${project.slug}/`}
        featured={project.featured}
        slug={project.slug}
      />
```

- [ ] **Step 5: Add transitionName prop to PageLayout**

In `src/layouts/PageLayout.astro`, add `heroTransitionName` to the Props interface:

Change the interface (lines 5-13):
```astro
interface Props {
  title: string;
  description: string;
  heroTitle?: string;
  heroDescription?: string;
  image?: string;
  canonicalURL?: string;
  breadcrumbs?: { name: string; href: string }[];
}
```
to:
```astro
interface Props {
  title: string;
  description: string;
  heroTitle?: string;
  heroDescription?: string;
  heroTransitionName?: string;
  image?: string;
  canonicalURL?: string;
  breadcrumbs?: { name: string; href: string }[];
}
```

Add destructuring for `heroTransitionName` (around line 24):
```astro
const {
  title,
  description,
  heroTitle,
  heroDescription,
  heroTransitionName,
  image,
  canonicalURL,
  breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: title, href: Astro.url.pathname },
  ],
} = Astro.props;
```

Change line 51 (the h1):
```astro
        <h1 class="text-3xl md:text-5xl font-extrabold text-text mb-4">{heroTitle}</h1>
```
to:
```astro
        <h1 class="text-3xl md:text-5xl font-extrabold text-text mb-4" transition:name={heroTransitionName || undefined}>{heroTitle}</h1>
```

- [ ] **Step 5b: Pass matching transition names from detail pages**

In `src/pages/services/[slug].astro`, add `heroTransitionName` to the PageLayout call (line 65):
```astro
<PageLayout
  title={entry.data.title}
  description={entry.data.description}
  heroTitle={entry.data.title}
  heroDescription={entry.data.description}
  heroTransitionName={`service-title-${entry.id}`}
  breadcrumbs={[...]}
>
```

In `src/pages/portfolio/[slug].astro`, add `heroTransitionName` to the PageLayout call (line 26):
```astro
<PageLayout
  title={project.title}
  description={project.description}
  heroTitle={project.title}
  heroDescription={project.description}
  heroTransitionName={`project-title-${project.slug}`}
  breadcrumbs={breadcrumbs}
>
```

This ensures card `transition:name` values (`service-title-${slug}`, `project-title-${slug}`) match their detail page h1 transition names exactly.

- [ ] **Step 6: Add slug prop and transition:name to BlogLayout**

In `src/layouts/BlogLayout.astro`, add `slug` to the Props interface (line 7-16):
```astro
interface Props {
  title: string;
  description: string;
  pubDate: Date;
  updatedDate?: Date;
  author?: string;
  heroImage?: string;
  tags?: string[];
  readingTime: number;
  slug?: string;
}
```

Add to destructuring (line 18-27):
```astro
const {
  title,
  description,
  pubDate,
  updatedDate,
  author = 'Sekoya Team',
  heroImage,
  tags = [],
  readingTime,
  slug,
} = Astro.props;
```

Change line 92:
```astro
      <h1 class="text-3xl md:text-5xl font-extrabold text-text mb-6">{title}</h1>
```
to:
```astro
      <h1 class="text-3xl md:text-5xl font-extrabold text-text mb-6" transition:name={slug ? `blog-title-${slug}` : undefined}>{title}</h1>
```

- [ ] **Step 6b: Pass slug from blog/[slug].astro to BlogLayout**

In `src/pages/blog/[slug].astro`, add `slug` to the BlogLayout call (line 19-28):
```astro
<BlogLayout
  title={post.data.title}
  description={post.data.description}
  pubDate={post.data.pubDate}
  updatedDate={post.data.updatedDate}
  author={post.data.author}
  heroImage={post.data.heroImage}
  tags={post.data.tags}
  readingTime={readingTime}
  slug={post.id}
>
```

- [ ] **Step 7: Add view-transition CSS to global.css**

Add at the end of `src/styles/global.css`, after the `.mdx-content img` rule:

```css
/* View Transition animations */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

::view-transition-old(root) {
  animation: fade-out 0.25s ease-in;
}

::view-transition-new(root) {
  animation: fade-in 0.25s ease-out;
}
```

- [ ] **Step 8: Build and verify**

```bash
npm run build && npm run check
```

Expected: Both pass.

- [ ] **Step 9: Commit**

```bash
git add src/components/home/ServicesPreview.astro src/components/home/BlogPreview.astro src/pages/services/index.astro src/pages/portfolio/index.astro src/pages/services/\[slug\].astro src/pages/portfolio/\[slug\].astro src/pages/blog/\[slug\].astro src/layouts/PageLayout.astro src/layouts/BlogLayout.astro src/styles/global.css
git commit -m "feat: add page morph transitions with view-transition:name"
```

---

## Chunk 3: Cinematic Hero (Feature 1)

### Task 7: Install splitting library and create hero-animation.ts

**Files:**
- Modify: `package.json` (via npm install)
- Create: `src/scripts/hero-animation.ts`
- Modify: `src/styles/global.css` — Add `.hero-hidden`

- [ ] **Step 1: Install splitting**

```bash
cd /home/cevheri/projects/dart/sekoya/sekoyatech.github.io
npm install splitting
```

- [ ] **Step 2: Add `.hero-hidden` CSS to global.css**

Add right after the `.reveal-hidden` block in `src/styles/global.css`:

```css
.hero-hidden {
  opacity: 0;
}
```

- [ ] **Step 3: Create TypeScript declaration for splitting**

Create `src/types/splitting.d.ts`:

```typescript
declare module 'splitting' {
  interface SplittingResult {
    el: HTMLElement;
    words?: HTMLElement[];
    chars?: HTMLElement[];
  }
  interface SplittingOptions {
    target?: HTMLElement | string;
    by?: 'words' | 'chars' | 'lines' | 'items' | 'rows' | 'cols' | 'grid' | 'cells' | 'cellRows' | 'cellColumns';
    key?: string;
  }
  function Splitting(options?: SplittingOptions): SplittingResult[];
  export default Splitting;
}

declare module 'splitting/dist/splitting.css' {
  const content: string;
  export default content;
}

declare module 'splitting/dist/splitting-cells.css' {
  const content: string;
  export default content;
}
```

- [ ] **Step 4: Create `src/scripts/hero-animation.ts`**

```typescript
import gsap from 'gsap';
import Splitting from 'splitting';

// Include splitting's CSS for word/char wrappers
import 'splitting/dist/splitting.css';
import 'splitting/dist/splitting-cells.css';

// Module-scoped references for cleanup
let heroTimeline: gsap.core.Timeline | null = null;
let continuousTweens: gsap.core.Tween[] = [];

function initHeroAnimation(): void {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    document.querySelectorAll('.hero-hidden').forEach((el) => {
      el.classList.remove('hero-hidden');
    });
    return;
  }

  const heroTitle = document.querySelector<HTMLElement>('[data-hero-title]');
  const heroSubtitle = document.querySelector<HTMLElement>('[data-hero-subtitle]');
  const heroCtas = document.querySelector<HTMLElement>('[data-hero-ctas]');
  const heroCode = document.querySelector<HTMLElement>('[data-hero-code]');
  const heroBadge = document.querySelector<HTMLElement>('[data-hero-badge]');

  if (!heroTitle) return;

  // Split the title into words
  const result = Splitting({ target: heroTitle, by: 'words' });
  const words = result[0]?.words || [];

  // Build GSAP timeline
  heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
  continuousTweens = [];

  // Reveal words with stagger
  heroTimeline.from(words, {
    y: 30,
    opacity: 0,
    duration: 0.6,
    stagger: 0.08,
  }, 0.2);

  // Subtitle fade up
  if (heroSubtitle) {
    heroSubtitle.classList.remove('hero-hidden');
    heroTimeline.from(heroSubtitle, {
      y: 20,
      opacity: 0,
      duration: 0.6,
    }, 0.8);
  }

  // CTA buttons stagger
  if (heroCtas) {
    heroCtas.classList.remove('hero-hidden');
    heroTimeline.from(heroCtas.children, {
      y: 20,
      opacity: 0,
      duration: 0.5,
      stagger: 0.15,
    }, 1.0);
  }

  // Code block slide in
  if (heroCode) {
    heroCode.classList.remove('hero-hidden');
    heroTimeline.from(heroCode, {
      x: 40,
      opacity: 0,
      rotation: 3,
      duration: 0.8,
    }, 0.5);
  }

  // Badge pop in
  if (heroBadge) {
    heroBadge.classList.remove('hero-hidden');
    heroTimeline.from(heroBadge, {
      scale: 0.8,
      opacity: 0,
      duration: 0.5,
    }, 1.2);

    // Continuous gentle float after entrance
    continuousTweens.push(gsap.to(heroBadge, {
      rotation: '-=2',
      yoyo: true,
      repeat: -1,
      duration: 2,
      ease: 'sine.inOut',
      delay: 2,
    }));
  }

  // Continuous float for code block
  if (heroCode) {
    continuousTweens.push(gsap.to(heroCode, {
      y: -8,
      yoyo: true,
      repeat: -1,
      duration: 3,
      ease: 'sine.inOut',
      delay: 2,
    }));
  }

  // Make title visible (splitting may need it)
  heroTitle.classList.remove('hero-hidden');
}

function cleanupHeroAnimation(): void {
  if (heroTimeline) {
    heroTimeline.kill();
    heroTimeline = null;
  }
  continuousTweens.forEach((t) => t.kill());
  continuousTweens = [];
}

document.addEventListener('DOMContentLoaded', initHeroAnimation);
document.addEventListener('astro:after-swap', initHeroAnimation);
document.addEventListener('astro:before-swap', cleanupHeroAnimation);
```

- [ ] **Step 5: Build and verify**

```bash
npm run build && npm run check
```

Expected: Both pass.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/scripts/hero-animation.ts src/types/splitting.d.ts src/styles/global.css
git commit -m "feat: create hero animation script with GSAP + splitting"
```

---

### Task 8: Update Hero.astro with data attributes and import animation

**Files:**
- Modify: `src/components/home/Hero.astro` — Add `data-hero-*` attributes, `hero-hidden` classes, canvas container, import scripts

- [ ] **Step 1: Update Hero.astro**

Replace the entire content of `src/components/home/Hero.astro` with:

```astro
---
import Button from '../ui/Button.astro';
import { useTranslations } from '../../i18n/utils';

const t = useTranslations();
---

<section class="relative overflow-hidden">
  <!-- Canvas for mesh gradient + particles (layered behind content) -->
  <canvas id="hero-canvas" class="absolute inset-0 w-full h-full" aria-hidden="true"></canvas>

  <!-- Fallback static gradient (visible when canvas not supported or reduced motion) -->
  <div class="absolute inset-0 bg-gradient-to-br from-primary/10 via-bg to-secondary/10 hero-canvas-fallback" aria-hidden="true"></div>
  <div class="absolute top-1/4 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl hero-canvas-fallback" aria-hidden="true"></div>
  <div class="absolute bottom-0 left-1/4 w-64 h-64 bg-secondary/5 rounded-full blur-3xl hero-canvas-fallback" aria-hidden="true"></div>

  <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 lg:py-40">
    <div class="grid lg:grid-cols-2 gap-12 items-center">
      <!-- Text Content -->
      <div>
        <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-text leading-tight mb-6 hero-hidden" data-hero-title>
          {t('hero.title').split('digital').map((part, i) =>
            i === 0 ? (
              <>{part}<span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">digital</span></>
            ) : (
              part
            )
          )}
        </h1>
        <p class="text-lg md:text-xl text-text-muted max-w-xl mb-10 leading-relaxed hero-hidden" data-hero-subtitle>
          {t('hero.subtitle')}
        </p>
        <div class="flex flex-wrap gap-4 hero-hidden" data-hero-ctas>
          <Button href="/contact/" variant="primary" size="lg">
            {t('hero.cta.primary')}
          </Button>
          <Button href="/services/" variant="outline" size="lg">
            {t('hero.cta.secondary')}
          </Button>
        </div>
      </div>

      <!-- Decorative Element -->
      <div class="hidden lg:block hero-hidden" aria-hidden="true" data-hero-code>
        <div class="relative">
          <!-- Code-like decorative block -->
          <div class="bg-surface/80 backdrop-blur-sm border border-border rounded-xl p-6 shadow-lg transform rotate-1">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-3 h-3 rounded-full bg-red-500/60"></div>
              <div class="w-3 h-3 rounded-full bg-yellow-500/60"></div>
              <div class="w-3 h-3 rounded-full bg-green-500/60"></div>
              <span class="ml-2 text-xs text-text-muted font-mono">sekoya.tech</span>
            </div>
            <div class="space-y-2 font-mono text-sm">
              <p><span class="text-secondary">const</span> <span class="text-primary">sekoya</span> = {'{'}</p>
              <p class="pl-4"><span class="text-accent">mission</span>: <span class="text-text-muted">"Digital Transformation"</span>,</p>
              <p class="pl-4"><span class="text-accent">tech</span>: [<span class="text-text-muted">"IoT"</span>, <span class="text-text-muted">"AI"</span>, <span class="text-text-muted">"Cloud"</span>],</p>
              <p class="pl-4"><span class="text-accent">passion</span>: <span class="text-primary">Infinity</span>,</p>
              <p>{'}'}</p>
            </div>
          </div>
          <!-- Floating accent card -->
          <div class="absolute -top-4 -right-4 bg-primary/10 border border-primary/20 rounded-lg px-4 py-2 transform -rotate-3 hero-hidden" data-hero-badge>
            <span class="text-primary font-semibold text-sm">Est. 2024</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<script>
  import '../scripts/hero-animation';
</script>
```

- [ ] **Step 2: Build and verify**

```bash
npm run build && npm run check
```

Expected: Both pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/Hero.astro
git commit -m "feat: update Hero with data attributes, canvas container, and animation import"
```

---

### Task 9: Create hero-canvas.ts (mesh gradient)

**Files:**
- Create: `src/scripts/hero-canvas.ts`

- [ ] **Step 1: Create `src/scripts/hero-canvas.ts`**

```typescript
interface Blob {
  x: number;
  y: number;
  radius: number;
  color: string;
  speedX: number;
  speedY: number;
  phase: number;
}

interface ThemeColors {
  blobs: string[];
}

const DARK_COLORS: ThemeColors = {
  blobs: [
    'rgba(16, 185, 129, 0.15)',  // emerald
    'rgba(16, 185, 129, 0.10)',  // emerald lighter
    'rgba(99, 102, 241, 0.12)',  // indigo
    'rgba(245, 158, 11, 0.08)', // amber
  ],
};

const LIGHT_COLORS: ThemeColors = {
  blobs: [
    'rgba(5, 150, 105, 0.08)',   // emerald (darker, lower opacity)
    'rgba(5, 150, 105, 0.06)',   // emerald lighter
    'rgba(79, 70, 229, 0.07)',   // indigo
    'rgba(217, 119, 6, 0.05)',   // amber
  ],
};

function getThemeColors(): ThemeColors {
  return document.documentElement.classList.contains('light') ? LIGHT_COLORS : DARK_COLORS;
}

function initHeroCanvas(): void {
  const canvas = document.getElementById('hero-canvas') as HTMLCanvasElement | null;
  if (!canvas) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Hide fallback gradients when canvas is active
  document.querySelectorAll('.hero-canvas-fallback').forEach((el) => {
    (el as HTMLElement).style.display = 'none';
  });

  let width = 0;
  let height = 0;
  let animationId: number | null = null;
  let colors = getThemeColors();

  function resize(): void {
    const rect = canvas!.parentElement!.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas!.width = width * window.devicePixelRatio;
    canvas!.height = height * window.devicePixelRatio;
    ctx!.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  // Setup and create blobs (after first resize so dimensions are known)
  resize();

  const blobs: Blob[] = colors.blobs.map((color, i) => ({
    x: width * (0.2 + i * 0.2),
    y: height * (0.3 + (i % 2) * 0.3),
    radius: Math.max(width, height) * (0.3 + i * 0.05),
    color,
    speedX: 0.3 + i * 0.1,
    speedY: 0.2 + i * 0.15,
    phase: i * Math.PI * 0.5,
  }));

  let time = 0;
  let lastFrame = 0;
  const FPS_INTERVAL = 1000 / 30; // 30fps target

  function drawMeshGradient(): void {
    ctx!.clearRect(0, 0, width, height);

    blobs.forEach((blob) => {
      const bx = width * 0.5 + Math.sin(time * blob.speedX + blob.phase) * width * 0.3;
      const by = height * 0.5 + Math.cos(time * blob.speedY + blob.phase) * height * 0.25;

      const gradient = ctx!.createRadialGradient(bx, by, 0, bx, by, blob.radius);
      gradient.addColorStop(0, blob.color);
      gradient.addColorStop(1, 'transparent');

      ctx!.globalCompositeOperation = 'lighter';
      ctx!.fillStyle = gradient;
      ctx!.fillRect(0, 0, width, height);
    });
  }

  function animate(timestamp: number): void {
    const elapsed = timestamp - lastFrame;
    if (elapsed >= FPS_INTERVAL) {
      lastFrame = timestamp - (elapsed % FPS_INTERVAL);
      time += 0.005;
      drawMeshGradient();
    }
    animationId = requestAnimationFrame(animate);
  }

  // Intersection Observer: pause when not visible
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        if (!animationId) animationId = requestAnimationFrame(animate);
      } else {
        if (animationId) {
          cancelAnimationFrame(animationId);
          animationId = null;
        }
      }
    },
    { threshold: 0.1 }
  );

  // Theme change observer
  const themeObserver = new MutationObserver(() => {
    colors = getThemeColors();
    blobs.forEach((blob, i) => {
      blob.color = colors.blobs[i];
    });
    // Update particle color too (if particles are integrated)
    particleColor = document.documentElement.classList.contains('light')
      ? 'rgba(5, 150, 105,' : 'rgba(16, 185, 129,';
  });

  // Reduced motion check
  if (prefersReducedMotion) {
    // Draw single static frame
    time = 0.5;
    drawMeshGradient();
    return;
  }

  observer.observe(canvas);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });

  window.addEventListener('resize', resize);
  animationId = requestAnimationFrame(animate);

  // Cleanup for View Transitions
  const cleanup = (): void => {
    if (animationId) cancelAnimationFrame(animationId);
    animationId = null;
    observer.disconnect();
    themeObserver.disconnect();
    window.removeEventListener('resize', resize);
  };

  document.addEventListener('astro:before-swap', cleanup, { once: true });
}

document.addEventListener('DOMContentLoaded', initHeroCanvas);
document.addEventListener('astro:after-swap', initHeroCanvas);
```

- [ ] **Step 2: Import in Hero.astro**

In `src/components/home/Hero.astro`, add inside the existing `<script>` tag at the bottom (before `</script>`):

Change:
```astro
<script>
  import '../scripts/hero-animation';
</script>
```
to:
```astro
<script>
  import '../scripts/hero-animation';
  import '../scripts/hero-canvas';
</script>
```

- [ ] **Step 3: Build and verify**

```bash
npm run build && npm run check
```

Expected: Both pass.

- [ ] **Step 4: Commit**

```bash
git add src/scripts/hero-canvas.ts src/components/home/Hero.astro
git commit -m "feat: add animated mesh gradient canvas to hero section"
```

---

## Chunk 4: Particle Network (Feature 3)

### Task 10: Add particle network to hero-canvas.ts

**Files:**
- Modify: `src/scripts/hero-canvas.ts` — Add particle layer on top of mesh gradient

- [ ] **Step 1: Extend hero-canvas.ts with particle system**

Add the following interfaces and code to `src/scripts/hero-canvas.ts`. This extends the existing canvas to draw particles on top of the mesh gradient.

Add the `Particle` interface after the existing `ThemeColors` interface:

```typescript
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
}
```

The particle system needs to be integrated into the existing `initHeroCanvas` function. The key changes:
1. Create particles array based on device width
2. Track mouse position
3. Draw particles after mesh gradient in the `animate` loop
4. Add `drawParticles()` function

Specifically, inside `initHeroCanvas()`, after the blobs array creation and before the `animate` function:

Add mouse tracking:
```typescript
  const mouse = { x: -1000, y: -1000 };
  const isMobile = window.innerWidth < 768;
  const particleCount = isMobile ? 30 : window.innerWidth < 1024 ? 50 : 70;

  // Create particles
  const particles: Particle[] = Array.from({ length: particleCount }, () => ({
    x: Math.random() * (width || window.innerWidth),
    y: Math.random() * (height || window.innerHeight),
    vx: (Math.random() - 0.5) * 0.6,
    vy: (Math.random() - 0.5) * 0.6,
    radius: 1.5 + Math.random() * 1.5,
    opacity: 0.3 + Math.random() * 0.4,
  }));

  if (!isMobile) {
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    canvas.addEventListener('mouseleave', () => {
      mouse.x = -1000;
      mouse.y = -1000;
    });
  }
```

Add `drawParticles` function:
```typescript
  let particleColor = document.documentElement.classList.contains('light')
    ? 'rgba(5, 150, 105,' : 'rgba(16, 185, 129,';
  const CONNECTION_DIST = 150;

  function drawParticles(): void {
    // Update positions
    particles.forEach((p) => {
      // Mouse attraction
      if (!isMobile) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          p.vx += dx * 0.00015;
          p.vy += dy * 0.00015;
        }
      }

      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      // Dampen velocity
      p.vx *= 0.999;
      p.vy *= 0.999;
    });

    // Draw connections
    ctx!.globalCompositeOperation = 'source-over';
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.15;
          ctx!.strokeStyle = `${particleColor}${alpha})`;
          ctx!.lineWidth = 0.5;
          ctx!.beginPath();
          ctx!.moveTo(particles[i].x, particles[i].y);
          ctx!.lineTo(particles[j].x, particles[j].y);
          ctx!.stroke();
        }
      }
    }

    // Draw particles
    particles.forEach((p) => {
      ctx!.globalCompositeOperation = 'source-over';
      ctx!.fillStyle = `${particleColor}${p.opacity})`;
      ctx!.beginPath();
      ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx!.fill();
    });
  }
```

Modify the existing `animate` loop — after `drawMeshGradient()`, add `drawParticles()`:
```typescript
  function animate(timestamp: number): void {
    const elapsed = timestamp - lastFrame;
    if (elapsed >= FPS_INTERVAL) {
      lastFrame = timestamp - (elapsed % FPS_INTERVAL);
      time += 0.005;
      drawMeshGradient();
      drawParticles();  // ADD THIS LINE
    }
    animationId = requestAnimationFrame(animate);
  }
```

Also update the reduced motion branch — after drawing the static mesh, draw static particles:
```typescript
  if (prefersReducedMotion) {
    time = 0.5;
    drawMeshGradient();
    drawParticles();  // ADD: draw particles once, static
    return;
  }
```

- [ ] **Step 2: Build and verify**

```bash
npm run build && npm run check
```

Expected: Both pass.

- [ ] **Step 3: Commit**

```bash
git add src/scripts/hero-canvas.ts
git commit -m "feat: add interactive particle network to hero canvas"
```

---

## Chunk 5: Custom Cursor + Magnetic Buttons (Feature 4)

### Task 11: Create custom-cursor.ts

**Files:**
- Create: `src/scripts/custom-cursor.ts`

- [ ] **Step 1: Create `src/scripts/custom-cursor.ts`**

```typescript
function initCustomCursor(): void {
  // Skip on touch devices
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (isTouchDevice) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const cursor = document.getElementById('cursor');
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!cursor || !dot || !ring) return;

  // Show cursor elements
  cursor.style.display = 'block';
  document.body.classList.add('custom-cursor-active');

  let mouseX = 0;
  let mouseY = 0;
  let dotX = 0;
  let dotY = 0;
  let ringX = 0;
  let ringY = 0;
  let ringScale = 1;
  let rafId: number | null = null;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Hover states
  const interactiveSelector = 'a, button, [role="button"], input, textarea, select, label, summary';

  document.addEventListener('mouseover', (e) => {
    const target = e.target as HTMLElement;
    if (target.closest(interactiveSelector)) {
      ringScale = 1.5;
      ring.style.opacity = '0.5';
    }
  });

  document.addEventListener('mouseout', (e) => {
    const target = e.target as HTMLElement;
    if (target.closest(interactiveSelector)) {
      ringScale = 1;
      ring.style.opacity = '1';
    }
  });

  // Magnetic button effect
  function initMagnetic(): void {
    document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const maxDist = 100;

        if (distance < maxDist && distance > 0.1) {
          const strength = (1 - distance / maxDist) * 10;
          const moveX = (deltaX / distance) * strength;
          const moveY = (deltaY / distance) * strength;
          btn.style.transform = `translate(${moveX}px, ${moveY}px)`;
        }
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
        btn.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        setTimeout(() => {
          btn.style.transition = '';
        }, 300);
      });
    });
  }

  function animate(): void {
    // Lerp dot (fast follow)
    dotX += (mouseX - dotX) * 0.15;
    dotY += (mouseY - dotY) * 0.15;

    // Lerp ring (slow follow)
    ringX += (mouseX - ringX) * 0.08;
    ringY += (mouseY - ringY) * 0.08;

    dot.style.transform = `translate3d(${dotX - 4}px, ${dotY - 4}px, 0)`;
    ring.style.transform = `translate3d(${ringX - 16}px, ${ringY - 16}px, 0) scale(${ringScale})`;

    rafId = requestAnimationFrame(animate);
  }

  initMagnetic();

  // Use requestIdleCallback for non-critical startup
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      rafId = requestAnimationFrame(animate);
    });
  } else {
    rafId = requestAnimationFrame(animate);
  }

  // Cleanup
  const cleanup = (): void => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    cursor.style.display = 'none';
    document.body.classList.remove('custom-cursor-active');
  };

  document.addEventListener('astro:before-swap', cleanup, { once: true });
}

document.addEventListener('DOMContentLoaded', initCustomCursor);
document.addEventListener('astro:after-swap', initCustomCursor);
```

- [ ] **Step 2: Build and verify**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/scripts/custom-cursor.ts
git commit -m "feat: create custom cursor and magnetic button script"
```

---

### Task 12: Add cursor DOM, CSS, and data-magnetic to components

**Files:**
- Modify: `src/layouts/BaseLayout.astro` — Add cursor elements + import script
- Modify: `src/styles/global.css` — Add cursor CSS
- Modify: `src/components/ui/Button.astro` — Add `data-magnetic` for primary lg

- [ ] **Step 1: Add cursor DOM to BaseLayout.astro**

In `src/layouts/BaseLayout.astro`, add the cursor div right after the opening `<body>` tag (after line 103):

```astro
  <body class="min-h-screen bg-bg text-text font-sans antialiased">
    <!-- Custom cursor (hidden by default, shown by JS on non-touch devices) -->
    <div id="cursor" class="pointer-events-none fixed top-0 left-0 z-[9999] hidden" aria-hidden="true">
      <div id="cursor-dot" class="w-2 h-2 bg-primary rounded-full" style="will-change: transform;"></div>
      <div id="cursor-ring" class="w-8 h-8 border border-primary/60 rounded-full" style="will-change: transform;"></div>
    </div>
    <a href="#main" class="skip-nav">{t('common.skip_nav')}</a>
```

Also add the script import. In the frontmatter, after line 9 (`import '../scripts/scroll-reveal';`), add:

```astro
import '../scripts/custom-cursor';
```

- [ ] **Step 2: Add cursor CSS to global.css**

Add after the `.hero-hidden` block in `src/styles/global.css`:

```css
/* Custom cursor */
.custom-cursor-active {
  cursor: none;
}

.custom-cursor-active a,
.custom-cursor-active button,
.custom-cursor-active input,
.custom-cursor-active textarea,
.custom-cursor-active select {
  cursor: none;
}
```

- [ ] **Step 3: Add data-magnetic to Button.astro**

In `src/components/ui/Button.astro`, modify the element rendering to conditionally add `data-magnetic`.

Change lines 35-47:

```astro
const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
const Tag = href ? 'a' : 'button';
---

{href ? (
  <a href={href} class={classes} {...rest}>
    <slot />
  </a>
) : (
  <button type={type} class={classes} {...rest}>
    <slot />
  </button>
)}
```

to:

```astro
const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
const isMagnetic = variant === 'primary' && size === 'lg';
---

{href ? (
  <a href={href} class={classes} data-magnetic={isMagnetic || undefined} {...rest}>
    <slot />
  </a>
) : (
  <button type={type} class={classes} data-magnetic={isMagnetic || undefined} {...rest}>
    <slot />
  </button>
)}
```

- [ ] **Step 4: Build and verify**

```bash
npm run build && npm run check
```

Expected: Both pass.

- [ ] **Step 5: Commit**

```bash
git add src/layouts/BaseLayout.astro src/styles/global.css src/components/ui/Button.astro
git commit -m "feat: add custom cursor DOM, CSS, and magnetic buttons"
```

---

## Chunk 6: Final Verification

### Task 13: Full build verification and version bump

**Files:**
- Verify all files build correctly

- [ ] **Step 1: Clean build**

```bash
cd /home/cevheri/projects/dart/sekoya/sekoyatech.github.io
rm -rf dist
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 2: Type check**

```bash
npm run check
```

Expected: No type errors.

- [ ] **Step 3: Start dev server and manual smoke test**

```bash
npm run dev
```

Verify in browser:
1. Home page: hero text animates in word-by-word, mesh gradient animates, particles visible
2. Scroll down: sections fade/slide in, stats count up
3. Click a service card: page morphs into detail page
4. Custom cursor visible on desktop (dot + ring), magnetic on CTA buttons
5. Toggle theme: canvas colors adapt
6. Check mobile viewport: no custom cursor, fewer particles
7. Enable `prefers-reduced-motion` in browser: all animations disabled, content visible

- [ ] **Step 4: Bump version**

```bash
npm version minor --no-git-tag-version
```

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "bump: update version to $(node -p 'require(\"./package.json\").version')"
```
