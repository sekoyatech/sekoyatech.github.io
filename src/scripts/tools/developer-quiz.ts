interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface QuizCategory {
  category: string;
  icon: string;
  slug: string;
  ctaText: string;
  ctaHref: string;
  questions: QuizQuestion[];
}

interface QuizState {
  screen: 'categories' | 'question' | 'results';
  category: QuizCategory | null;
  questions: QuizQuestion[];
  currentIndex: number;
  score: number;
  answers: { questionIndex: number; selectedOption: number; correct: boolean }[];
  startTime: number;
  endTime: number;
  answered: boolean;
}

const QUESTIONS_PER_SESSION = 10;

let state: QuizState = createInitialState();
let categories: QuizCategory[] = [];

function createInitialState(): QuizState {
  return {
    screen: 'categories',
    category: null,
    questions: [],
    currentIndex: 0,
    score: 0,
    answers: [],
    startTime: 0,
    endTime: 0,
    answered: false,
  };
}

// --- Utility: Secure shuffle using crypto.getRandomValues ---

function secureShuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  const randomValues = new Uint32Array(copy.length);
  crypto.getRandomValues(randomValues);

  // Fisher-Yates shuffle with cryptographic randomness
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randomValues[i] % (i + 1);
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }

  return copy;
}

// --- Screen management ---

function showScreen(screenName: 'categories' | 'question' | 'results'): void {
  const screens = document.querySelectorAll<HTMLElement>('[data-screen]');
  screens.forEach((screen) => {
    const name = screen.getAttribute('data-screen');
    if (name === screenName) {
      screen.classList.remove('hidden');
      screen.removeAttribute('aria-hidden');
    } else {
      screen.classList.add('hidden');
      screen.setAttribute('aria-hidden', 'true');
    }
  });
  state.screen = screenName;
}

// --- Category grid rendering ---

function bindCategoryGrid(): void {
  // Category cards are server-rendered by Astro — just attach click handlers
  const buttons = document.querySelectorAll<HTMLElement>('[data-start-category]');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const slug = btn.getAttribute('data-start-category');
      if (slug) startQuiz(slug);
    });
  });
}

// --- Quiz logic ---

function startQuiz(slug: string): void {
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) return;

  const shuffled = secureShuffleArray(cat.questions);
  const selected = shuffled.slice(0, QUESTIONS_PER_SESSION);

  state = {
    ...createInitialState(),
    screen: 'question',
    category: cat,
    questions: selected,
    startTime: Date.now(),
  };

  showScreen('question');
  renderQuestion();
}

function renderQuestion(): void {
  const q = state.questions[state.currentIndex];
  if (!q) return;

  state.answered = false;

  // Update category label
  const catLabel = document.querySelector<HTMLElement>('[data-quiz-category]');
  if (catLabel && state.category) {
    catLabel.textContent = state.category.category;
  }

  // Update progress text
  const progressText = document.querySelector<HTMLElement>('[data-quiz-progress]');
  if (progressText) {
    progressText.textContent =
      'Question ' + (state.currentIndex + 1) + ' of ' + state.questions.length;
  }

  // Update progress bar
  const progressBar = document.querySelector<HTMLElement>('[data-quiz-progress-bar]');
  if (progressBar) {
    const pct = ((state.currentIndex) / state.questions.length) * 100;
    progressBar.style.width = pct + '%';
  }

  // Update question text
  const questionEl = document.querySelector<HTMLElement>('[data-quiz-question]');
  if (questionEl) {
    questionEl.textContent = q.question;
  }

  // Render options
  const optionsContainer = document.querySelector<HTMLElement>('[data-quiz-options]');
  if (optionsContainer) {
    while (optionsContainer.firstChild) {
      optionsContainer.removeChild(optionsContainer.firstChild);
    }

    q.options.forEach((option, idx) => {
      const btn = document.createElement('button');
      btn.className =
        'w-full text-left px-4 py-3 rounded-lg border border-border bg-surface hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 text-text cursor-pointer';
      btn.setAttribute('data-option-index', String(idx));

      const label = document.createElement('span');
      label.className = 'flex items-start gap-3';

      const badge = document.createElement('span');
      badge.className =
        'flex-shrink-0 w-7 h-7 rounded-full border border-border flex items-center justify-center text-sm font-medium text-text-muted';
      badge.textContent = String.fromCharCode(65 + idx); // A, B, C, D

      const text = document.createElement('span');
      text.className = 'pt-0.5';
      text.textContent = option;

      label.appendChild(badge);
      label.appendChild(text);
      btn.appendChild(label);

      btn.addEventListener('click', () => handleAnswer(idx));

      optionsContainer.appendChild(btn);
    });
  }

  // Hide feedback
  const feedback = document.querySelector<HTMLElement>('[data-quiz-feedback]');
  if (feedback) {
    feedback.classList.add('hidden');
    while (feedback.firstChild) {
      feedback.removeChild(feedback.firstChild);
    }
  }

  // Hide next button
  const nextBtn = document.querySelector<HTMLElement>('[data-quiz-next]');
  if (nextBtn) {
    nextBtn.classList.add('hidden');
  }
}

