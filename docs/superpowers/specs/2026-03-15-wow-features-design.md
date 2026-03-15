# Sekoya Website — Wow Effect Features Design Spec

**Date:** 2026-03-15
**Status:** Reviewed
**Goal:** Transform sekoya.tech from a static brochure into a living, cinematic digital experience that creates immediate "wow" impact on visitors.

---

## Context

The current site is a clean, professional Astro 6 static site with Tailwind v4. It has strong content, good SEO, and solid accessibility. However, it lacks visual motion and interactivity — all content renders statically with only basic hover effects. In a competitive tech consultancy landscape, first impressions matter: visitors decide in 3 seconds whether to stay.

### Current State

- No scroll animations (no fade-in, slide-up, or reveal effects)
- Hero section is static (no text animation, no living background)
- Minimal micro-interactions (basic hover color changes only)
- No custom cursor or magnetic effects
- `ClientRouter` exists but no `transition:name` morph effects between pages
- `prefers-reduced-motion` already respected (good foundation)

### Design Principles

1. **Progressive enhancement** — site works perfectly without JS; animations layer on top
2. **Performance budget** — total added JS < 40KB gzipped (GSAP ~28KB + splitting ~3KB + custom scripts ~5KB)
3. **Reduced motion respect** — all animations disabled when `prefers-reduced-motion: reduce`
4. **Mobile-first degradation** — complex effects (cursor, particles) disabled on mobile/touch
5. **Astro compatibility** — all scripts reinitialize on `astro:after-swap` for View Transitions

---

## Feature 1: Cinematic Hero — GSAP Split Text + Animated Mesh Gradient

### What It Does

The home page hero transforms from a static text block into a cinematic opening sequence:
- Headline letters animate in word-by-word with staggered timing
- Subtitle fades up after headline completes
- CTA buttons slide in from bottom with spring easing
- Background features slowly morphing mesh gradient (emerald/indigo)
- Decorative code block floats with gentle bobbing animation
- "Est. 2024" badge has subtle rotation oscillation

### Architecture

**New files:**
- `src/scripts/hero-animation.ts` — GSAP timeline for hero entrance sequence
- `src/scripts/mesh-gradient.ts` — Canvas-based animated mesh gradient

**Modified files:**
- `src/components/home/Hero.astro` — Add `data-animate-*` attributes to elements, add canvas container for mesh gradient
- `src/styles/global.css` — Add `.hero-hidden` initial state class (opacity: 0, transform: translateY(20px))

### Animation Timeline

```
t=0.0s  Mesh gradient canvas starts (continuous loop)
t=0.2s  H1 words reveal: stagger 0.08s per word, from(y: 30, opacity: 0)
t=0.8s  Subtitle: from(y: 20, opacity: 0, duration: 0.6)
t=1.0s  CTA buttons: stagger 0.15s, from(y: 20, opacity: 0)
t=0.5s  Code block: from(x: 40, opacity: 0, rotation: 3)
t=1.2s  "Est. 2024" badge: from(scale: 0.8, opacity: 0)
```

### Mesh Gradient Implementation

A `<canvas>` element positioned behind hero content. Four gradient blobs (2 emerald, 1 indigo, 1 amber) move on slow sine-wave paths. The canvas:
- Uses 2D context with `globalCompositeOperation: 'lighter'`
- Runs at 30fps (requestAnimationFrame with frame skip)
- Pauses when not visible (Intersection Observer)
- Falls back to current static CSS gradient on canvas unsupported / reduced motion

### Canvas Theme Adaptation

Canvas 2D uses hardcoded color values (not CSS custom properties). To support light/dark themes:
- Read colors from a config object that maps to theme
- Detect theme from `document.documentElement.classList.contains('light')`
- Listen for theme changes via MutationObserver on `<html>` class attribute
- On theme change: update color config, canvas re-renders with new palette
- Dark theme: emerald/indigo blobs on dark background (vibrant, high contrast)
- Light theme: softer, more transparent blobs (lower opacity, pastel tints)

