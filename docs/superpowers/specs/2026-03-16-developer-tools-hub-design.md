# Developer Tools Hub — Design Spec

**Date:** 2026-03-16
**Status:** Approved
**Approach:** Pure Astro + TypeScript (no framework dependencies)

## Overview

Add a `/tools/` section to sekoya.tech with 3 MVP interactive tools targeting developers (SEO traffic) and gamification (viral sharing). All tools are client-side only, zero backend dependencies, compatible with GitHub Pages static hosting.

### Goals
- Drive organic SEO traffic via evergreen developer tools
- Increase brand memorability through gamification
- Subtle lead generation via contextual CTAs linking to Sekoya services
- Serve both technical audience (developers, DevOps engineers) and decision makers

### Non-Goals
- No backend/API requirements
- No user accounts or data persistence
- No paid features or gating

## Architecture

### Routing

```
/tools/                    → Hub page (src/pages/tools/index.astro)
/tools/token-calculator/   → AI Token & Cost Calculator
/tools/password-generator/ → Secure Password Generator
/tools/developer-quiz/     → Developer Skill Assessment
```

### File Structure

```
src/pages/tools/
  index.astro                    → Hub page
  token-calculator.astro         → Token calculator page
  password-generator.astro       → Password generator page
  developer-quiz.astro           → Developer quiz page

src/scripts/tools/
  token-calculator.ts            → Token calculator logic
  password-generator.ts          → Password generator logic
  developer-quiz.ts              → Quiz engine (state, scoring, timer)

src/data/
  llm-models.json                → LLM model pricing data
  eff-wordlist.json              → EFF wordlist for passphrases (~2048 words)
  quiz/
    ai-llms.json                 → AI & LLMs questions (15)
    cloud-infra.json             → Cloud & Infrastructure questions (15)
    devops-cicd.json             → DevOps & CI/CD questions (15)
```

### Navigation Changes

- Add "Tools" to `NAV_ITEMS` in `src/lib/constants.ts`
- Add "Developer Tools" to `FOOTER_NAV` Resources section
- Add `tools.*` keys to `src/i18n/en.json`
- Update `llms-full.txt.ts` to list tools

### Layout

All tool pages use `PageLayout` (hero + breadcrumbs: Home > Tools > [Tool Name]). Tool UI lives inside a `bg-surface` card with `border-border`. Each page ends with a contextual CTA linking to a relevant Sekoya service.

### SEO

- Each tool page: `<title>`, `<meta description>`, OG tags
- Add `toolPageJsonLd()` to `src/lib/seo.ts` using `WebApplication` schema type
- Update `llms-full.txt.ts` to include tools

### Analytics

Plausible custom events (cookieless, no extra config):
- `Tool Used: Token Calculator`
- `Tool Used: Password Generator`
- `Quiz Completed: [Category] - [Score]/10`

---

## Tool 1: AI/LLM Token & Cost Calculator

### Purpose
User pastes/types text, selects an LLM model, sees estimated token count and cost breakdown. Includes model comparison table.

### UI Components

1. **Model selector** — Dropdown populated from `llm-models.json`
2. **Text input** — Large textarea, placeholder prompts user to paste text
3. **Live results panel** — Updates on input (300ms debounce):
   - Character count, word count
   - Estimated token count
   - Cost breakdown (input cost, output cost, total)
4. **Output multiplier toggle** — [1x] [2x] [3x] [5x] buttons to estimate output cost relative to input
5. **Model comparison table** — All models with costs for current text, selected model highlighted
6. **Action buttons** — Copy Results, Clear

### Token Estimation Logic

Client-side heuristic (no real tokenizer dependency):
```
tokens ≈ words × 1.3  (English text baseline)
```
Adjustments:
- Code detection (higher token/word ratio): × 1.5
- Non-Latin characters (Turkish, CJK etc.): × 1.5

UI clearly labels all values as "Estimated". Accuracy target: ~90%.

### Model Pricing Data (`src/data/llm-models.json`)

```json
[
  {
    "provider": "Anthropic",
    "model": "Claude 4 Sonnet",
    "inputPer1M": 3.00,
    "outputPer1M": 15.00,
    "contextWindow": 200000
  }
]
```

Fields: `provider`, `model`, `inputPer1M` ($/1M input tokens), `outputPer1M` ($/1M output tokens), `contextWindow`.

Models to include: Claude 4 Sonnet, Claude 4 Opus, Claude 3.5 Haiku, GPT-4o, GPT-4o mini, GPT-o1, Gemini 2.5 Pro, Gemini 2.0 Flash, Llama 3.3 70B, Mistral Large.

### Responsive
- Mobile: Table scrolls horizontally
- Textarea full width on all breakpoints

---

## Tool 2: Secure Password / Secret Generator

### Purpose
Generate strong passwords, passphrases, and API keys with customizable options. Strength meter and bulk generation.

### 3 Modes

#### Password Mode
- Length slider: 8–128 characters (default: 16)
- Toggles: uppercase, lowercase, numbers, symbols, exclude ambiguous (0/O, l/1/I)
- Auto-regenerates on any option change

