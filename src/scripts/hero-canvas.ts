interface GradientBlob {
  x: number;
  y: number;
  radius: number;
  color: string;
  speedX: number;
  speedY: number;
  phase: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
}

interface ThemeColors {
  blobs: string[];
}

const DARK_COLORS: ThemeColors = {
  blobs: [
    'rgba(16, 185, 129, 0.15)',
    'rgba(16, 185, 129, 0.10)',
    'rgba(99, 102, 241, 0.12)',
    'rgba(245, 158, 11, 0.08)',
  ],
};

const LIGHT_COLORS: ThemeColors = {
  blobs: [
    'rgba(5, 150, 105, 0.08)',
    'rgba(5, 150, 105, 0.06)',
    'rgba(79, 70, 229, 0.07)',
    'rgba(217, 119, 6, 0.05)',
  ],
};

function getThemeColors(): ThemeColors {
  return document.documentElement.classList.contains('light') ? LIGHT_COLORS : DARK_COLORS;
}

function initHeroCanvas(): void {
  const canvas = document.getElementById('hero-canvas') as HTMLCanvasElement | null;
  if (!canvas) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Hide fallback gradients when canvas is active
  document.querySelectorAll('.hero-canvas-fallback').forEach((el) => {
    (el as HTMLElement).style.display = 'none';
  });

  let width = 0;
  let height = 0;
  let animationId: number | null = null;
  let colors = getThemeColors();

  function resize(): void {
    const rect = canvas!.parentElement!.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas!.width = width * window.devicePixelRatio;
    canvas!.height = height * window.devicePixelRatio;
    ctx!.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  // First resize to get dimensions
  resize();

  // Create blobs
  const blobs: GradientBlob[] = colors.blobs.map((color, i) => ({
    x: width * (0.2 + i * 0.2),
    y: height * (0.3 + (i % 2) * 0.3),
    radius: Math.max(width, height) * (0.3 + i * 0.05),
    color,
    speedX: 0.3 + i * 0.1,
    speedY: 0.2 + i * 0.15,
    phase: i * Math.PI * 0.5,
  }));

  // Particle system
  const mouse = { x: -1000, y: -1000 };
  const isMobile = window.innerWidth < 768;
  const particleCount = isMobile ? 30 : window.innerWidth < 1024 ? 50 : 70;

  const particles: Particle[] = Array.from({ length: particleCount }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.6,
    vy: (Math.random() - 0.5) * 0.6,
    radius: 1.5 + Math.random() * 1.5,
    opacity: 0.3 + Math.random() * 0.4,
  }));

  if (!isMobile) {
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas!.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    canvas.addEventListener('mouseleave', () => {
      mouse.x = -1000;
      mouse.y = -1000;
    });
  }

  let particleColor = document.documentElement.classList.contains('light')
    ? 'rgba(5, 150, 105,' : 'rgba(16, 185, 129,';
  const CONNECTION_DIST = 150;

  let time = 0;
  let lastFrame = 0;
  const FPS_INTERVAL = 1000 / 30;

  function drawMeshGradient(): void {
    ctx!.clearRect(0, 0, width, height);

    blobs.forEach((blob) => {
      const bx = width * 0.5 + Math.sin(time * blob.speedX + blob.phase) * width * 0.3;
      const by = height * 0.5 + Math.cos(time * blob.speedY + blob.phase) * height * 0.25;

      const gradient = ctx!.createRadialGradient(bx, by, 0, bx, by, blob.radius);
      gradient.addColorStop(0, blob.color);
      gradient.addColorStop(1, 'transparent');

      ctx!.globalCompositeOperation = 'lighter';
      ctx!.fillStyle = gradient;
      ctx!.fillRect(0, 0, width, height);
    });
  }

  function drawParticles(): void {
    // Update positions
    particles.forEach((p) => {
      if (!isMobile) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          p.vx += dx * 0.00015;
          p.vy += dy * 0.00015;
        }
      }

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      p.vx *= 0.999;
      p.vy *= 0.999;
    });

    // Draw connections
    ctx!.globalCompositeOperation = 'source-over';
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.15;
          ctx!.strokeStyle = `${particleColor}${alpha})`;
          ctx!.lineWidth = 0.5;
          ctx!.beginPath();
          ctx!.moveTo(particles[i].x, particles[i].y);
          ctx!.lineTo(particles[j].x, particles[j].y);
          ctx!.stroke();
        }
      }
    }

    // Draw particles
    particles.forEach((p) => {
      ctx!.globalCompositeOperation = 'source-over';
      ctx!.fillStyle = `${particleColor}${p.opacity})`;
      ctx!.beginPath();
      ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx!.fill();
    });
  }

  function animate(timestamp: number): void {
    const elapsed = timestamp - lastFrame;
    if (elapsed >= FPS_INTERVAL) {
      lastFrame = timestamp - (elapsed % FPS_INTERVAL);
      time += 0.005;
      drawMeshGradient();
      drawParticles();
    }
    animationId = requestAnimationFrame(animate);
  }

  // Intersection Observer: pause when not visible
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        if (!animationId) animationId = requestAnimationFrame(animate);
      } else {
        if (animationId) {
          cancelAnimationFrame(animationId);
          animationId = null;
        }
      }
    },
    { threshold: 0.1 }
  );

  // Theme change observer
  const themeObserver = new MutationObserver(() => {
    colors = getThemeColors();
    blobs.forEach((blob, i) => {
      blob.color = colors.blobs[i];
    });
    particleColor = document.documentElement.classList.contains('light')
      ? 'rgba(5, 150, 105,' : 'rgba(16, 185, 129,';
  });

  // Reduced motion: draw single static frame
  if (prefersReducedMotion) {
    time = 0.5;
    drawMeshGradient();
    drawParticles();
    return;
  }

  observer.observe(canvas);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });

  window.addEventListener('resize', resize);
  animationId = requestAnimationFrame(animate);

  // Cleanup for View Transitions
  const cleanup = (): void => {
    if (animationId) cancelAnimationFrame(animationId);
    animationId = null;
    observer.disconnect();
    themeObserver.disconnect();
    window.removeEventListener('resize', resize);
  };

  document.addEventListener('astro:before-swap', cleanup, { once: true });
}

document.addEventListener('DOMContentLoaded', initHeroCanvas);
document.addEventListener('astro:after-swap', initHeroCanvas);
