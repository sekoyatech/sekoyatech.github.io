/**
 * Secure Password Generator — client-side only
 * Uses crypto.getRandomValues() for cryptographic randomness.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Mode = 'password' | 'passphrase' | 'apikey';

interface StrengthResult {
  entropy: number;
  level: 'Weak' | 'Fair' | 'Strong' | 'Very Strong';
  color: string;
  percent: number;
  crackTime: string;
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

let currentMode: Mode = 'password';
let wordlist: string[] | null = null;
let wordlistLoading = false;
let firstUseTracked = false;

// ---------------------------------------------------------------------------
// Helpers — Cryptographic random
// ---------------------------------------------------------------------------

/** Return a cryptographically random integer in [0, max). */
function secureRandomInt(max: number): number {
  if (max <= 0) return 0;
  const array = new Uint32Array(1);
  // Rejection-sampling to avoid modulo bias
  const limit = Math.floor(0x100000000 / max) * max;
  let value: number;
  do {
    crypto.getRandomValues(array);
    value = array[0];
  } while (value >= limit);
  return value % max;
}

/** Shuffle an array in-place (Fisher-Yates with crypto). */
function secureShuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ---------------------------------------------------------------------------
// DOM helpers
// ---------------------------------------------------------------------------

function qs<T extends HTMLElement>(sel: string): T | null {
  return document.querySelector<T>(sel);
}

function qsa<T extends HTMLElement>(sel: string): T[] {
  return Array.from(document.querySelectorAll<T>(sel));
}

// ---------------------------------------------------------------------------
// Wordlist loader (lazy)
// ---------------------------------------------------------------------------

async function loadWordlist(): Promise<string[]> {
  if (wordlist) return wordlist;
  if (wordlistLoading) {
    // Wait for the already-in-flight load
    return new Promise((resolve) => {
      const id = setInterval(() => {
        if (wordlist) {
          clearInterval(id);
          resolve(wordlist);
        }
      }, 50);
    });
  }
  wordlistLoading = true;
  try {
    const res = await fetch('/data/eff-wordlist.json');
    wordlist = await res.json();
    return wordlist!;
  } catch {
    // Fallback: a tiny built-in list
    wordlist = [
      'apple', 'brave', 'cedar', 'delta', 'eagle', 'flame', 'grain', 'haven',
      'ivory', 'joker', 'knack', 'lemon', 'maple', 'nerve', 'olive', 'pearl',
      'queen', 'rider', 'stone', 'tiger', 'ultra', 'vivid', 'wheel', 'yield',
      'zebra', 'amber', 'bliss', 'coral', 'drift', 'ember',
    ];
    return wordlist;
  } finally {
    wordlistLoading = false;
  }
}

// ---------------------------------------------------------------------------
// Charsets
// ---------------------------------------------------------------------------

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const AMBIGUOUS = '0OIl1';

function buildCharset(): string {
  const upperEl = qs<HTMLInputElement>('[data-pw-upper]');
  const lowerEl = qs<HTMLInputElement>('[data-pw-lower]');
  const numbersEl = qs<HTMLInputElement>('[data-pw-numbers]');
  const symbolsEl = qs<HTMLInputElement>('[data-pw-symbols]');
  const ambiguousEl = qs<HTMLInputElement>('[data-pw-ambiguous]');

  let charset = '';
  if (upperEl?.checked) charset += UPPER;
  if (lowerEl?.checked) charset += LOWER;
  if (numbersEl?.checked) charset += NUMBERS;
  if (symbolsEl?.checked) charset += SYMBOLS;

  if (ambiguousEl?.checked) {
    charset = charset
      .split('')
      .filter((c) => !AMBIGUOUS.includes(c))
      .join('');
  }

  return charset;
}

// ---------------------------------------------------------------------------
// Password generation
// ---------------------------------------------------------------------------