#### Passphrase Mode
- Word count: 3–10 (default: 4)
- Separator options: [-] [_] [.] [space]
- Toggles: capitalize words, include number
- Wordlist: EFF short wordlist (~2048 words) stored in `src/data/eff-wordlist.json` (~7KB gzip)

#### API Key Mode
- Preset formats: Hex (32/64 char), Base64 (32/64 char), UUID v4
- Custom prefix input (e.g., `sk_live_`, `pk_test_`)

### Strength Meter

Shannon entropy calculation:
```
entropy = length × log2(charset_size)
```

| Entropy | Level | Color |
|---------|-------|-------|
| 0–40 bits | Weak | Red |
| 40–60 bits | Fair | Orange |
| 60–80 bits | Strong | Yellow-green |
| 80+ bits | Very Strong | Green |

Crack time estimate: `2^entropy / 10_000_000_000` (10B guesses/sec) displayed in human-readable time.

### Bulk Generation
- Count selector: 1–20 (default: 5)
- Individual copy button per password
- "Copy All" button
- Same settings applied to all

### Security
- Uses `crypto.getRandomValues()` (NOT `Math.random()`)
- Nothing sent over network — fully client-side
- Visible notice: "Your passwords never leave your browser"

### Responsive
- Slider: min 44px touch target
- Full-width layout on mobile

---

## Tool 3: Developer Quiz / Skill Assessment

### Purpose
Short, fun quiz to test developer knowledge in AI/DevOps/Cloud. Shareable score card with viral potential.

### Flow
```
[Category Select] → [10 Questions] → [Result Card] → [Share / Retry]
```

### Categories (3)
1. **AI & LLMs** — Transformers, RAG, fine-tuning, prompt engineering, model selection
2. **Cloud & Infrastructure** — AWS/GCP/Azure services, serverless, containers, networking
3. **DevOps & CI/CD** — Docker, Kubernetes, IaC, pipelines, monitoring, GitOps

### Question Format

Each category has 15 questions in its JSON file. Per session, **10 random questions** are selected (replay value).

```json
{
  "category": "AI & LLMs",
  "icon": "cpu-chip",
  "questions": [
    {
      "question": "What does 'RAG' stand for in LLM applications?",
      "options": [
        "Rapid Application Generation",
        "Retrieval-Augmented Generation",
        "Real-time Adaptive Gateway",
        "Recursive Agent Graph"
      ],
      "correct": 1,
      "explanation": "RAG combines retrieval systems with LLMs to ground responses in external knowledge."
    }
  ]
}
```

### Quiz Mechanics
- 4 options per question (single correct answer)
- Instant feedback on selection: correct/wrong + explanation shown
- Progress bar animates forward
- Timer runs in background (displayed on result screen)
- No going back to previous questions

### Scoring

| Score | Level | Badge |
|-------|-------|-------|
| 0–3 / 10 | Beginner | Curious Explorer |
| 4–6 / 10 | Intermediate | Skilled Practitioner |
| 7–8 / 10 | Advanced | AI Architect / Cloud Strategist / DevOps Master |
| 9–10 / 10 | Expert | Grandmaster |

### Result Screen
- Score card with badge and level title
- Per-question breakdown: correct/wrong, correct answer for wrong ones
- Total time taken
- Action buttons: Share on LinkedIn, Share on X, Copy Result, Try Again, Try Another Topic

### Sharing
- Pre-filled share text: `"I scored 8/10 on the AI & LLMs quiz at sekoya.tech/tools/developer-quiz — AI Architect level! Can you beat my score?"`
- Score NOT encoded in URL (prevents cheating)
- Share is text-only, links to the quiz page

### CTA
Result screen includes: "Want to level up your [category] skills with real projects? [See how we build [category] solutions →]" linking to relevant Sekoya service page.

---

## Cross-cutting Concerns

### Accessibility
- All interactive elements: `aria-label` attributes
- Keyboard navigation: Tab, Enter, Space
- Live regions: `aria-live="polite"` on result/output areas
- Respects `prefers-reduced-motion`

### Performance
- Tool scripts load only on their own page (per-page `<script>`)
- EFF wordlist: lazy-loaded when passphrase mode is selected
- Quiz data: imported at build time via Astro JSON import
- Token calculator: 300ms debounce on input

### i18n Keys (added to `src/i18n/en.json`)
```
tools.title
tools.description
tools.tokenCalculator.title
tools.tokenCalculator.description
tools.passwordGenerator.title
tools.passwordGenerator.description
tools.developerQuiz.title
tools.developerQuiz.description
tools.common.copy
tools.common.clear
tools.common.share
tools.common.regenerate
```

### Existing Components Reused
- `PageLayout.astro` — Page structure
- `Button.astro` — All CTA and action buttons
- `Card.astro` — Tool card containers
- `Badge.astro` — Score badges, category labels
- `Section.astro` — Section wrappers
- Theme system — All colors via CSS custom properties (`bg-bg`, `text-text`, `bg-surface`, etc.)

### Future Expansion
The `/tools/` hub is designed to grow. Adding a new tool means:
1. Create `src/pages/tools/[new-tool].astro`
2. Create `src/scripts/tools/[new-tool].ts`
3. Add data files if needed
4. Add card to hub page
5. Add i18n keys

No structural changes needed — the hub grid auto-expands.
