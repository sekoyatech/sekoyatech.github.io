interface LLMModel {
  provider: string;
  model: string;
  inputPer1M: number;
  outputPer1M: number;
  contextWindow: number;
}

interface TokenStats {
  chars: number;
  words: number;
  tokens: number;
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let models: LLMModel[] = [];
let currentMultiplier = 1;
let hasTrackedFirstUse = false;

function estimateTokens(text: string): TokenStats {
  if (!text.trim()) {
    return { chars: 0, words: 0, tokens: 0 };
  }

  const chars = text.length;
  const words = text.trim().split(/\s+/).filter(Boolean).length;

  // Base multiplier: ~1.3 tokens per word
  let tokenMultiplier = 1.3;

  // Code detection: look for common code patterns
  const codePatterns = /[{}();=><\[\]]/g;
  const codeMatches = text.match(codePatterns);
  if (codeMatches && codeMatches.length > words * 0.15) {
    tokenMultiplier = 1.5;
  }

  // Non-Latin character detection (CJK, Arabic, etc.)
  const nonLatinPattern = /[^\u0000-\u007F\u0080-\u024F]/g;
  const nonLatinMatches = text.match(nonLatinPattern);
  if (nonLatinMatches && nonLatinMatches.length > chars * 0.2) {
    tokenMultiplier = 1.5;
  }

  const tokens = Math.ceil(words * tokenMultiplier);

  return { chars, words, tokens };
}

function calculateCost(tokens: number, pricePerM: number): number {
  return (tokens / 1_000_000) * pricePerM;
}

function formatCost(cost: number): string {
  if (cost === 0) return '$0.00';
  if (cost < 0.01) return '<$0.01';
  return '$' + cost.toFixed(4);
}

function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

function getSelectedModel(): LLMModel | undefined {
  const select = document.querySelector<HTMLSelectElement>('[data-model-select]');
  if (!select) return undefined;
  const idx = parseInt(select.value, 10);
  return models[idx];
}

function trackTokenCalcFirstUse(): void {
  if (hasTrackedFirstUse) return;
  hasTrackedFirstUse = true;
  try {
    const plausible = (window as any).plausible;
    if (typeof plausible === 'function') {
      plausible('Tool Used', { props: { tool: 'token-calculator' } });
    }
  } catch {
    // Analytics tracking is non-critical
  }
}

function updateResults(): void {
  const textarea = document.querySelector<HTMLTextAreaElement>('[data-token-input]');
  if (!textarea) return;

  const text = textarea.value;
  const stats = estimateTokens(text);

  if (stats.tokens > 0) {
    trackTokenCalcFirstUse();
  }

  // Update stat displays
  const charsEl = document.querySelector<HTMLElement>('[data-chars]');
  const wordsEl = document.querySelector<HTMLElement>('[data-words]');
  const tokensEl = document.querySelector<HTMLElement>('[data-tokens]');

  if (charsEl) charsEl.textContent = formatNumber(stats.chars);
  if (wordsEl) wordsEl.textContent = formatNumber(stats.words);
  if (tokensEl) tokensEl.textContent = formatNumber(stats.tokens);

  // Update cost for selected model
  const selectedModel = getSelectedModel();
  const inputCostEl = document.querySelector<HTMLElement>('[data-input-cost]');
  const outputCostEl = document.querySelector<HTMLElement>('[data-output-cost]');
  const totalCostEl = document.querySelector<HTMLElement>('[data-total-cost]');

  if (selectedModel) {
    const inputCost = calculateCost(stats.tokens, selectedModel.inputPer1M);
    const outputTokens = stats.tokens * currentMultiplier;
    const outputCost = calculateCost(outputTokens, selectedModel.outputPer1M);
    const totalCost = inputCost + outputCost;

    if (inputCostEl) inputCostEl.textContent = formatCost(inputCost);
    if (outputCostEl) outputCostEl.textContent = formatCost(outputCost);
    if (totalCostEl) totalCostEl.textContent = formatCost(totalCost);
  }

  // Update comparison table
  updateComparisonTable(stats.tokens);
}

function updateComparisonTable(inputTokens: number): void {
  const tbody = document.querySelector<HTMLTableSectionElement>('[data-token-table-body]');
  if (!tbody) return;

  const selectedModel = getSelectedModel();

  // Clear existing rows
  while (tbody.firstChild) {
    tbody.removeChild(tbody.firstChild);
  }

  models.forEach((model) => {
    const inputCost = calculateCost(inputTokens, model.inputPer1M);
    const outputTokens = inputTokens * currentMultiplier;
    const outputCost = calculateCost(outputTokens, model.outputPer1M);
    const totalCost = inputCost + outputCost;

    const isSelected = selectedModel && selectedModel.model === model.model;

    const tr = document.createElement('tr');
    tr.className = 'border-b border-border' + (isSelected ? ' bg-primary/10' : '');

    const tdProvider = document.createElement('td');
    tdProvider.className = 'py-3 px-4 text-sm text-text-muted';
    tdProvider.textContent = model.provider;

    const tdModel = document.createElement('td');
    tdModel.className = 'py-3 px-4 text-sm font-medium text-text';
    tdModel.textContent = model.model;

    const tdInput = document.createElement('td');
    tdInput.className = 'py-3 px-4 text-sm text-text-muted text-right';
    tdInput.textContent = formatCost(inputCost);

    const tdOutput = document.createElement('td');
    tdOutput.className = 'py-3 px-4 text-sm text-text-muted text-right';
    tdOutput.textContent = formatCost(outputCost);

    const tdTotal = document.createElement('td');
    tdTotal.className = 'py-3 px-4 text-sm font-semibold text-primary text-right';
    tdTotal.textContent = formatCost(totalCost);

    tr.appendChild(tdProvider);
    tr.appendChild(tdModel);
    tr.appendChild(tdInput);
    tr.appendChild(tdOutput);
    tr.appendChild(tdTotal);
    tbody.appendChild(tr);
  });
}

function handleMultiplierClick(e: Event): void {
  const target = e.currentTarget as HTMLButtonElement;
  const value = parseInt(target.dataset.multiplier || '1', 10);
  currentMultiplier = value;

  // Update button styles
  document.querySelectorAll<HTMLButtonElement>('[data-multiplier]').forEach((btn) => {
    const btnValue = parseInt(btn.dataset.multiplier || '1', 10);
    if (btnValue === value) {
      btn.className = btn.className
        .replace(/bg-bg/g, 'bg-primary')
        .replace(/text-text-muted/g, 'text-white')
        .replace(/hover:bg-surface/g, 'hover:bg-primary-dark');
      if (!btn.className.includes('bg-primary')) {
        btn.className = btn.className + ' bg-primary text-white';
      }
    } else {
      btn.className = btn.className
        .replace(/bg-primary/g, 'bg-bg')
        .replace(/text-white/g, 'text-text-muted')
        .replace(/hover:bg-primary-dark/g, 'hover:bg-surface');
    }
  });

  updateResults();
}

function handleCopyResults(): void {
  const stats = estimateTokens(
    (document.querySelector<HTMLTextAreaElement>('[data-token-input]')?.value || '')
  );
  const selectedModel = getSelectedModel();
  if (!selectedModel) return;

  const inputCost = calculateCost(stats.tokens, selectedModel.inputPer1M);
  const outputTokens = stats.tokens * currentMultiplier;
  const outputCost = calculateCost(outputTokens, selectedModel.outputPer1M);
  const totalCost = inputCost + outputCost;

  const lines = [
    'AI Token & Cost Estimate',
    '========================',
    'Model: ' + selectedModel.model + ' (' + selectedModel.provider + ')',
    'Characters: ' + formatNumber(stats.chars),
    'Words: ' + formatNumber(stats.words),
    'Estimated Tokens: ' + formatNumber(stats.tokens),
    'Output Multiplier: ' + currentMultiplier + 'x',
    '',
    'Input Cost: ' + formatCost(inputCost),
    'Output Cost: ' + formatCost(outputCost),
    'Total Cost: ' + formatCost(totalCost),
    '',
    'Generated at sekoya.tech/tools/token-calculator/',
  ];

  navigator.clipboard.writeText(lines.join('\n')).then(() => {
    const copyBtn = document.querySelector<HTMLButtonElement>('[data-copy-results]');
    if (copyBtn) {
      const originalText = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      setTimeout(() => {
        if (copyBtn) copyBtn.textContent = originalText;
      }, 2000);
    }
  });
}

function handleClear(): void {
  const textarea = document.querySelector<HTMLTextAreaElement>('[data-token-input]');
  if (textarea) {
    textarea.value = '';
    textarea.focus();
  }
  currentMultiplier = 1;

  // Reset multiplier buttons
  document.querySelectorAll<HTMLButtonElement>('[data-multiplier]').forEach((btn) => {
    const btnValue = parseInt(btn.dataset.multiplier || '1', 10);
    if (btnValue === 1) {
      btn.className = btn.className
        .replace(/bg-bg/g, 'bg-primary')
        .replace(/text-text-muted/g, 'text-white')
        .replace(/hover:bg-surface/g, 'hover:bg-primary-dark');
      if (!btn.className.includes('bg-primary')) {
        btn.className = btn.className + ' bg-primary text-white';
      }
    } else {
      btn.className = btn.className
        .replace(/bg-primary/g, 'bg-bg')
        .replace(/text-white/g, 'text-text-muted')
        .replace(/hover:bg-primary-dark/g, 'hover:bg-surface');
    }
  });

  updateResults();
}

function initTokenCalculator(): void {
  // Load models from data attribute
  const modelsEl = document.querySelector<HTMLElement>('[data-models]');
  if (!modelsEl) return;

  try {
    models = JSON.parse(modelsEl.dataset.models || '[]');
  } catch {
    models = [];
    return;
  }

  // Reset state
  currentMultiplier = 1;
  hasTrackedFirstUse = false;

  // Textarea with debounce
  const textarea = document.querySelector<HTMLTextAreaElement>('[data-token-input]');
  if (textarea) {
    textarea.addEventListener('input', () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(updateResults, 300);
    });
  }

  // Model select
  const select = document.querySelector<HTMLSelectElement>('[data-model-select]');
  if (select) {
    select.addEventListener('change', updateResults);
  }

  // Multiplier buttons
  document.querySelectorAll<HTMLButtonElement>('[data-multiplier]').forEach((btn) => {
    btn.addEventListener('click', handleMultiplierClick);
  });

  // Copy button
  const copyBtn = document.querySelector<HTMLButtonElement>('[data-copy-results]');
  if (copyBtn) {
    copyBtn.addEventListener('click', handleCopyResults);
  }

  // Clear button
  const clearBtn = document.querySelector<HTMLButtonElement>('[data-clear]');
  if (clearBtn) {
    clearBtn.addEventListener('click', handleClear);
  }

  // Initial render
  updateResults();
}

function cleanupTokenCalculator(): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
}

if (typeof document !== 'undefined') {
  // Run immediately when module loads (handles View Transition navigations
  // where DOMContentLoaded has already fired before this script loads)
  initTokenCalculator();

  // Cleanup and re-initialize on subsequent View Transition navigations
  document.addEventListener('astro:before-swap', cleanupTokenCalculator);
  document.addEventListener('astro:after-swap', initTokenCalculator);
}
