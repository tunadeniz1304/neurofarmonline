interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  type: 'conduit' | 'ambient';
}

export function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas') as HTMLCanvasElement | null;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  function resize() {
    const rect = canvas!.parentElement!.getBoundingClientRect();
    canvas!.width = rect.width;
    canvas!.height = rect.height;
  }

  resize();
  window.addEventListener('resize', resize);

  const particles: Particle[] = [];

  // Energy conduit path control points (normalized 0-1 relative to SVG viewBox 900x400)
  function getConduitPoint(t: number): { x: number; y: number } {
    const w = canvas!.width;
    const h = canvas!.height;
    // Bezier approximation of the SVG conduit path
    const sx = 502 / 900, sy = 195 / 400;
    const c1x = 545 / 900, c1y = 195 / 400;
    const c2x = 580 / 900, c2y = 220 / 400;
    const c3x = 620 / 900, c3y = 260 / 400;
    const ex = 700 / 900, ey = 360 / 400;

    // Simplified cubic interpolation
    const u = 1 - t;
    const x = u * u * u * sx + 3 * u * u * t * ((c1x + c2x) / 2) + 3 * u * t * t * ((c2x + c3x) / 2) + t * t * t * ex;
    const y = u * u * u * sy + 3 * u * u * t * ((c1y + c2y) / 2) + 3 * u * t * t * ((c2y + c3y) / 2) + t * t * t * ey;

    return { x: x * w, y: y * h };
  }

  function spawnConduitParticle() {
    const t = Math.random() * 0.3; // Start near the chip end
    const pt = getConduitPoint(t);
    const nextPt = getConduitPoint(t + 0.05);
    const dx = nextPt.x - pt.x;
    const dy = nextPt.y - pt.y;
    const len = Math.sqrt(dx * dx + dy * dy);

    particles.push({
      x: pt.x + (Math.random() - 0.5) * 8,
      y: pt.y + (Math.random() - 0.5) * 8,
      vx: (dx / len) * (1.5 + Math.random()),
      vy: (dy / len) * (1.5 + Math.random()),
      life: 0,
      maxLife: 50 + Math.random() * 30,
      size: 1 + Math.random() * 2.5,
      type: 'conduit',
    });
  }

  function spawnAmbientParticle() {
    // Subtle ambient glow near the plant area
    const w = canvas!.width;
    const h = canvas!.height;
    particles.push({
      x: w * (0.7 + Math.random() * 0.15),
      y: h * (0.3 + Math.random() * 0.5),
      vx: (Math.random() - 0.5) * 0.3,
      vy: -0.2 - Math.random() * 0.3,
      life: 0,
      maxLife: 60 + Math.random() * 40,
      size: 0.8 + Math.random() * 1.5,
      type: 'ambient',
    });
  }

  let frame = 0;
  let started = false;

  // Start after conduit begins drawing (2s delay + some buffer)
  setTimeout(() => { started = true; }, 3000);

  function draw() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (started) {
      if (frame % 4 === 0) spawnConduitParticle();
      if (frame % 12 === 0) spawnAmbientParticle();
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.type === 'conduit') {
        // Slight drift toward the conduit path
        p.vy += (Math.random() - 0.5) * 0.08;
        p.vx += (Math.random() - 0.5) * 0.05;
      }

      p.life++;
      const alpha = 1 - p.life / p.maxLife;
      if (alpha <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      if (p.type === 'conduit') {
        ctx.globalAlpha = alpha * 0.6;
        ctx.fillStyle = '#A8E06C';
        ctx.shadowColor = '#A8E06C';
        ctx.shadowBlur = 10;
      } else {
        ctx.globalAlpha = alpha * 0.25;
        ctx.fillStyle = '#4CAF50';
        ctx.shadowColor = '#4CAF50';
        ctx.shadowBlur = 6;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    frame++;
    requestAnimationFrame(draw);
  }

  draw();
}