function generatePassword(): string {
  const lengthEl = qs<HTMLInputElement>('[data-pw-length]');
  const length = lengthEl ? parseInt(lengthEl.value, 10) : 16;
  const charset = buildCharset();
  if (charset.length === 0) return '(select at least one character set)';

  const chars: string[] = [];
  for (let i = 0; i < length; i++) {
    chars.push(charset[secureRandomInt(charset.length)]);
  }
  return chars.join('');
}

// ---------------------------------------------------------------------------
// Passphrase generation
// ---------------------------------------------------------------------------

async function generatePassphrase(): Promise<string> {
  const words = await loadWordlist();
  const countEl = qs<HTMLInputElement>('[data-pp-words]');
  const capsEl = qs<HTMLInputElement>('[data-pp-caps]');
  const numberEl = qs<HTMLInputElement>('[data-pp-number]');
  const wordCount = countEl ? parseInt(countEl.value, 10) : 4;

  // Separator
  const activeSep = qs<HTMLElement>('[data-pp-sep].bg-primary');
  let separator = '-';
  if (activeSep) {
    const val = activeSep.getAttribute('data-pp-sep') || '-';
    separator = val === 'space' ? ' ' : val;
  }

  const picked: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    let word = words[secureRandomInt(words.length)];
    if (capsEl?.checked) {
      word = word.charAt(0).toUpperCase() + word.slice(1);
    }
    picked.push(word);
  }

  let result = picked.join(separator);

  if (numberEl?.checked) {
    result += separator + secureRandomInt(100).toString();
  }

  return result;
}

// ---------------------------------------------------------------------------
// API Key generation
// ---------------------------------------------------------------------------

function generateApiKey(): string {
  const formatEl = qs<HTMLSelectElement>('[data-ak-format]');
  const prefixEl = qs<HTMLInputElement>('[data-ak-prefix]');
  const format = formatEl?.value || 'hex32';
  const prefix = prefixEl?.value?.trim() || '';

  let key = '';

  switch (format) {
    case 'hex32': {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      key = Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      break;
    }
    case 'hex64': {
      const bytes = new Uint8Array(32);
      crypto.getRandomValues(bytes);
      key = Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      break;
    }
    case 'base64_32': {
      const bytes = new Uint8Array(24);
      crypto.getRandomValues(bytes);
      key = btoa(String.fromCharCode(...bytes));
      break;
    }
    case 'base64_64': {
      const bytes = new Uint8Array(48);
      crypto.getRandomValues(bytes);
      key = btoa(String.fromCharCode(...bytes));
      break;
    }
    case 'uuid': {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
      bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10
      const hex = Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      key = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
      break;
    }
    default:
      key = generatePassword();
  }

  return prefix ? `${prefix}${key}` : key;
}

// ---------------------------------------------------------------------------
// Strength analysis
// ---------------------------------------------------------------------------