### Key Decisions

- **GSAP SplitText vs splitting.js**: Use the open-source `splitting` library (~3KB). GSAP SplitText requires a paid GSAP Club membership for production use. `splitting` provides word/char splitting with CSS variable indices — sufficient for our staggered reveal. GSAP core animates the split elements.
- **Canvas vs CSS gradient animation**: Canvas for smoother multi-blob animation; CSS `@keyframes` on background-position causes repaints and feels mechanical.
- **Word-level vs character-level split**: Word-level for headline (cleaner, faster), character-level reserved for special emphasis words only.

### Reduced Motion Behavior

When `prefers-reduced-motion: reduce`: all elements render immediately (no `.hero-hidden` class applied), canvas shows static gradient frame.

---

## Feature 2: Scroll-Driven Reveal System — GSAP ScrollTrigger

### What It Does

Every content section animates into view as the user scrolls:
- Cards fade up with staggered delays (0.1s between siblings)
- Section headings slide in from left
- Stats counters animate from 0 to target value
- Sections have subtle parallax depth between them

### Architecture

**New files:**
- `src/scripts/scroll-reveal.ts` — GSAP ScrollTrigger initialization, reusable reveal system
- `src/scripts/counter.ts` — Animated number counter using GSAP

**Modified files:**
- `src/components/ui/Section.astro` — Add `data-reveal` attribute
- `src/components/ui/Card.astro` — Add `data-reveal-child` attribute
- `src/components/home/AboutPreview.astro` — Add `data-counter` attributes to stat values
- `src/components/home/ServicesPreview.astro` — Add `data-reveal-stagger` to card grid
- `src/components/home/BlogPreview.astro` — Add `data-reveal-stagger` to card grid
- `src/components/home/TestimonialsSlider.astro` — Add `data-reveal` to section
- `src/components/home/CTA.astro` — Add `data-reveal` attribute
- `src/pages/about.astro` — Add reveal attributes to timeline, mission/vision cards
- `src/pages/services/index.astro` — Add reveal to service card grid
- `src/pages/portfolio/index.astro` — Add reveal to project card grid
- `src/pages/team.astro` — Add reveal to team member cards
- `src/styles/global.css` — Add `.reveal-hidden` initial state

### Reveal System Design

A declarative, attribute-based system. No component changes needed beyond adding data attributes:

```html
<!-- Single element reveal -->
<div data-reveal>...</div>

<!-- Staggered children reveal -->
<div data-reveal-stagger>
  <div>Card 1</div>  <!-- stagger 0.1s -->
  <div>Card 2</div>  <!-- stagger 0.2s -->
  <div>Card 3</div>  <!-- stagger 0.3s -->
</div>

<!-- Direction variants -->
<div data-reveal="left">...</div>   <!-- slide from left -->
<div data-reveal="right">...</div>  <!-- slide from right -->
<div data-reveal="up">...</div>     <!-- default: slide from below -->
<div data-reveal="scale">...</div>  <!-- scale up from 0.9 -->

<!-- Counter -->
<div data-counter="25">0</div>      <!-- animates 0 → 25 -->
<div data-counter="15+">0</div>     <!-- animates 0 → 15, then appends "+" -->
```

### ScrollTrigger Configuration

```js
// Default trigger: element enters viewport at 85% scroll position
ScrollTrigger.defaults({
  start: 'top 85%',
  toggleActions: 'play none none none', // play once, don't reverse
});
```

### Astro View Transitions Compatibility

ScrollTrigger instances must be destroyed and recreated on page transitions:

```ts
document.addEventListener('astro:before-swap', () => {
  ScrollTrigger.getAll().forEach(t => t.kill());
});

document.addEventListener('astro:after-swap', () => {
  initScrollReveal();
});
```

### Smooth Scroll — Deferred Enhancement

