# Team Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the team page with full-width zigzag showcase cards, real team data, GitHub avatars, skill badges, and 2026 UI/UX standards.

**Architecture:** Content collection schema gets a `skills` field. TeamMember component is rewritten as a horizontal showcase card with zigzag layout (alternating avatar position). Team page passes an `index` prop to control zigzag direction. Existing placeholder content is replaced with 6 real team member files.

**Tech Stack:** Astro 6, Tailwind v4 (CSS `@theme`), Content Collections with `glob()` loader, static HTML output.

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `src/content.config.ts:43-54` | Add `skills` array to team schema |
| Delete | `src/content/team/en/team-member.mdx` | Remove placeholder | 
| Create | `src/content/team/en/abdullah-kaya.mdx` | Founder, CEO content |
| Create | `src/content/team/en/yusuf-gundogdu.mdx` | Founder, Tech Lead content |
| Create | `src/content/team/en/suleyman-surucu.mdx` | Software Engineer content |
| Create | `src/content/team/en/mehmet-ucmaz.mdx` | Software Engineer content |
| Create | `src/content/team/en/baha-serdaroglu.mdx` | Intern content |
| Create | `src/content/team/en/ihsan-erturk.mdx` | Intern content |
| Rewrite | `src/components/team/TeamMember.astro` | Horizontal zigzag showcase card |
| Modify | `src/pages/team.astro:21-31` | Replace grid with vertical stack, pass index |
| Modify | `src/i18n/en.json:57-58` | Update team subtitle |

---

## Chunk 1: Schema & Content Data

### Task 1: Add `skills` field to team collection schema

**Files:**
- Modify: `src/content.config.ts:43-54`

- [ ] **Step 1: Add skills array to team schema**

In `src/content.config.ts`, add `skills` field after `github`:

```typescript
const team = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/team/en' }),
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

- [ ] **Step 2: Commit**

```bash
git add src/content.config.ts
git commit -m "feat(team): add skills array to team collection schema"
```

### Task 2: Replace content files with real team data



- [ ] **Step 1: Delete old placeholder files**

```bash
rm src/content/team/en/team-member.mdx 
```

- [ ] **Step 2: Create abdullah-kaya.mdx**

```mdx
---
name: "Abdullah Kaya"
role: "Founder, CEO"
bio: "Experienced software professional with deep expertise in enterprise integration, database management, and cloud-native architectures. Leads Sekoya's strategic vision and technology partnerships."
photo: "https://github.com/kaya-abdullah.png"
linkedin: "https://www.linkedin.com/in/kaya-abdullah/"
github: "https://github.com/kaya-abdullah"
skills: ["Java", "Python", "TypeScript", "PL/SQL", "Spring Boot", "PostgreSQL", "MongoDB"]
order: 1
---
```

- [ ] **Step 3: Create yusuf-gundogdu.mdx**

```mdx
---
name: "Yusuf Gündoğdu"
role: "Founder, Tech Lead"
bio: "Cross-platform mobile and web developer specializing in Flutter and Dart. Drives Sekoya's technical architecture and engineering practices across all client projects."
photo: "https://github.com/yusuf-gundogdu.png"
linkedin: "https://www.linkedin.com/in/yusufgundogdu/"
github: "https://github.com/yusuf-gundogdu"
skills: ["Flutter", "Dart", "SQL Server", "PostgreSQL", "MongoDB", "iOS", "Android"]
order: 2
---
```

- [ ] **Step 4: Create suleyman-surucu.mdx**

```mdx
---
name: "Süleyman Sürücü"
role: "Software Engineer"
bio: "Flutter specialist with 5+ years of experience building high-performance cross-platform applications. Passionate about clean architecture, state management, and open-source development."
photo: "https://github.com/suleymansurucu.png"
linkedin: "https://www.linkedin.com/in/suleymansurucu/"
github: "https://github.com/suleymansurucu"
skills: ["Flutter", "Dart", "Firebase", "BLoC", "Riverpod", "CI/CD", "Swift"]
order: 3
---
```

- [ ] **Step 5: Create mehmet-ucmaz.mdx**

```mdx
---
name: "Mehmet Uçmaz"
role: "Software Engineer"
bio: "Flutter developer focused on building cross-platform mobile applications with clean architecture patterns. Experienced in both mobile and backend microservice development."
photo: "https://github.com/ucmazmehmet.png"
linkedin: "https://www.linkedin.com/in/ucmazmehmet/"
github: "https://github.com/ucmazmehmet"
skills: ["Flutter", "Dart", "BLoC", "Spring Boot", "Java", "Angular"]
order: 4
---
```

- [ ] **Step 6: Create baha-serdaroglu.mdx**

```mdx
---
name: "Baha Serdaroğlu"
role: "Intern"
bio: "Aspiring software engineer with a strong interest in AI, data science, and bioinformatics. Actively developing skills across Python, Java, and modern development workflows."
photo: "https://github.com/developerbaha.png"
linkedin: "https://www.linkedin.com/in/baha-serdaroglu/"
github: "https://github.com/developerbaha"
skills: ["Python", "Java", "AI/ML", "Docker", "FastAPI", "Data Science"]
order: 5
---
```

- [ ] **Step 7: Create ihsan-erturk.mdx**

```mdx
---
name: "İhsan Ertürk"
role: "Intern"
bio: "Mobile and web developer building skills in Flutter and cross-platform development. Exploring backend technologies with Python FastAPI and modern state management patterns."
photo: "https://github.com/ihsanerturkk.png"
linkedin: "https://www.linkedin.com/in/ihsan-ert%C3%BCrk-282b89307/"
github: "https://github.com/ihsanerturkk"
skills: ["Flutter", "Dart", "Python", "FastAPI", "BLoC", "MongoDB"]
order: 6
---
```

- [ ] **Step 8: Commit**

```bash
git add src/content/team/en/
git commit -m "feat(team): replace placeholder content with real team member data"
```

---

## Chunk 2: Component & Page Redesign

### Task 3: Rewrite TeamMember component as horizontal zigzag card

**Files:**
- Rewrite: `src/components/team/TeamMember.astro`

- [ ] **Step 1: Rewrite TeamMember.astro**

The component receives all team data plus an `index` number to determine zigzag direction.

```astro
---
interface Props {
  name: string;
  role: string;
  bio: string;
  photo?: string;
  linkedin?: string;
  github?: string;
  skills?: string[];
  index: number;
}