function calcStrength(value: string): StrengthResult {
  let entropy = 0;

  if (currentMode === 'passphrase' && wordlist) {
    const countEl = qs<HTMLInputElement>('[data-pp-words]');
    const numberEl = qs<HTMLInputElement>('[data-pp-number]');
    const wordCount = countEl ? parseInt(countEl.value, 10) : 4;
    entropy = wordCount * Math.log2(wordlist.length);
    if (numberEl?.checked) {
      entropy += Math.log2(100); // ~6.6 bits for a number 0-99
    }
  } else if (currentMode === 'password') {
    const charset = buildCharset();
    if (charset.length > 0) {
      entropy = value.length * Math.log2(charset.length);
    }
  } else {
    // API key — estimate from value length and hex/base64 charset
    const formatEl = qs<HTMLSelectElement>('[data-ak-format]');
    const format = formatEl?.value || 'hex32';
    switch (format) {
      case 'hex32':
        entropy = 128;
        break;
      case 'hex64':
        entropy = 256;
        break;
      case 'base64_32':
        entropy = 192;
        break;
      case 'base64_64':
        entropy = 384;
        break;
      case 'uuid':
        entropy = 122; // 128 minus 6 fixed bits
        break;
      default:
        entropy = value.length * Math.log2(62);
    }
  }

  let level: StrengthResult['level'];
  let color: string;
  let percent: number;

  if (entropy < 40) {
    level = 'Weak';
    color = 'bg-red-500';
    percent = Math.max(5, (entropy / 40) * 25);
  } else if (entropy < 60) {
    level = 'Fair';
    color = 'bg-orange-500';
    percent = 25 + ((entropy - 40) / 20) * 25;
  } else if (entropy < 80) {
    level = 'Strong';
    color = 'bg-yellow-500';
    percent = 50 + ((entropy - 60) / 20) * 25;
  } else {
    level = 'Very Strong';
    color = 'bg-green-500';
    percent = Math.min(100, 75 + ((entropy - 80) / 40) * 25);
  }

  const crackTime = formatCrackTime(entropy);

  return { entropy: Math.round(entropy * 10) / 10, level, color, percent, crackTime };
}

function formatCrackTime(entropy: number): string {
  // Assumes 10 billion guesses per second
  const guessesPerSec = 10_000_000_000;
  const totalSeconds = Math.pow(2, entropy) / guessesPerSec / 2; // average is half keyspace

  if (totalSeconds < 1) return 'Instant';
  if (totalSeconds < 60) return `${Math.round(totalSeconds)} seconds`;
  const minutes = totalSeconds / 60;
  if (minutes < 60) return `${Math.round(minutes)} minutes`;
  const hours = minutes / 60;
  if (hours < 24) return `${Math.round(hours)} hours`;
  const days = hours / 24;
  if (days < 365) return `${Math.round(days)} days`;
  const years = days / 365;
  if (years < 1000) return `${Math.round(years)} years`;
  if (years < 1e6) return `${(years / 1e3).toFixed(1)} thousand years`;
  if (years < 1e9) return `${(years / 1e6).toFixed(1)} million years`;
  if (years < 1e12) return `${(years / 1e9).toFixed(1)} billion years`;
  if (years < 1e15) return `${(years / 1e12).toFixed(1)} trillion years`;
  return 'Effectively forever';
}

// ---------------------------------------------------------------------------
// Clipboard
// ---------------------------------------------------------------------------

async function copyToClipboard(text: string, el?: HTMLElement | null): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    if (el) {
      const original = el.textContent;
      el.textContent = 'Copied!';
      setTimeout(() => {
        el.textContent = original;
      }, 1500);
    }
  } catch {
    // Fallback for older browsers
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    if (el) {
      const original = el.textContent;
      el.textContent = 'Copied!';
      setTimeout(() => {
        el.textContent = original;
      }, 1500);
    }
  }
}

// ---------------------------------------------------------------------------
// Plausible analytics
// ---------------------------------------------------------------------------

function trackPwGenFirstUse(): void {
  if (firstUseTracked) return;
  try {
    const plausible = (window as any).plausible;
    if (typeof plausible === 'function') {
      plausible('Tool Used', { props: { tool: 'password-generator' } });
    }
  } catch {
    // analytics failure is non-critical
  }
  firstUseTracked = true;
}

// ---------------------------------------------------------------------------
// UI update functions
// ---------------------------------------------------------------------------

function updateOutput(value: string): void {
  const output = qs<HTMLElement>('[data-pw-output]');
  if (output) {
    output.textContent = value;
  }
}

