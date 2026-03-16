# Developer Tools Hub Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/tools/` section with 3 interactive developer tools: AI Token Calculator, Password Generator, and Developer Quiz.

**Architecture:** Pure Astro pages + vanilla TypeScript scripts. No framework dependencies. All tools client-side only. Data in JSON files. Follows existing patterns (PageLayout, Card, Button, i18n).

**Tech Stack:** Astro 6, TypeScript, Tailwind v4 (CSS theme), Heroicons via astro-icon

**Security Note:** All innerHTML usage in scripts renders data from our own JSON files or internally generated content (never user HTML input). No XSS risk because we control all data sources. Where possible, prefer textContent and DOM API over innerHTML.

---

## File Structure

### New Files
| File | Responsibility |
|------|---------------|
| `src/pages/tools/index.astro` | Hub page with 3 tool cards |
| `src/pages/tools/token-calculator.astro` | Token calculator page + HTML structure |
| `src/pages/tools/password-generator.astro` | Password generator page + HTML structure |
| `src/pages/tools/developer-quiz.astro` | Developer quiz page + HTML structure |
| `src/scripts/tools/token-calculator.ts` | Token estimation logic, debounce, model comparison, copy |
| `src/scripts/tools/password-generator.ts` | Password/passphrase/API key generation, strength meter, bulk |
| `src/scripts/tools/developer-quiz.ts` | Quiz engine: state machine, scoring, timer, sharing |
| `src/data/llm-models.json` | LLM model pricing data (10 models) |
| `src/data/eff-wordlist.json` | EFF short wordlist for passphrases (~2048 words) |
| `src/data/quiz/ai-llms.json` | AI & LLMs quiz questions (15) |
| `src/data/quiz/cloud-infra.json` | Cloud & Infrastructure quiz questions (15) |
| `src/data/quiz/devops-cicd.json` | DevOps & CI/CD quiz questions (15) |

### Modified Files
| File | Changes |
|------|---------|
| `src/lib/constants.ts` | Add "Tools" to `NAV_ITEMS` and `FOOTER_NAV` |
| `src/i18n/en.json` | Add `tools.*` and `nav.tools` keys |
| `src/lib/seo.ts` | Add `toolPageJsonLd()` function |
| `src/pages/llms-full.txt.ts` | Add tools section to AI discovery file |

---

## Chunk 1: Foundation — Navigation, i18n, SEO, Hub Page

### Task 1: Add i18n keys for tools

**Files:**
- Modify: `src/i18n/en.json`

- [ ] **Step 1: Add tools i18n keys to en.json**

Add these keys before the `"about.title"` line (after all nav/home/services keys):

```json
"nav.tools": "Tools",

"tools.title": "Developer Tools",
"tools.subtitle": "Free tools for developers, engineers, and tech leaders",
"tools.tokenCalculator.title": "AI Token & Cost Calculator",
"tools.tokenCalculator.description": "Estimate token count and cost for popular LLM models. Paste your text and compare pricing across providers.",
"tools.passwordGenerator.title": "Secure Password Generator",
"tools.passwordGenerator.description": "Generate strong passwords, passphrases, and API keys. Fully client-side — nothing leaves your browser.",
"tools.developerQuiz.title": "Developer Skill Assessment",
"tools.developerQuiz.description": "Test your knowledge in AI, Cloud, and DevOps. Share your score and challenge your peers.",
"tools.common.copy": "Copy",
"tools.common.copyAll": "Copy All",
"tools.common.clear": "Clear",
"tools.common.share": "Share",
"tools.common.regenerate": "Regenerate",
"tools.common.copied": "Copied!",
"tools.common.tryAgain": "Try Again",
"tools.common.startQuiz": "Start Quiz",
"tools.common.nextQuestion": "Next Question",
"tools.common.viewResults": "View Results",
```

- [ ] **Step 2: Verify build passes**

