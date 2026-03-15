let observer: IntersectionObserver | null = null;
let counterObserver: IntersectionObserver | null = null;

function initScrollReveal(): void {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer?.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -15% 0px' }
  );

  // Single element reveals: [data-reveal]
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    observer!.observe(el);
  });

  // Staggered children reveals: [data-reveal-stagger]
  document.querySelectorAll<HTMLElement>('[data-reveal-stagger]').forEach((container) => {
    Array.from(container.children).forEach((child, i) => {
      (child as HTMLElement).style.transitionDelay = `${i * 100}ms`;
      (child as HTMLElement).classList.add('reveal-child');
      observer!.observe(child);
    });
  });

  // Animated counters: [data-counter]
  counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target as HTMLElement);
          counterObserver?.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll<HTMLElement>('[data-counter]').forEach((el) => {
    el.textContent = '0' + (el.dataset.counter?.replace(/^\d+/, '') || '');
    counterObserver!.observe(el);
  });
}

function animateCounter(el: HTMLElement): void {
  const raw = el.dataset.counter || '0';
  const match = raw.match(/^(\d+)(.*)$/);
  if (!match) return;

  const target = parseInt(match[1], 10);
  const suffix = match[2];
  const duration = 1500;
  const start = performance.now();

  function step(now: number): void {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

function cleanupScrollReveal(): void {
  observer?.disconnect();
  observer = null;
  counterObserver?.disconnect();
  counterObserver = null;

  document.querySelectorAll('.revealed').forEach((el) => el.classList.remove('revealed'));
  document.querySelectorAll('.reveal-child').forEach((el) => {
    (el as HTMLElement).style.transitionDelay = '';
    el.classList.remove('reveal-child');
  });
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initScrollReveal);
  document.addEventListener('astro:before-swap', cleanupScrollReveal);
  document.addEventListener('astro:after-swap', initScrollReveal);
}
