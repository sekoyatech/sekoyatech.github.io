import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function initScrollReveal(): void {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
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
    const suffix = match[2];
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

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initScrollReveal);
  document.addEventListener('astro:before-swap', cleanupScrollReveal);
  document.addEventListener('astro:after-swap', initScrollReveal);
}
