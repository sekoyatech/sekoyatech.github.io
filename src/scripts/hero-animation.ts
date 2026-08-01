// The hero *entrance* is CSS (see the hero-rise / hero-pop keyframes in
// global.css). It used to live here, which meant the first screen stayed blank
// until this module arrived over the network — 1.3s on a cold Fast 3G load.
// Visibility must not wait on JavaScript, so all that is left here is the
// continuous idle motion, which is pure decoration and can start whenever.
let animations: Animation[] = [];

function initHeroAnimation(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const heroCode = document.querySelector<HTMLElement>('[data-hero-code]');
  const heroBadge = document.querySelector<HTMLElement>('[data-hero-badge]');
  if (!heroCode && !heroBadge) return;

  animations = [];

  // Delays clear the CSS entrance before the idle loops take over the transform.
  if (heroCode) {
    animations.push(
      heroCode.animate(
        [{ transform: 'translateY(0)' }, { transform: 'translateY(-8px)' }, { transform: 'translateY(0)' }],
        { duration: 3000, iterations: Infinity, easing: 'ease-in-out', delay: 2000 }
      )
    );
  }

  if (heroBadge) {
    animations.push(
      heroBadge.animate(
        [{ transform: 'rotate(-3deg)' }, { transform: 'rotate(-5deg)' }, { transform: 'rotate(-3deg)' }],
        { duration: 2000, iterations: Infinity, easing: 'ease-in-out', delay: 2000 }
      )
    );
  }
}

function cleanupHeroAnimation(): void {
  animations.forEach((a) => a.cancel());
  animations = [];
}

// Run now if the DOM is already parsed: waiting on DOMContentLoaded alone would
// silently never fire if this module executes after that event.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeroAnimation, { once: true });
} else {
  initHeroAnimation();
}
document.addEventListener('astro:after-swap', initHeroAnimation);
document.addEventListener('astro:before-swap', cleanupHeroAnimation);
