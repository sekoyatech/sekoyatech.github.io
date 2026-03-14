# Team Page Redesign — Design Spec

**Date:** 2026-03-15
**Status:** Approved

## Overview

Redesign the Sekoya team page with full-width horizontal showcase cards, alternating zigzag layout, GitHub avatars, skill badges, and modern 2026 UI/UX standards. Replace the existing placeholder content with real team member data researched from LinkedIn and GitHub profiles.

## Team Members

| # | Name | Role | GitHub Username | LinkedIn |
|---|------|------|-----------------|----------|
| 1 | Abdullah Kaya | Founder, CEO | kaya-abdullah | kaya-abdullah |
| 2 | Yusuf Gündoğdu | Founder, Tech Lead | yusuf-gundogdu | yusufgundogdu |
| 3 | Süleyman Sürücü | Software Engineer | suleymansurucu | suleymansurucu |
| 4 | Mehmet Uçmaz | Software Engineer | ucmazmehmet | ucmazmehmet |
| 5 | Baha Serdaroğlu | Intern | developerbaha | baha-serdaroglu |
| 6 | İhsan Ertürk | Intern | ihsanerturkk | ihsan-ertürk-282b89307 |

## Layout Design

### Card Structure (Desktop)

Each team member gets a full-width horizontal card. Cards alternate in a zigzag pattern:

- **Odd cards (1, 3, 5):** Avatar left, content right
- **Even cards (2, 4, 6):** Content left, avatar right
- Cards are separated by vertical spacing (`gap-12` or similar)

### Card Content

Each card contains:

1. **Avatar section**
   - GitHub profile photo via `https://github.com/{username}.png`
   - Circular crop with gradient ring (primary → secondary gradient border)
   - Size: ~160px desktop, ~120px mobile
2. **Info section**
   - Name (large, bold, `text-text`)
   - Role badge (pill with `bg-primary/10 text-primary` styling)
   - Bio paragraph (1-2 sentences, `text-text-muted`)
   - Skill tags (array of pill badges, `bg-surface border border-border`)
   - Social links (LinkedIn + GitHub SVG icons, hover → `text-primary`)
3. **Hover effect**
   - Card gets subtle glow: `hover:border-primary/30 hover:shadow-lg`
   - Smooth transition (`transition-all duration-300`)

### Mobile Layout

- Single column, zigzag removed
- Avatar centered on top
- Content below, centered text
- Skill tags wrap naturally

## Schema Changes

### `src/content.config.ts` — team collection

Add `skills` field to the schema:

```typescript
const team = defineCollection({
  schema: z.object({
    name: z.string(),
    role: z.string(),
    bio: z.string(),
    photo: z.string().optional(),
    linkedin: z.string().url().optional(),
    github: z.string().url().optional(),
    skills: z.array(z.string()).default([]),
    order: z.number(),
  }),
});
```

## Content Files

Replace the single `team-member.mdx` placeholder with 6 individual `.mdx` files:

- `abdullah-kaya.mdx` (order: 1)
- `yusuf-gundogdu.mdx` (order: 2)
- `suleyman-surucu.mdx` (order: 3)
- `mehmet-ucmaz.mdx` (order: 4)
- `baha-serdaroglu.mdx` (order: 5)
- `ihsan-erturk.mdx` (order: 6)

Each file has frontmatter with: name, role, bio, photo (GitHub avatar URL), linkedin, github, skills array, order.

## Files to Modify

1. **`src/content.config.ts`** — Add `skills` to team schema
2. **`src/components/team/TeamMember.astro`** — Complete rewrite for horizontal zigzag card
3. **`src/pages/team.astro`** — Update layout from grid to vertical stack with zigzag
4. **`src/content/team/en/*.mdx`** — Delete placeholder, create 6 real member files
5. **`src/i18n/en.json`** — Update team subtitle if needed

## Theme Compliance

- Dark-first: All colors use CSS custom properties from `@theme` block
- No `dark:` variant usage
- Light mode via `.light` class overrides
- Uses existing design tokens: `bg-surface`, `text-text`, `text-text-muted`, `text-primary`, `border-border`, etc.

## Accessibility

- Semantic HTML: section, heading hierarchy
- Alt text on avatar images
- `aria-label` on social links
- Focus-visible outlines on interactive elements
- Reduced motion support (inherited from global.css)