Lenis smooth scroll is intentionally deferred to a follow-up iteration. Reasons:
1. CSS `scroll-behavior: smooth` already exists in `global.css` and conflicts with Lenis
2. Lenis conflicts with Astro's `<ClientRouter>` scroll restoration
3. Lenis conflicts with the mobile menu's `overflow: hidden` body style
4. All GSAP ScrollTrigger features work perfectly with native scroll

If smooth scroll is desired later, it should be added as a dedicated refinement with its own testing cycle.

### Counter Animation

Stats in `AboutPreview.astro` currently show static values: "2024", "25+", "15+", "20+". The counter will:
1. Parse target number from `data-counter` attribute
2. Detect suffix (+, %) from attribute value
3. Animate from 0 to target using GSAP `to()` with `snap: { value: 1 }` for integer steps
4. Trigger when element enters viewport (ScrollTrigger)

### Parallax Between Sections

Subtle parallax on Section backgrounds: sections with `background="surface"` get a slight `y` translation offset via ScrollTrigger creating depth. Movement: max 30px, tied to scroll position. This is NOT full-page parallax — just gentle inter-section depth.

---

## Feature 3: Interactive Particle Network

### What It Does

A canvas-based particle network in the hero section background, behind the mesh gradient:
- 60-80 particles (dots) drift slowly across the canvas
- Particles within a threshold distance connect with semi-transparent lines
- Mouse movement creates an "attraction zone" — nearby particles are gently pulled toward cursor
- Color palette: emerald (#10B981) particles, emerald/indigo connecting lines
- On mobile: reduced to 30 particles, no mouse interaction

### Architecture

**New files:**
- `src/scripts/particles.ts` — Particle system with Canvas 2D

**Modified files:**
- `src/components/home/Hero.astro` — Add particle canvas layer (behind mesh gradient canvas, or combined into one canvas with layered rendering)

### Rendering Strategy

Single canvas approach (combine mesh gradient + particles):
- Layer 1: Mesh gradient blobs (drawn first)
- Layer 2: Particle network (drawn on top with `globalAlpha`)

This avoids two overlapping canvases and reduces GPU overhead.

### Particle Physics

```ts
interface Particle {
  x: number;
  y: number;
  vx: number;       // velocity: -0.3 to 0.3 px/frame
  vy: number;
  radius: number;   // 1.5 to 3px
  opacity: number;  // 0.3 to 0.7
}
```

- Connection distance threshold: 150px
- Connection line opacity: proportional to distance (closer = more opaque)
- Mouse attraction radius: 200px
- Mouse force: gentle pull (0.02 multiplier), not snap-to
- Particles wrap around edges (exit right, enter left)
- Connection check is O(n^2) per frame — with 80 particles that's ~3,160 distance checks at 30fps, manageable. If particle count ever increases, use grid-based spatial partitioning.

### Performance

- Desktop: 60-80 particles, 30fps target
- Mobile (< 768px): 30 particles, no mouse tracking
- Tablet: 50 particles, touch interaction
- Pauses when not in viewport (Intersection Observer)
- Respects `prefers-reduced-motion`: shows static snapshot (particles drawn once, no animation loop)

---

## Feature 4: Custom Cursor + Magnetic Buttons

### What It Does

**Custom Cursor (desktop only):**
- Default: small (8px) emerald circle following the mouse with slight delay (lerp 0.15)
- An outer ring (32px) follows more slowly (lerp 0.08), creating a trailing effect
- On links/buttons: outer ring expands to 48px, becomes semi-transparent
- On text content: cursor changes to a thin vertical bar
- On images: cursor shows "View" text

**Magnetic Buttons:**
- CTA buttons (primary variant, size="lg") have magnetic pull
- When cursor enters a 100px radius around button center, button translates toward cursor
- Max displacement: 10px
- Smooth return to center when cursor leaves radius
- Spring-like easing on return

### Architecture

**New files:**
- `src/scripts/custom-cursor.ts` — Cursor rendering and state management
- `src/scripts/magnetic.ts` — Magnetic button effect

**Modified files:**
- `src/styles/global.css` — Hide default cursor on desktop (`cursor: none` on body when custom cursor active), cursor element styles
- `src/layouts/BaseLayout.astro` — Add cursor DOM elements (inner dot + outer ring)
- `src/components/ui/Button.astro` — Add `data-magnetic` attribute to primary lg buttons

### Cursor DOM Structure

```html
<!-- Added to BaseLayout.astro body -->
<div id="cursor" class="pointer-events-none fixed top-0 left-0 z-[9999]" aria-hidden="true">
  <div id="cursor-dot" class="w-2 h-2 bg-primary rounded-full"></div>
  <div id="cursor-ring" class="w-8 h-8 border border-primary/60 rounded-full"></div>
</div>
```

### Touch Device Detection

```ts
// Do not initialize on touch devices
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
if (isTouchDevice) return;
```

When touch device detected: no cursor elements rendered, no `cursor: none` on body, no magnetic effects.

### Performance

- Uses `requestAnimationFrame` for cursor position updates
- `transform: translate3d()` for GPU-accelerated positioning
- `will-change: transform` on cursor elements only (just 2 elements — acceptable GPU memory cost)
- For the reveal system: do NOT add `will-change` to revealed elements; GSAP manages compositor layers internally
- Mouse position tracked via `mousemove` with no throttling (needs to be smooth)
- Initialize cursor and magnetic effects via `requestIdleCallback` (purely decorative, should not compete with critical rendering)

---

## Feature 5: Page Morph Transitions

### What It Does

When navigating between pages, shared elements morph smoothly:
- **Service card → Service detail**: Card transforms into the hero section of the detail page
- **Blog card → Blog post**: Card title morphs into the post title
- **Portfolio card → Portfolio detail**: Card expands into detail hero
- **Shared elements**: Header and footer transition smoothly (Astro handles these via default view-transition; `transition:persist` is avoided as it can cause stale event listeners and theme-toggle breakage)

### Architecture

**Modified files:**
- `src/components/services/ServiceCard.astro` — Add `transition:name={`service-${slug}`}` to card wrapper, `transition:name={`service-title-${slug}`}` to title
- `src/components/blog/BlogCard.astro` — Add `transition:name={`blog-${slug}`}` to card, `transition:name={`blog-title-${slug}`}` to title
- `src/components/portfolio/ProjectCard.astro` — Add `transition:name={`project-${slug}`}` to card
- `src/pages/services/[slug].astro` — Add matching `transition:name` to hero title
- `src/pages/blog/[slug].astro` — Add matching `transition:name` to post title
- `src/layouts/PageLayout.astro` — Add `transition:name` to hero section container
- `src/layouts/BlogLayout.astro` — Add `transition:name` to article header
- `src/styles/global.css` — Custom `::view-transition-*` CSS for timing and easing

### Transition Configuration

Card components need a new `slug` prop to generate deterministic transition names (not parsed from href):

```astro
<!-- ServiceCard.astro — add slug prop -->
interface Props {
  title: string;
  description: string;
  icon: string;
  href: string;
  slug: string;  // NEW: for transition:name
}
<a href={href} class="group block" transition:name={`service-${slug}`}>

<!-- [slug].astro hero -->
<h1 transition:name={`service-title-${entry.id}`}>
```

Similarly, `BlogCard` gets a `slug` prop, and `ProjectCard` gets a `slug` prop.

### Custom Transition CSS

```css
::view-transition-old(root) {
  animation: fade-out 0.3s ease-in;
}

::view-transition-new(root) {
  animation: fade-in 0.3s ease-out;
}
```

Note: CSS `::view-transition-group()` does not support wildcards. Each named transition element gets its own styling inherited from the group defaults. The browser handles morphing automatically for matching `transition:name` pairs — no per-name CSS needed.

### Browser Support

View Transitions API: Chrome 111+, Edge 111+, Opera 97+, Safari 18+ (March 2025). Firefox 144+ (view-transition support). Coverage: ~85%+. Fallback: instant page swap (current behavior, no regression).

---

## Dependency Management

### New npm Packages

| Package | Size (gzipped) | Purpose |
|---|---|---|
| `gsap` | ~28KB | Core animation engine (free for public sites) |
| `splitting` | ~3KB | Text splitting for hero word reveal |

**Total added weight: ~31KB gzipped**

GSAP includes ScrollTrigger as a built-in plugin (registered via `gsap.registerPlugin(ScrollTrigger)`) — no separate package needed. The `splitting` library is MIT-licensed and handles word/character splitting with CSS variable indices.

**Post-implementation verification:** Run `npx vite-bundle-visualizer` to confirm actual bundle sizes match estimates.

### No New Packages Needed

- Particle system: custom Canvas 2D (~150 lines)
- Custom cursor: vanilla JS (~100 lines)
- Magnetic buttons: vanilla JS (~60 lines)
- View Transitions: Astro built-in

---

## Script Loading Strategy

All animation scripts load as standard Astro `<script>` tags (bundled by Vite). They:

1. Check for `prefers-reduced-motion`
2. Initialize on DOMContentLoaded
3. Re-initialize on `astro:after-swap` (View Transitions)
4. Destroy/cleanup on `astro:before-swap`

```ts
// Pattern for all animation scripts
function init() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // ... setup animations
}

function cleanup() {
  // ... kill GSAP instances, destroy Lenis, etc.
}

document.addEventListener('DOMContentLoaded', init);
document.addEventListener('astro:after-swap', init);
document.addEventListener('astro:before-swap', cleanup);
```

---

## File Structure

```
src/
  scripts/
    hero-canvas.ts            # Feature 1+3: Combined canvas (mesh gradient + particles)
    hero-animation.ts         # Feature 1: GSAP hero timeline (text split, element reveals)
    scroll-reveal.ts          # Feature 2: ScrollTrigger reveal system + counter
    custom-cursor.ts          # Feature 4: Custom cursor + magnetic buttons
```

Design decision: fewer files with cohesive responsibilities rather than many tiny files. The counter logic is simple enough to live inside `scroll-reveal.ts`. Magnetic button logic (~60 lines) is co-located with custom cursor since both respond to mouse events.

---

## Implementation Order

The features should be built in this order due to dependencies:

1. **Feature 2: Scroll Reveal System** — Install GSAP, build the core animation infrastructure and `astro:before-swap` / `astro:after-swap` lifecycle that all other features depend on. Includes counter animations.
2. **Feature 5: Page Morph Transitions** — Add `transition:name` attributes and `slug` props. Benefits from the lifecycle infrastructure established in step 1.
3. **Feature 1: Cinematic Hero** — Uses GSAP (installed in step 1), add `splitting` library + canvas mesh gradient.
4. **Feature 3: Particle Network** — Extends the hero canvas from Feature 1.
5. **Feature 4: Custom Cursor + Magnetic** — Independent vanilla JS, can be done last.

Each step includes verification: `npm run build`, `npm run check`, manual browser testing.

---

## Testing Strategy

- **Visual regression**: Manual browser testing on Chrome, Firefox, Safari
- **Performance**: Lighthouse score must remain > 90 on mobile
- **Reduced motion**: Verify all animations disabled with `prefers-reduced-motion: reduce`
- **Mobile**: Verify no cursor effects, reduced particles, no performance drops
- **View Transitions**: Test page navigation sequences (list → detail → back)
- **Build**: `npm run build` must succeed; `npm run check` must pass

---

## Success Criteria

1. Hero section creates immediate visual impact within first 3 seconds of page load
2. Scrolling feels smooth and every section has purpose-driven entrance animation
3. Particle network subtly communicates "technology" without being distracting
4. Custom cursor makes the site feel premium and app-like on desktop
5. Page transitions feel seamless, like a native app rather than a website
6. Lighthouse performance score stays above 90 on mobile
7. All animations respect `prefers-reduced-motion`
