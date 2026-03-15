import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function initScrollReveal(): void {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  ScrollTrigger.defaults({
    start: 'top 85%',
    toggleActions: 'play none none none',
  });

  // Single element reveals: [data-reveal]
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    const direction = el.dataset.reveal || 'up';
    const fromVars: gsap.TweenVars = { opacity: 0 };
    const toVars: gsap.TweenVars = { opacity: 1, duration: 0.8, ease: 'power2.out' };

    switch (direction) {
      case 'left':
        fromVars.x = -40;
        toVars.x = 0;
        break;
      case 'right':
        fromVars.x = 40;
        toVars.x = 0;
        break;
      case 'scale':
        fromVars.scale = 0.9;
        toVars.scale = 1;
        break;
      case 'up':
      default:
        fromVars.y = 30;
        toVars.y = 0;
        break;
    }

    // Set initial hidden state immediately to prevent flash
    gsap.set(el, fromVars);

    gsap.fromTo(el, fromVars, {
      ...toVars,
      scrollTrigger: { trigger: el },
    });
  });

  // Staggered children reveals: [data-reveal-stagger]
  document.querySelectorAll<HTMLElement>('[data-reveal-stagger]').forEach((container) => {
    const children = container.children;
    if (children.length === 0) return;

    // Set initial hidden state on children
    gsap.set(children, { opacity: 0, y: 30 });

    gsap.fromTo(children,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: { trigger: container },
      }
    );
  });

  // Animated counters: [data-counter]
  document.querySelectorAll<HTMLElement>('[data-counter]').forEach((el) => {
    const raw = el.dataset.counter || '0';
    const match = raw.match(/^(\d+)(.*)$/);
    if (!match) return;

    const target = parseInt(match[1], 10);
    const suffix = match[2];
    const obj = { value: 0 };

    // Set initial text to starting value to prevent visual jump
    el.textContent = '0' + suffix;

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
