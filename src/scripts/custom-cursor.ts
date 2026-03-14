function initCustomCursor(): void {
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (isTouchDevice) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const cursor = document.getElementById('cursor');
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!cursor || !dot || !ring) return;

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

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  const interactiveSelector = 'a, button, [role="button"], input, textarea, select, label, summary';

  document.addEventListener('mouseover', (e) => {
    const target = e.target as HTMLElement;
    if (target.closest(interactiveSelector)) {
      ringScale = 1.5;
      ring.style.opacity = '0.5';
    }
  });

  document.addEventListener('mouseout', (e) => {
    const target = e.target as HTMLElement;
    if (target.closest(interactiveSelector)) {
      ringScale = 1;
      ring.style.opacity = '1';
    }
  });

  function initMagnetic(): void {
    document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
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
          btn.style.transform = `translate(${moveX}px, ${moveY}px)`;
        }
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
        btn.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        setTimeout(() => {
          btn.style.transition = '';
        }, 300);
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

  const cleanup = (): void => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    cursor.style.display = 'none';
    document.body.classList.remove('custom-cursor-active');
  };

  document.addEventListener('astro:before-swap', cleanup, { once: true });
}

document.addEventListener('DOMContentLoaded', initCustomCursor);
document.addEventListener('astro:after-swap', initCustomCursor);