Run: `npm run check`
Expected: No TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add src/i18n/en.json
git commit -m "feat(tools): add i18n keys for developer tools section"
```

---

### Task 2: Update navigation and constants

**Files:**
- Modify: `src/lib/constants.ts`

- [ ] **Step 1: Add Tools to NAV_ITEMS**

Insert after the blog entry (line 24) and before team:

```typescript
{ label: 'nav.tools', href: '/tools/' },
```

So the order becomes: Home, About, Services, Portfolio, Blog, **Tools**, Team, Careers, Contact.

- [ ] **Step 2: Add Developer Tools to FOOTER_NAV resources**

Add to the `resources` array, before the privacy policy entry:

```typescript
{ label: 'tools.title', href: '/tools/' },
```

- [ ] **Step 3: Verify build passes**

Run: `npm run check`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/lib/constants.ts
git commit -m "feat(tools): add Tools to navigation and footer"
```

---

### Task 3: Add SEO toolPageJsonLd

**Files:**
- Modify: `src/lib/seo.ts`

- [ ] **Step 1: Add toolPageJsonLd function**

Add after the `faqPageJsonLd` function at the end of the file:

```typescript
export function toolPageJsonLd(tool: {
  name: string;
  description: string;
  url: string;
}) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.name,
    description: tool.description,
    url: `${SITE.url}${tool.url}`,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    provider: {
      '@type': 'Organization',
      name: SITE.fullName,
      url: SITE.url,
    },
  });
}
```

- [ ] **Step 2: Verify build passes**

Run: `npm run check`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/lib/seo.ts
git commit -m "feat(tools): add WebApplication JSON-LD for tool pages"
```

---

### Task 4: Create Tools Hub page

**Files:**
- Create: `src/pages/tools/index.astro`

- [ ] **Step 1: Create the hub page**

```astro
---
import PageLayout from '../../layouts/PageLayout.astro';
import Card from '../../components/ui/Card.astro';
import { Icon } from 'astro-icon/components';
import { useTranslations } from '../../i18n/utils';
import { toolPageJsonLd } from '../../lib/seo';

const t = useTranslations();

const tools = [
  {
    title: t('tools.tokenCalculator.title'),
    description: t('tools.tokenCalculator.description'),
    icon: 'calculator',
    href: '/tools/token-calculator/',
  },
  {
    title: t('tools.passwordGenerator.title'),
    description: t('tools.passwordGenerator.description'),
    icon: 'lock-closed',
    href: '/tools/password-generator/',
  },
  {
    title: t('tools.developerQuiz.title'),
    description: t('tools.developerQuiz.description'),
    icon: 'academic-cap',
    href: '/tools/developer-quiz/',
  },
];
---

<PageLayout
  title={t('tools.title')}
  description={t('tools.subtitle')}
  heroTitle={t('tools.title')}
  heroDescription={t('tools.subtitle')}
  breadcrumbs={[
    { name: 'Home', href: '/' },
    { name: t('tools.title'), href: '/tools/' },
  ]}
>
  <Fragment slot="head">
    {tools.map((tool) => (
      <script type="application/ld+json" set:html={toolPageJsonLd({ name: tool.title, description: tool.description, url: tool.href })} />
    ))}
  </Fragment>

  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-reveal-stagger>
    {tools.map((tool) => (
      <a href={tool.href} class="group block">
        <Card class="h-full group-hover:border-primary/30">
          <div class="flex flex-col h-full">
            <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Icon name={`heroicons:${tool.icon}`} class="w-6 h-6 text-primary" />
            </div>
            <h3 class="text-lg font-semibold text-text mb-2 group-hover:text-primary transition-colors">
              {tool.title}
            </h3>
            <p class="text-sm text-text-muted flex-1 leading-relaxed">
              {tool.description}
            </p>
            <span class="mt-4 text-sm font-medium text-primary inline-flex items-center gap-1">
              Open Tool
              <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </div>
        </Card>
      </a>
    ))}
  </div>
</PageLayout>
```

- [ ] **Step 2: Verify build and visual check**

Run: `npm run build`
Expected: Build succeeds, `/tools/` page generated

Run: `npm run dev` and visit `http://localhost:4321/tools/`
Expected: Hub page with 3 cards, proper breadcrumbs, nav shows "Tools"

- [ ] **Step 3: Commit**

```bash
git add src/pages/tools/index.astro
git commit -m "feat(tools): create tools hub page with 3 tool cards"
```

---

## Chunk 2: AI Token & Cost Calculator