function handleAnswer(selectedIndex: number): void {
  if (state.answered) return;
  state.answered = true;

  const q = state.questions[state.currentIndex];
  const isCorrect = selectedIndex === q.correct;

  if (isCorrect) {
    state.score++;
  }

  state.answers.push({
    questionIndex: state.currentIndex,
    selectedOption: selectedIndex,
    correct: isCorrect,
  });

  // Highlight options
  const optionsContainer = document.querySelector<HTMLElement>('[data-quiz-options]');
  if (optionsContainer) {
    const buttons = optionsContainer.querySelectorAll<HTMLButtonElement>('button');
    buttons.forEach((btn, idx) => {
      btn.disabled = true;
      btn.classList.remove('hover:border-primary/50', 'hover:bg-primary/5', 'cursor-pointer');
      btn.classList.add('cursor-default');

      if (idx === q.correct) {
        btn.classList.remove('border-border', 'bg-surface');
        btn.classList.add('border-green-500', 'bg-green-500/10');
        const badge = btn.querySelector('span > span:first-child');
        if (badge) {
          badge.classList.remove('border-border', 'text-text-muted');
          badge.classList.add('border-green-500', 'text-green-500', 'bg-green-500/20');
        }
      } else if (idx === selectedIndex && !isCorrect) {
        btn.classList.remove('border-border', 'bg-surface');
        btn.classList.add('border-red-500', 'bg-red-500/10');
        const badge = btn.querySelector('span > span:first-child');
        if (badge) {
          badge.classList.remove('border-border', 'text-text-muted');
          badge.classList.add('border-red-500', 'text-red-500', 'bg-red-500/20');
        }
      }
    });
  }

  // Show feedback
  const feedback = document.querySelector<HTMLElement>('[data-quiz-feedback]');
  if (feedback) {
    while (feedback.firstChild) {
      feedback.removeChild(feedback.firstChild);
    }

    const statusEl = document.createElement('div');
    statusEl.className = 'flex items-center gap-2 mb-2';

    const statusIcon = document.createElement('span');
    statusIcon.className = isCorrect
      ? 'text-green-500 font-bold text-lg'
      : 'text-red-500 font-bold text-lg';
    statusIcon.textContent = isCorrect ? '\u2713 Correct!' : '\u2717 Incorrect';

    statusEl.appendChild(statusIcon);

    const explanationEl = document.createElement('p');
    explanationEl.className = 'text-sm text-text-muted leading-relaxed';
    explanationEl.textContent = q.explanation;

    feedback.appendChild(statusEl);
    feedback.appendChild(explanationEl);
    feedback.classList.remove('hidden');
  }

  // Update progress bar to reflect answered state
  const progressBar = document.querySelector<HTMLElement>('[data-quiz-progress-bar]');
  if (progressBar) {
    const pct = ((state.currentIndex + 1) / state.questions.length) * 100;
    progressBar.style.width = pct + '%';
  }

  // Show next button
  const nextBtn = document.querySelector<HTMLElement>('[data-quiz-next]');
  if (nextBtn) {
    const isLast = state.currentIndex === state.questions.length - 1;
    nextBtn.textContent = isLast ? 'View Results' : 'Next Question';
    nextBtn.classList.remove('hidden');
    nextBtn.focus();
  }
}

function handleNext(): void {
  if (state.currentIndex >= state.questions.length - 1) {
    // Quiz complete
    state.endTime = Date.now();
    showResults();
  } else {
    state.currentIndex++;
    renderQuestion();
  }
}

