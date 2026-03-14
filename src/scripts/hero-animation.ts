import gsap from 'gsap';
import Splitting from 'splitting';

import 'splitting/dist/splitting.css';
import 'splitting/dist/splitting-cells.css';

let heroTimeline: gsap.core.Timeline | null = null;
let continuousTweens: gsap.core.Tween[] = [];

function initHeroAnimation(): void {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    document.querySelectorAll('.hero-hidden').forEach((el) => {
      el.classList.remove('hero-hidden');
    });
    return;
  }

  const heroTitle = document.querySelector<HTMLElement>('[data-hero-title]');
  const heroSubtitle = document.querySelector<HTMLElement>('[data-hero-subtitle]');
  const heroCtas = document.querySelector<HTMLElement>('[data-hero-ctas]');
  const heroCode = document.querySelector<HTMLElement>('[data-hero-code]');
  const heroBadge = document.querySelector<HTMLElement>('[data-hero-badge]');

  if (!heroTitle) return;

  const result = Splitting({ target: heroTitle, by: 'words' });
  const words = result[0]?.words || [];

  heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
  continuousTweens = [];

  heroTimeline.from(words, {
    y: 30,
    opacity: 0,
    duration: 0.6,
    stagger: 0.08,
  }, 0.2);

  if (heroSubtitle) {
    heroSubtitle.classList.remove('hero-hidden');
    heroTimeline.from(heroSubtitle, {
      y: 20,
      opacity: 0,
      duration: 0.6,
    }, 0.8);
  }

  if (heroCtas) {
    heroCtas.classList.remove('hero-hidden');
    heroTimeline.from(heroCtas.children, {
      y: 20,
      opacity: 0,
      duration: 0.5,
      stagger: 0.15,
    }, 1.0);
  }

  if (heroCode) {
    heroCode.classList.remove('hero-hidden');
    heroTimeline.from(heroCode, {
      x: 40,
      opacity: 0,
      rotation: 3,
      duration: 0.8,
    }, 0.5);
  }

  if (heroBadge) {
    heroBadge.classList.remove('hero-hidden');
    heroTimeline.from(heroBadge, {
      scale: 0.8,
      opacity: 0,
      duration: 0.5,
    }, 1.2);

    continuousTweens.push(gsap.to(heroBadge, {
      rotation: '-=2',
      yoyo: true,
      repeat: -1,
      duration: 2,
      ease: 'sine.inOut',
      delay: 2,
    }));
  }

  if (heroCode) {
    continuousTweens.push(gsap.to(heroCode, {
      y: -8,
      yoyo: true,
      repeat: -1,
      duration: 3,
      ease: 'sine.inOut',
      delay: 2,
    }));
  }

  heroTitle.classList.remove('hero-hidden');
}

function cleanupHeroAnimation(): void {
  if (heroTimeline) {
    heroTimeline.kill();
    heroTimeline = null;
  }
  continuousTweens.forEach((t) => t.kill());
  continuousTweens = [];
}

document.addEventListener('DOMContentLoaded', initHeroAnimation);
document.addEventListener('astro:after-swap', initHeroAnimation);
document.addEventListener('astro:before-swap', cleanupHeroAnimation);
