let initialized = false;
let cleanupFn: (() => void) | null = null;

function initCustomCursor(): void {
  // Prevent duplicate initialization
  if (initialized) return;

  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (isTouchDevice) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const cursor = document.getElementById('cursor');
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!cursor || !dot || !ring) return;

  initialized = true;
  cursor.style.display = 'block';
  document.body.classList.add('custom-cursor-active');

  let mouseX = 0;
  let mouseY = 0;
  let dotX = 0;
  let dotY = 0;
  let ringX = 0;
  let ringY = 0;
  let ringScale = 1;
  let rafId: number | null = null;

  const onMouseMove = (e: MouseEvent): void => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  };

  const interactiveSelector = 'a, button, [role="button"], input, textarea, select, label, summary';

  const onMouseOver = (e: Event): void => {
    const target = e.target as HTMLElement;
    if (target.closest(interactiveSelector)) {
      ringScale = 1.5;
      ring.style.opacity = '0.5';
    }
  };

  const onMouseOut = (e: Event): void => {
    const target = e.target as HTMLElement;
    if (target.closest(interactiveSelector)) {
      ringScale = 1;
      ring.style.opacity = '1';
    }
  };

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseover', onMouseOver);
  document.addEventListener('mouseout', onMouseOut);

  // Magnetic button effect
  const magneticCleanups: (() => void)[] = [];

  function initMagnetic(): void {
    document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((btn) => {
      const onBtnMove = (e: MouseEvent): void => {
        const rect = btn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const maxDist = 100;

        if (distance < maxDist && distance > 0.1) {
          const strength = (1 - distance / maxDist) * 10;
          const moveX = (deltaX / distance) * strength;
          const moveY = (deltaY / distance) * strength;
          btn.style.transition = 'none';
          btn.style.transform = `translate(${moveX}px, ${moveY}px)`;
        } else {
          btn.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
          btn.style.transform = '';
        }
      };

      const onBtnLeave = (): void => {
        btn.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        btn.style.transform = '';
        setTimeout(() => {
          btn.style.transition = '';
        }, 300);
      };

      btn.addEventListener('mousemove', onBtnMove);
      btn.addEventListener('mouseleave', onBtnLeave);
      magneticCleanups.push(() => {
        btn.removeEventListener('mousemove', onBtnMove);
        btn.removeEventListener('mouseleave', onBtnLeave);
      });
    });
  }

  function animate(): void {
    dotX += (mouseX - dotX) * 0.15;
    dotY += (mouseY - dotY) * 0.15;
    ringX += (mouseX - ringX) * 0.08;
    ringY += (mouseY - ringY) * 0.08;

    dot!.style.transform = `translate3d(${dotX - 4}px, ${dotY - 4}px, 0)`;
    ring!.style.transform = `translate3d(${ringX - 16}px, ${ringY - 16}px, 0) scale(${ringScale})`;

    rafId = requestAnimationFrame(animate);
  }

  initMagnetic();

  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => {
      rafId = requestAnimationFrame(animate);
    });
  } else {
    rafId = requestAnimationFrame(animate);
  }

  cleanupFn = (): void => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseover', onMouseOver);
    document.removeEventListener('mouseout', onMouseOut);
    magneticCleanups.forEach((fn) => fn());
    magneticCleanups.length = 0;
    cursor.style.display = 'none';
    document.body.classList.remove('custom-cursor-active');
    initialized = false;
  };

  document.addEventListener('astro:before-swap', () => {
    if (cleanupFn) {
      cleanupFn();
      cleanupFn = null;
    }
  }, { once: true });
}

document.addEventListener('DOMContentLoaded', initCustomCursor);
document.addEventListener('astro:after-swap', initCustomCursor);