function updateStrength(value: string): void {
  const strength = calcStrength(value);
  const bar = qs<HTMLElement>('[data-strength-bar]');
  const labelEl = qs<HTMLElement>('[data-strength-label]');
  const entropyEl = qs<HTMLElement>('[data-entropy]');
  const crackEl = qs<HTMLElement>('[data-crack-time]');

  if (bar) {
    bar.style.width = `${strength.percent}%`;
    // Remove previous color classes
    bar.className = bar.className.replace(/bg-(red|orange|yellow|green)-500/g, '');
    bar.classList.add(strength.color);
  }
  if (labelEl) {
    labelEl.textContent = strength.level;
  }
  if (entropyEl) {
    entropyEl.textContent = `${strength.entropy} bits`;
  }
  if (crackEl) {
    crackEl.textContent = strength.crackTime;
  }
}

function updateBulkList(): void {
  const countEl = qs<HTMLSelectElement>('[data-bulk-count]');
  const listEl = qs<HTMLElement>('[data-bulk-list]');
  if (!countEl || !listEl) return;

  const count = parseInt(countEl.value, 10) || 5;

  // Clear existing children
  while (listEl.firstChild) {
    listEl.removeChild(listEl.firstChild);
  }

  const generateItem = async (idx: number): Promise<void> => {
    let value: string;
    switch (currentMode) {
      case 'passphrase':
        value = await generatePassphrase();
        break;
      case 'apikey':
        value = generateApiKey();
        break;
      default:
        value = generatePassword();
    }

    const row = document.createElement('div');
    row.className = 'flex items-center gap-2 py-1.5 border-b border-border last:border-0';

    const num = document.createElement('span');
    num.className = 'text-text-muted text-xs w-6 shrink-0 text-right';
    num.textContent = `${idx + 1}.`;

    const code = document.createElement('code');
    code.className = 'text-sm font-mono text-primary break-all flex-1';
    code.textContent = value;

    const copyBtn = document.createElement('button');
    copyBtn.className = 'text-xs text-text-muted hover:text-primary transition-colors shrink-0 px-2 py-1 rounded hover:bg-surface';
    copyBtn.textContent = 'Copy';
    copyBtn.addEventListener('click', () => {
      copyToClipboard(value, copyBtn);
    });

    row.appendChild(num);
    row.appendChild(code);
    row.appendChild(copyBtn);
    listEl.appendChild(row);
  };

  // Generate items sequentially to avoid race conditions with passphrase
  (async () => {
    for (let i = 0; i < count; i++) {
      await generateItem(i);
    }
  })();
}

// ---------------------------------------------------------------------------
// Main generation
// ---------------------------------------------------------------------------

async function regenerate(): Promise<void> {
  trackPwGenFirstUse();

  let value: string;

  switch (currentMode) {
    case 'passphrase':
      value = await generatePassphrase();
      break;
    case 'apikey':
      value = generateApiKey();
      break;
    default:
      value = generatePassword();
  }

  updateOutput(value);
  updateStrength(value);
  updateBulkList();
}

// ---------------------------------------------------------------------------
// Mode switching
// ---------------------------------------------------------------------------

function switchMode(mode: Mode): void {
  currentMode = mode;

  // Update mode buttons
  qsa<HTMLElement>('[data-pw-mode]').forEach((btn) => {
    const btnMode = btn.getAttribute('data-pw-mode');
    if (btnMode === mode) {
      btn.classList.add('bg-primary', 'text-white');
      btn.classList.remove('text-text-muted', 'hover:text-text', 'border', 'border-border');
    } else {
      btn.classList.remove('bg-primary', 'text-white');
      btn.classList.add('text-text-muted', 'hover:text-text', 'border', 'border-border');
    }
  });

  // Show/hide panels
  qsa<HTMLElement>('[data-mode-panel]').forEach((panel) => {
    const panelMode = panel.getAttribute('data-mode-panel');
    if (panelMode === mode) {
      panel.classList.remove('hidden');
    } else {
      panel.classList.add('hidden');
    }
  });

  regenerate();
}

// ---------------------------------------------------------------------------
// Event binding
// ---------------------------------------------------------------------------