### Task 5: Create LLM models data

**Files:**
- Create: `src/data/llm-models.json`

- [ ] **Step 1: Create the pricing data file**

```json
[
  {
    "provider": "Anthropic",
    "model": "Claude Opus 4",
    "inputPer1M": 15.00,
    "outputPer1M": 75.00,
    "contextWindow": 200000
  },
  {
    "provider": "Anthropic",
    "model": "Claude Sonnet 4",
    "inputPer1M": 3.00,
    "outputPer1M": 15.00,
    "contextWindow": 200000
  },
  {
    "provider": "Anthropic",
    "model": "Claude Haiku 3.5",
    "inputPer1M": 0.80,
    "outputPer1M": 4.00,
    "contextWindow": 200000
  },
  {
    "provider": "OpenAI",
    "model": "GPT-4o",
    "inputPer1M": 2.50,
    "outputPer1M": 10.00,
    "contextWindow": 128000
  },
  {
    "provider": "OpenAI",
    "model": "GPT-4o mini",
    "inputPer1M": 0.15,
    "outputPer1M": 0.60,
    "contextWindow": 128000
  },
  {
    "provider": "OpenAI",
    "model": "GPT-o1",
    "inputPer1M": 15.00,
    "outputPer1M": 60.00,
    "contextWindow": 200000
  },
  {
    "provider": "Google",
    "model": "Gemini 2.5 Pro",
    "inputPer1M": 1.25,
    "outputPer1M": 10.00,
    "contextWindow": 1000000
  },
  {
    "provider": "Google",
    "model": "Gemini 2.0 Flash",
    "inputPer1M": 0.10,
    "outputPer1M": 0.40,
    "contextWindow": 1000000
  },
  {
    "provider": "Meta",
    "model": "Llama 3.3 70B",
    "inputPer1M": 0.60,
    "outputPer1M": 0.60,
    "contextWindow": 128000
  },
  {
    "provider": "Mistral",
    "model": "Mistral Large",
    "inputPer1M": 2.00,
    "outputPer1M": 6.00,
    "contextWindow": 128000
  }
]
```

- [ ] **Step 2: Commit**

```bash
git add src/data/llm-models.json
git commit -m "feat(tools): add LLM model pricing data for token calculator"
```

---

### Task 6: Create token calculator TypeScript logic

**Files:**
- Create: `src/scripts/tools/token-calculator.ts`

- [ ] **Step 1: Create the script**

This script handles token estimation from text, live updates with debounce, model comparison, copy results.

All DOM updates use textContent or safe DOM API methods. The comparison table is the only part using element creation via DOM API (not innerHTML with user content). The table data comes exclusively from our own llm-models.json.

The implementation should use `document.createElement` and `element.textContent` for building table rows rather than template string concatenation. Use helper functions like:

```typescript
function createTableRow(cells: { text: string; className?: string }[], rowClass?: string): HTMLTableRowElement {
  const tr = document.createElement('tr');
  if (rowClass) tr.className = rowClass;
  for (const cell of cells) {
    const td = document.createElement('td');
    td.textContent = cell.text;
    td.className = cell.className || 'py-2 px-3 text-sm';
    tr.appendChild(td);
  }
  return tr;
}
```

Key logic:
- Token estimation heuristic: `tokens = words * 1.3` with code detection (x1.5) and non-Latin character adjustment (x1.5)
- Cost calculation: `(tokens / 1M) * pricePerM`
- 300ms debounce on textarea input
- Output multiplier: 1x/2x/3x/5x toggle buttons
- Copy results to clipboard
- Plausible analytics event on first use

Full implementation details are in the spec at `docs/superpowers/specs/2026-03-16-developer-tools-hub-design.md`.

- [ ] **Step 2: Commit**

```bash
git add src/scripts/tools/token-calculator.ts
git commit -m "feat(tools): add token calculator TypeScript logic"
```

---

### Task 7: Create token calculator page

**Files:**
- Create: `src/pages/tools/token-calculator.astro`

- [ ] **Step 1: Create the page**

Uses PageLayout with breadcrumbs (Home > Tools > AI Token & Cost Calculator). Structure:

1. Hidden data carrier: `<div data-models={JSON.stringify(models)} class="hidden">`
2. Model selector: `<select data-model-select>` populated from llm-models.json at build time
3. Text input: `<textarea data-token-input>` with placeholder
4. Results panel: Stats row (chars/words/tokens), cost breakdown (input/output/total), output multiplier buttons
5. Model comparison table: `<table>` with `<tbody data-token-table-body>`
6. Action buttons: Copy Results, Clear
7. CTA: Link to AI services page

All interactive elements use `data-*` attributes for JS binding. Script loaded via `<script src="../../scripts/tools/token-calculator.ts">`.

See spec for exact UI layout.

- [ ] **Step 2: Verify build and visual check**

Run: `npm run build && npm run dev`
Visit: `http://localhost:4321/tools/token-calculator/`
Expected: Calculator renders, typing text updates counts and costs live

- [ ] **Step 3: Commit**

```bash
git add src/pages/tools/token-calculator.astro
git commit -m "feat(tools): create AI token & cost calculator page"
```

---

## Chunk 3: Secure Password Generator

### Task 8: Create EFF wordlist data

**Files:**
- Create: `src/data/eff-wordlist.json`
- Create: `public/data/eff-wordlist.json` (copy for fetch at runtime)

- [ ] **Step 1: Create the wordlist**

JSON array of ~1000+ common English words from EFF short wordlist. Source from: https://www.eff.org/dice

```bash
mkdir -p public/data
```

Create `src/data/eff-wordlist.json` as a JSON array of strings. Then copy to `public/data/eff-wordlist.json` for runtime fetch.

- [ ] **Step 2: Commit**

```bash
git add src/data/eff-wordlist.json public/data/eff-wordlist.json
git commit -m "feat(tools): add EFF wordlist for passphrase generator"
```

---

### Task 9: Create password generator TypeScript logic

**Files:**
- Create: `src/scripts/tools/password-generator.ts`

- [ ] **Step 1: Create the script**

Three generation modes: Password, Passphrase, API Key. All use `crypto.getRandomValues()` (never Math.random).

Key implementation details:
- **Password mode**: Configurable charset (upper/lower/numbers/symbols), exclude ambiguous, length 8-128
- **Passphrase mode**: Lazy-loads EFF wordlist via fetch, configurable word count (3-10), separator, capitalize, include number
- **API Key mode**: Hex/Base64/UUID formats, optional custom prefix
- **Strength meter**: Shannon entropy calculation with color-coded bar (Weak/Fair/Strong/Very Strong)
- **Crack time**: `2^entropy / 10B guesses per sec` formatted as human-readable time
- **Bulk generation**: 1-20 passwords, individual copy + copy all

DOM manipulation should use `document.createElement` and `textContent` for building bulk list items. The only generated content is passwords/passphrases (plain text, no HTML).

Uses Plausible analytics event on first generation.

- [ ] **Step 2: Commit**

```bash
git add src/scripts/tools/password-generator.ts
git commit -m "feat(tools): add password generator TypeScript logic"
```

---

### Task 10: Create password generator page

**Files:**
- Create: `src/pages/tools/password-generator.astro`

- [ ] **Step 1: Create the page**

Uses PageLayout with breadcrumbs (Home > Tools > Secure Password Generator). Structure:

1. Mode selector: 3 toggle buttons (Password / Passphrase / API Key)
2. Generated output: `<code data-pw-output>` in a card with Regenerate and Copy buttons
3. Password options panel (`data-mode-panel="password"`): Length slider, checkbox toggles
4. Passphrase options panel (`data-mode-panel="passphrase"`, hidden by default): Word count slider, separator buttons, capitalize/number toggles
5. API Key options panel (`data-mode-panel="apikey"`, hidden by default): Format select, prefix input
6. Strength meter: Progress bar with entropy and crack time display
7. Bulk generation: Count selector, list of generated passwords with individual copy
8. Security notice: "Your passwords never leave your browser"
9. CTA: Link to custom app development services

All interactive elements use `data-*` attributes. Script loaded via `<script src="../../scripts/tools/password-generator.ts">`.

- [ ] **Step 2: Verify build and visual check**