// --- Results ---

function getScoreLevel(score: number, category: QuizCategory): { level: string; badge: string } {
  if (score >= 9) {
    return { level: 'Expert', badge: 'Grandmaster' };
  }
  if (score >= 7) {
    let badge = 'Advanced';
    if (category.slug === 'ai-llms') badge = 'AI Architect';
    else if (category.slug === 'cloud-infra') badge = 'Cloud Strategist';
    else if (category.slug === 'devops-cicd') badge = 'DevOps Master';
    return { level: 'Advanced', badge };
  }
  if (score >= 4) {
    return { level: 'Intermediate', badge: 'Intermediate' };
  }
  return { level: 'Beginner', badge: 'Beginner' };
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) {
    return minutes + 'm ' + seconds + 's';
  }
  return seconds + 's';
}

function showResults(): void {
  showScreen('results');

  if (!state.category) return;

  const elapsed = state.endTime - state.startTime;
  const { level, badge } = getScoreLevel(state.score, state.category);

  // Score display
  const scoreEl = document.querySelector<HTMLElement>('[data-result-score]');
  if (scoreEl) {
    scoreEl.textContent = state.score + '/' + state.questions.length;
  }

  // Badge
  const badgeEl = document.querySelector<HTMLElement>('[data-result-badge]');
  if (badgeEl) {
    badgeEl.textContent = badge;

    // Style the badge based on level
    badgeEl.className = 'inline-block px-4 py-1.5 rounded-full text-sm font-semibold';
    if (level === 'Expert') {
      badgeEl.classList.add('bg-yellow-500/20', 'text-yellow-400');
    } else if (level === 'Advanced') {
      badgeEl.classList.add('bg-green-500/20', 'text-green-400');
    } else if (level === 'Intermediate') {
      badgeEl.classList.add('bg-blue-500/20', 'text-blue-400');
    } else {
      badgeEl.classList.add('bg-text-muted/20', 'text-text-muted');
    }
  }

  // Time
  const timeEl = document.querySelector<HTMLElement>('[data-result-time]');
  if (timeEl) {
    timeEl.textContent = formatTime(elapsed);
  }

  // Correct / wrong counts
  const correctEl = document.querySelector<HTMLElement>('[data-result-correct]');
  if (correctEl) {
    correctEl.textContent = String(state.score);
  }

  const wrongEl = document.querySelector<HTMLElement>('[data-result-wrong]');
  if (wrongEl) {
    wrongEl.textContent = String(state.questions.length - state.score);
  }

  // Question review
  renderReview();

  // CTA
  renderCta();

  // Share buttons
  setupShareButtons(badge, level);

  // Analytics
  trackCompletion(level);
}

function renderReview(): void {
  const container = document.querySelector<HTMLElement>('[data-result-review]');
  if (!container) return;

  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  state.answers.forEach((answer, i) => {
    const q = state.questions[answer.questionIndex];

    const item = document.createElement('div');
    item.className = 'border-b border-border py-4 last:border-b-0';

    const header = document.createElement('div');
    header.className = 'flex items-start gap-3 mb-2';

    const numberBadge = document.createElement('span');
    numberBadge.className = answer.correct
      ? 'flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-xs font-bold'
      : 'flex-shrink-0 w-6 h-6 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center text-xs font-bold';
    numberBadge.textContent = String(i + 1);

    const questionText = document.createElement('p');
    questionText.className = 'text-sm font-medium text-text';
    questionText.textContent = q.question;

    header.appendChild(numberBadge);
    header.appendChild(questionText);

    const details = document.createElement('div');
    details.className = 'ml-9 text-sm';

    if (!answer.correct) {
      const yourAnswer = document.createElement('p');
      yourAnswer.className = 'text-red-400 mb-1';
      yourAnswer.textContent = 'Your answer: ' + q.options[answer.selectedOption];
      details.appendChild(yourAnswer);
    }

    const correctAnswer = document.createElement('p');
    correctAnswer.className = 'text-green-400 mb-1';
    correctAnswer.textContent = 'Correct: ' + q.options[q.correct];
    details.appendChild(correctAnswer);

    const explanation = document.createElement('p');
    explanation.className = 'text-text-muted mt-1';
    explanation.textContent = q.explanation;
    details.appendChild(explanation);

    item.appendChild(header);
    item.appendChild(details);
    container.appendChild(item);
  });
}

