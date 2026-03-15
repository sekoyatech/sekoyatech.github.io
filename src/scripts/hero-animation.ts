let animations: Animation[] = [];

function initHeroAnimation(): void {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    document.querySelectorAll('.hero-hidden').forEach((el) => el.classList.remove('hero-hidden'));
    return;
  }

  const heroTitle = document.querySelector<HTMLElement>('[data-hero-title]');
  if (!heroTitle) return;

  const heroSubtitle = document.querySelector<HTMLElement>('[data-hero-subtitle]');
  const heroCtas = document.querySelector<HTMLElement>('[data-hero-ctas]');
  const heroCode = document.querySelector<HTMLElement>('[data-hero-code]');
  const heroBadge = document.querySelector<HTMLElement>('[data-hero-badge]');

  animations = [];

  const reveal = (el: HTMLElement | null, delay: number, from: Keyframe): void => {
    if (!el) return;
    el.classList.remove('hero-hidden');
    const anim = el.animate(
      [from, { opacity: 1, transform: 'none' }],
      {
        duration: 600,
        delay,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        fill: 'backwards',
      }
    );
    animations.push(anim);
  };

  reveal(heroTitle, 200, { opacity: 0, transform: 'translateY(30px)' });
  reveal(heroSubtitle, 500, { opacity: 0, transform: 'translateY(20px)' });
  reveal(heroCode, 400, { opacity: 0, transform: 'translateX(40px)' });
  reveal(heroBadge, 1000, { opacity: 0, transform: 'scale(0.8)' });

  // Stagger CTA buttons
  if (heroCtas) {
    heroCtas.classList.remove('hero-hidden');
    Array.from(heroCtas.children).forEach((child, i) => {
      const anim = (child as HTMLElement).animate(
        [
          { opacity: 0, transform: 'translateY(20px)' },
          { opacity: 1, transform: 'none' },
        ],
        {
          duration: 500,
          delay: 800 + i * 150,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'backwards',
        }
      );
      animations.push(anim);
    });
  }

  // Continuous float animations (start after entrance completes)
  if (heroCode) {
    const float = heroCode.animate(
      [
        { transform: 'translateY(0)' },
        { transform: 'translateY(-8px)' },
        { transform: 'translateY(0)' },
      ],
      { duration: 3000, iterations: Infinity, easing: 'ease-in-out', delay: 2000 }
    );
    animations.push(float);
  }

  if (heroBadge) {
    const wobble = heroBadge.animate(
      [
        { transform: 'rotate(-3deg)' },
        { transform: 'rotate(-5deg)' },
        { transform: 'rotate(-3deg)' },
      ],
      { duration: 2000, iterations: Infinity, easing: 'ease-in-out', delay: 2000 }
    );
    animations.push(wobble);
  }
}

function cleanupHeroAnimation(): void {
  animations.forEach((a) => a.cancel());
  animations = [];
}

document.addEventListener('DOMContentLoaded', initHeroAnimation);
document.addEventListener('astro:after-swap', initHeroAnimation);
document.addEventListener('astro:before-swap', cleanupHeroAnimation);