Run: `npm run build && npm run dev`
Visit: `http://localhost:4321/tools/password-generator/`
Expected: Password generates on load, mode switching works, strength meter updates

- [ ] **Step 3: Commit**

```bash
git add src/pages/tools/password-generator.astro
git commit -m "feat(tools): create secure password generator page"
```

---

## Chunk 4: Developer Quiz

### Task 11: Create quiz question data

**Files:**
- Create: `src/data/quiz/ai-llms.json`
- Create: `src/data/quiz/cloud-infra.json`
- Create: `src/data/quiz/devops-cicd.json`

- [ ] **Step 1: Create AI & LLMs questions (15)**

JSON structure per file:
```json
{
  "category": "AI & LLMs",
  "icon": "cpu-chip",
  "slug": "ai-llms",
  "ctaText": "See how we build AI solutions",
  "ctaHref": "/services/artificial-intelligence/",
  "questions": [
    {
      "question": "What does 'RAG' stand for in LLM applications?",
      "options": ["Rapid Application Generation", "Retrieval-Augmented Generation", "Real-time Adaptive Gateway", "Recursive Agent Graph"],
      "correct": 1,
      "explanation": "RAG combines retrieval systems with LLMs to ground responses in external knowledge, reducing hallucinations."
    }
  ]
}
```

Topics to cover: Transformers, RAG, fine-tuning, temperature, tokens, prompt engineering, hallucinations, context window, embeddings, AI agents, RLHF, vector databases, quantization, chain-of-thought, model distillation.

- [ ] **Step 2: Create Cloud & Infrastructure questions (15)**

Same JSON structure with `"category": "Cloud & Infrastructure"`, `"icon": "cloud"`, `"slug": "cloud-infra"`, `"ctaHref": "/services/devops-cloud/"`.

Topics: AWS/GCP/Azure core services, serverless (Lambda/Cloud Functions), S3/storage, IAM, VPC/networking, auto-scaling, CDN, regions/AZs, managed databases, containers vs VMs, IaaS/PaaS/SaaS, cost optimization, multi-cloud, edge computing, load balancing.

- [ ] **Step 3: Create DevOps & CI/CD questions (15)**

Same structure with `"category": "DevOps & CI/CD"`, `"icon": "wrench-screwdriver"`, `"slug": "devops-cicd"`, `"ctaHref": "/services/devops-cloud/"`.

Topics: Docker (images/containers/volumes), Kubernetes (pods/services/deployments), IaC (Terraform/Pulumi), CI/CD pipelines, GitOps, monitoring (Prometheus/Grafana), logging, blue-green/canary deployments, secrets management, SRE/SLOs, containerregistries, Helm, service mesh, observability, git branching strategies.

- [ ] **Step 4: Commit**

```bash
mkdir -p src/data/quiz
git add src/data/quiz/
git commit -m "feat(tools): add quiz question data for 3 categories"
```

---

### Task 12: Create developer quiz TypeScript logic

**Files:**
- Create: `src/scripts/tools/developer-quiz.ts`

- [ ] **Step 1: Create the quiz engine**

State machine with 3 screens: categories, question, results.

Key implementation:
- Categories loaded from `data-quiz-data` attributes on hidden divs (build-time JSON injection)
- Random selection of 10 from 15 questions per session (using `crypto.getRandomValues` for shuffle)
- Instant feedback on answer selection (correct/wrong + explanation)
- Progress bar animation
- Timer tracking (start on quiz begin, stop on last answer)
- Score levels: Beginner (0-3), Intermediate (4-6), Advanced (7-8), Expert (9-10) with category-specific badges
- Share buttons: LinkedIn, X (pre-filled text), Copy Result
- Analytics: Plausible event on quiz completion

DOM updates must use safe methods:
- Use `element.textContent` for text content
- Use `document.createElement` + `appendChild` for building option buttons and review items
- Use `element.classList` for styling changes
- Quiz question options contain only plain text from our JSON (no HTML), so textContent is appropriate

- [ ] **Step 2: Commit**

```bash
git add src/scripts/tools/developer-quiz.ts
git commit -m "feat(tools): add developer quiz TypeScript engine"
```

---

### Task 13: Create developer quiz page

**Files:**
- Create: `src/pages/tools/developer-quiz.astro`