function renderCta(): void {
  const container = document.querySelector<HTMLElement>('[data-result-cta]');
  if (!container || !state.category) return;

  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  const link = document.createElement('a');
  link.href = state.category.ctaHref;
  link.className =
    'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg bg-secondary text-white hover:bg-secondary/90 shadow-md hover:shadow-lg px-6 py-2.5 text-base min-h-11';
  link.textContent = state.category.ctaText;

  container.appendChild(link);
}

function setupShareButtons(badge: string, _level: string): void {
  if (!state.category) return;

  const shareText =
    'I scored ' +
    state.score +
    '/' +
    state.questions.length +
    ' (' +
    badge +
    ') on the ' +
    state.category.category +
    ' quiz at sekoya.tech!';

  const shareUrl = 'https://sekoya.tech/tools/developer-quiz/';

  // LinkedIn
  const linkedinBtn = document.querySelector<HTMLElement>('[data-share-linkedin]');
  if (linkedinBtn) {
    linkedinBtn.addEventListener('click', () => {
      const url =
        'https://www.linkedin.com/sharing/share-offsite/?url=' +
        encodeURIComponent(shareUrl);
      window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400');
    });
  }

  // X (Twitter)
  const xBtn = document.querySelector<HTMLElement>('[data-share-x]');
  if (xBtn) {
    xBtn.addEventListener('click', () => {
      const url =
        'https://x.com/intent/tweet?text=' +
        encodeURIComponent(shareText) +
        '&url=' +
        encodeURIComponent(shareUrl);
      window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400');
    });
  }

  // Copy
  const copyBtn = document.querySelector<HTMLButtonElement>('[data-share-copy]');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const copyText = shareText + ' ' + shareUrl;
      navigator.clipboard.writeText(copyText).then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
          copyBtn.textContent = originalText;
        }, 2000);
      });
    });
  }
}

function trackCompletion(level: string): void {
  try {
    const plausible = (window as any).plausible;
    if (typeof plausible === 'function' && state.category) {
      plausible('Quiz Completed', {
        props: {
          category: state.category.slug,
          score: state.score,
          level: level,
        },
      });
    }
  } catch {
    // Analytics tracking is non-critical
  }
}

// --- Retry handlers ---

function handleTryAgain(): void {
  if (state.category) {
    startQuiz(state.category.slug);
  }
}

function handleTryAnother(): void {
  state = createInitialState();
  showScreen('categories');
  bindCategoryGrid();
}

// --- Initialization ---

function initQuiz(): void {
  // Load categories from hidden data carriers
  categories = [];
  const dataEls = document.querySelectorAll<HTMLElement>('[data-quiz-data]');
  dataEls.forEach((el) => {
    const raw = el.getAttribute('data-quiz-data');
    if (raw) {
      try {
        const cat: QuizCategory = JSON.parse(raw);
        categories.push(cat);
      } catch {
        // Skip invalid data
      }
    }
  });

  if (categories.length === 0) return;

  // Reset state
  state = createInitialState();

  // Bind click handlers to server-rendered category cards
  bindCategoryGrid();

  // Show categories screen
  showScreen('categories');

  // Bind next button
  const nextBtn = document.querySelector<HTMLElement>('[data-quiz-next]');
  if (nextBtn) {
    nextBtn.addEventListener('click', handleNext);
  }

  // Bind retry buttons
  const tryAgainBtn = document.querySelector<HTMLElement>('[data-try-again]');
  if (tryAgainBtn) {
    tryAgainBtn.addEventListener('click', handleTryAgain);
  }

  const tryAnotherBtn = document.querySelector<HTMLElement>('[data-try-another]');
  if (tryAnotherBtn) {
    tryAnotherBtn.addEventListener('click', handleTryAnother);
  }
}

function cleanupQuiz(): void {
  state = createInitialState();
  categories = [];
}

if (typeof document !== 'undefined') {
  // Run immediately when module loads (handles View Transition navigations
  // where DOMContentLoaded has already fired before this script loads)
  initQuiz();

  // Cleanup and re-initialize on subsequent View Transition navigations
  document.addEventListener('astro:before-swap', cleanupQuiz);
  document.addEventListener('astro:after-swap', initQuiz);
}