const { name, role, bio, photo, linkedin, github, skills = [], index } = Astro.props;
const isReversed = index % 2 !== 0;
const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
---

<article
  class:list={[
    'group bg-surface border border-border rounded-2xl p-6 md:p-8 lg:p-10',
    'hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300',
    'flex flex-col md:flex-row items-center gap-6 md:gap-10',
    isReversed && 'md:flex-row-reverse',
  ]}
>
  <!-- Avatar -->
  <div class="shrink-0">
    <div class="relative">
      <div class="w-32 h-32 md:w-40 md:h-40 lg:w-44 lg:h-44 rounded-full p-1 bg-gradient-to-br from-primary to-secondary">
        {photo ? (
          <img
            src={photo}
            alt={name}
            width={176}
            height={176}
            loading="lazy"
            decoding="async"
            class="w-full h-full rounded-full object-cover bg-surface"
          />
        ) : (
          <div class="w-full h-full rounded-full bg-surface flex items-center justify-center">
            <span class="text-3xl md:text-4xl font-bold text-primary">{initials}</span>
          </div>
        )}
      </div>
    </div>
  </div>

  <!-- Content -->
  <div class:list={[
    'flex-1 text-center md:text-left',
    isReversed && 'md:text-right',
  ]}>
    <h3 class="text-xl md:text-2xl font-bold text-text mb-1">{name}</h3>

    <span class="inline-block text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full mb-3">
      {role}
    </span>

    <p class="text-text-muted leading-relaxed mb-4 max-w-xl">{bio}</p>

    <!-- Skills -->
    {skills.length > 0 && (
      <div class:list={[
        'flex flex-wrap gap-2 mb-4',
        'justify-center md:justify-start',
        isReversed && 'md:justify-end',
      ]}>
        {skills.map((skill) => (
          <span class="text-xs font-medium text-text-muted bg-bg border border-border px-2.5 py-1 rounded-full">
            {skill}
          </span>
        ))}
      </div>
    )}

    <!-- Social Links -->
    <div class:list={[
      'flex gap-3',
      'justify-center md:justify-start',
      isReversed && 'md:justify-end',
    ]}>
      {linkedin && (
        <a
          href={linkedin}
          target="_blank"
          rel="noopener noreferrer"
          class="text-text-muted hover:text-primary transition-colors"
          aria-label={`${name} on LinkedIn`}
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
        </a>
      )}
      {github && (
        <a
          href={github}
          target="_blank"
          rel="noopener noreferrer"
          class="text-text-muted hover:text-primary transition-colors"
          aria-label={`${name} on GitHub`}
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
        </a>
      )}
    </div>
  </div>
</article>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/team/TeamMember.astro
git commit -m "feat(team): rewrite TeamMember as horizontal zigzag showcase card"
```

### Task 4: Update team page layout

**Files:**
- Modify: `src/pages/team.astro:21-31`

- [ ] **Step 1: Replace grid layout with vertical stack**

Replace the grid `<div>` block (lines 21-31) with:

```astro
<div class="flex flex-col gap-8 md:gap-12">
  {team.map((member, index) => (
    <TeamMember
      name={member.data.name}
      role={member.data.role}
      bio={member.data.bio}
      photo={member.data.photo}
      linkedin={member.data.linkedin}
      github={member.data.github}
      skills={member.data.skills}
      index={index}
    />
  ))}
</div>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/team.astro
git commit -m "feat(team): update page layout to vertical zigzag stack"
```

### Task 5: Build and verify

- [ ] **Step 1: Run Astro check**

```bash
npm run check
```

Expected: No errors.

- [ ] **Step 2: Run production build**

```bash
npm run build
```

Expected: Build succeeds, team page generates at `dist/team/index.html`.

- [ ] **Step 3: Preview and verify visually**

```bash
npm run preview
```

Open `http://localhost:4321/team/` — verify:
- 6 team members render in order
- Zigzag alternation works on desktop
- GitHub avatars load
- Skill badges display
- Social links work
- Mobile layout stacks correctly

- [ ] **Step 4: Final commit if any adjustments needed**

```bash
git add -A
git commit -m "feat(team): complete team page redesign with real member data"
```