function bindEvents(): void {
  // Mode buttons
  qsa<HTMLElement>('[data-pw-mode]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-pw-mode') as Mode;
      if (mode) switchMode(mode);
    });
  });

  // Regenerate button
  qs<HTMLElement>('[data-regenerate]')?.addEventListener('click', () => {
    regenerate();
  });

  // Copy main output
  qs<HTMLElement>('[data-copy-main]')?.addEventListener('click', () => {
    const output = qs<HTMLElement>('[data-pw-output]');
    if (output?.textContent) {
      copyToClipboard(output.textContent, qs<HTMLElement>('[data-copy-main]'));
    }
  });

  // Copy all (bulk)
  qs<HTMLElement>('[data-copy-all]')?.addEventListener('click', () => {
    const listEl = qs<HTMLElement>('[data-bulk-list]');
    if (!listEl) return;
    const codes = listEl.querySelectorAll('code');
    const allText = Array.from(codes)
      .map((c) => c.textContent || '')
      .join('\n');
    copyToClipboard(allText, qs<HTMLElement>('[data-copy-all]'));
  });

  // Password length slider
  const lengthSlider = qs<HTMLInputElement>('[data-pw-length]');
  const lengthDisplay = qs<HTMLElement>('[data-pw-length-display]');
  if (lengthSlider && lengthDisplay) {
    lengthSlider.addEventListener('input', () => {
      lengthDisplay.textContent = lengthSlider.value;
      regenerate();
    });
  }

  // Password checkboxes
  const pwCheckboxes = [
    '[data-pw-upper]',
    '[data-pw-lower]',
    '[data-pw-numbers]',
    '[data-pw-symbols]',
    '[data-pw-ambiguous]',
  ];
  pwCheckboxes.forEach((sel) => {
    qs<HTMLInputElement>(sel)?.addEventListener('change', () => {
      regenerate();
    });
  });

  // Passphrase word count slider
  const wordsSlider = qs<HTMLInputElement>('[data-pp-words]');
  const wordsDisplay = qs<HTMLElement>('[data-pp-words-display]');
  if (wordsSlider && wordsDisplay) {
    wordsSlider.addEventListener('input', () => {
      wordsDisplay.textContent = wordsSlider.value;
      regenerate();
    });
  }

  // Passphrase separator buttons
  qsa<HTMLElement>('[data-pp-sep]').forEach((btn) => {
    btn.addEventListener('click', () => {
      qsa<HTMLElement>('[data-pp-sep]').forEach((b) => {
        b.classList.remove('bg-primary', 'text-white');
        b.classList.add('text-text-muted', 'hover:text-text', 'border', 'border-border');
      });
      btn.classList.add('bg-primary', 'text-white');
      btn.classList.remove('text-text-muted', 'hover:text-text', 'border', 'border-border');
      regenerate();
    });
  });

  // Passphrase toggles
  qs<HTMLInputElement>('[data-pp-caps]')?.addEventListener('change', () => {
    regenerate();
  });
  qs<HTMLInputElement>('[data-pp-number]')?.addEventListener('change', () => {
    regenerate();
  });

  // API key format
  qs<HTMLSelectElement>('[data-ak-format]')?.addEventListener('change', () => {
    regenerate();
  });

  // API key prefix
  qs<HTMLInputElement>('[data-ak-prefix]')?.addEventListener('input', () => {
    regenerate();
  });

  // Bulk count
  qs<HTMLSelectElement>('[data-bulk-count]')?.addEventListener('change', () => {
    updateBulkList();
  });
}

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------

function init(): void {
  // Reset state for view transitions
  firstUseTracked = false;
  currentMode = 'password';

  // Only init if the password generator page is present
  if (!qs('[data-pw-output]')) return;

  bindEvents();
  regenerate();
}

// Run immediately when module loads (handles View Transition navigations
// where DOMContentLoaded has already fired before this script loads)
init();

// Re-initialize on subsequent View Transition navigations
document.addEventListener('astro:after-swap', init);