- [ ] **Step 1: Create the page**

Uses PageLayout with breadcrumbs (Home > Tools > Developer Skill Assessment). Structure:

**Hidden data carriers** (build-time injection):
```astro
{quizCategories.map((cat) => (
  <div data-quiz-data={JSON.stringify(cat)} class="hidden"></div>
))}
```

**Screen 1 - Category Selection** (`data-screen="categories"`):
- Centered intro text
- 3-column grid (`data-category-grid`) populated by JS from data carriers

**Screen 2 - Question** (`data-screen="question"`, hidden by default):
- Card with: category name, progress counter, progress bar
- Question text (`data-quiz-question`)
- Options container (`data-quiz-options`) — populated by JS
- Feedback area (`data-quiz-feedback`, `aria-live="polite"`)
- Next button (`data-quiz-next`)

**Screen 3 - Results** (`data-screen="results"`, hidden by default):
- Score card: big score number, badge title, stats (correct/wrong/time)
- Share buttons: LinkedIn, X, Copy Result
- Question review list (`data-result-review`)
- Actions: Try Again, Try Another Topic
- CTA container (`data-result-cta`) — populated by JS with link to relevant service

Script loaded via `<script src="../../scripts/tools/developer-quiz.ts">`.

- [ ] **Step 2: Verify build and visual check**

Run: `npm run build && npm run dev`
Visit: `http://localhost:4321/tools/developer-quiz/`
Expected: Category selection shows, quiz flow works end-to-end, results display correctly

- [ ] **Step 3: Commit**

```bash
git add src/pages/tools/developer-quiz.astro
git commit -m "feat(tools): create developer quiz page with 3 categories"
```

---

## Chunk 5: Final Integration

### Task 14: Update llms-full.txt.ts

**Files:**
- Modify: `src/pages/llms-full.txt.ts`

- [ ] **Step 1: Add tools section**

After the Blog Articles section (before Contact section, around line 105), add:

```typescript
// Developer Tools
lines.push('## Developer Tools');
lines.push('');
lines.push('Free interactive tools for developers, engineers, and tech leaders.');
lines.push('');
lines.push('### AI Token & Cost Calculator');
lines.push('Estimate token count and cost for popular LLM models. Paste your text and compare pricing across providers.');
lines.push(`URL: ${SITE.url}/tools/token-calculator/`);
lines.push('');
lines.push('### Secure Password Generator');
lines.push('Generate strong passwords, passphrases, and API keys. Fully client-side — nothing leaves your browser.');
lines.push(`URL: ${SITE.url}/tools/password-generator/`);
lines.push('');
lines.push('### Developer Skill Assessment');
lines.push('Test your knowledge in AI, Cloud, and DevOps. Share your score and challenge your peers.');
lines.push(`URL: ${SITE.url}/tools/developer-quiz/`);
lines.push('');
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds, llms-full.txt includes tools section

- [ ] **Step 3: Commit**

```bash
git add src/pages/llms-full.txt.ts
git commit -m "feat(tools): add developer tools to AI discovery file"
```

---

### Task 15: Full build verification and final commit

- [ ] **Step 1: Run full build**

Run: `npm run build`
Expected: Build succeeds with zero errors

- [ ] **Step 2: Run type checking**

Run: `npm run check`
Expected: No TypeScript errors

- [ ] **Step 3: Visual verification checklist**

Run: `npm run dev` and verify:
- [ ] `/tools/` — Hub shows 3 tool cards, nav has "Tools" link
- [ ] `/tools/token-calculator/` — Text input works, live updates, model comparison table populates
- [ ] `/tools/password-generator/` — All 3 modes work, strength meter updates, bulk generation works, copy buttons work
- [ ] `/tools/developer-quiz/` — Category select works, questions render, scoring works, results display correctly, share buttons work
- [ ] Footer shows "Developer Tools" in Resources section
- [ ] Mobile nav shows "Tools" entry
- [ ] Dark/light theme works correctly on all tool pages
- [ ] Breadcrumbs render correctly on all pages

- [ ] **Step 4: Final integration commit (if any fixes needed)**

```bash
git add -A
git commit -m "feat(tools): finalize developer tools hub integration"
```
