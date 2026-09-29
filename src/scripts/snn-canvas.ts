/**
 * Animated spiking-network visual that mirrors NeuroFarm's actual control
 * policy topology: 5 sensor inputs -> 32 -> 16 -> 3 actuator outputs.
 * Spikes are drawn as travelling pulses; pointer proximity raises firing rate.
 */

type Node = { x: number; y: number; layer: number; v: number; flash: number; label?: string };
type Edge = { a: Node; b: Node; w: number };
type Spike = { e: Edge; t: number; speed: number };

const INPUTS = ['SOIL θ', 'TEMP / RH', 'PPFD', 'CO₂', 'EC'];
const OUTPUTS = ['IRRIGATION', 'LED PWM', 'NUTRIENT'];
const LAYERS = [5, 32, 16, 3];

const SIGNAL = [196, 243, 107];
const LEAF = [63, 209, 138];

export function initSnnCanvas(canvas: HTMLCanvasElement, opts: { labels?: boolean } = {}) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wantLabels = opts.labels ?? true;
  let showLabels = wantLabels;

  let w = 0;
  let h = 0;
  let dpr = 1;
  let nodes: Node[] = [];
  let edges: Edge[] = [];
  let spikes: Spike[] = [];
  const pointer = { x: -9999, y: -9999 };
  let running = false;
  let raf = 0;
  let last = performance.now();
  let drive = 0;

  // Deterministic PRNG so the layout is stable between resizes
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

  function build() {
    seed = 7;
    nodes = [];
    edges = [];
    spikes = [];
    showLabels = wantLabels && w >= 340;
    const padX = showLabels ? Math.min(120, w * 0.2) : w * 0.08;
    const padY = h * 0.1;
    const layerNodes: Node[][] = [];
    LAYERS.forEach((count, li) => {
      const x = padX + ((w - padX * 2) * li) / (LAYERS.length - 1);
      const span = li === 0 || li === LAYERS.length - 1 ? h * 0.5 : h - padY * 2;
      const top = (h - span) / 2;
      const arr: Node[] = [];
      for (let i = 0; i < count; i++) {
        const y = count === 1 ? h / 2 : top + (span * i) / (count - 1);
        const jitter = li === 1 || li === 2 ? (rand() - 0.5) * 18 : 0;
        const n: Node = { x: x + jitter, y, layer: li, v: rand(), flash: 0 };
        if (li === 0) n.label = INPUTS[i];
        if (li === LAYERS.length - 1) n.label = OUTPUTS[i];
        arr.push(n);
        nodes.push(n);
      }
      layerNodes.push(arr);
    });
    // Sparse connectivity keeps the drawing legible
    for (let li = 0; li < layerNodes.length - 1; li++) {
      const density = li === 0 ? 0.55 : li === 1 ? 0.22 : 0.6;
      for (const a of layerNodes[li]) {
        for (const b of layerNodes[li + 1]) {
          if (rand() < density) edges.push({ a, b, w: 0.3 + rand() * 0.7 });
        }
      }
    }
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = rect.width;
    h = rect.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
    // Reduced motion: a static but "alive-looking" frame
    if (reduced) nodes.forEach((n, i) => (n.flash = i % 4 === 0 ? 0.8 : 0));
    draw(0);
  }

  function fire(n: Node) {
    n.flash = 1;
    n.v = 0;
    for (const e of edges) {
      if (e.a === n && Math.random() < 0.7) spikes.push({ e, t: 0, speed: 1.4 + Math.random() * 0.8 });
    }
  }

  function step(dt: number) {
    drive += dt;
    // Input layer: sensor streams produce events at varying rates
    for (const n of nodes) {
      n.flash = Math.max(0, n.flash - dt * 2.4);
      if (n.layer === 0) {
        n.v += dt * (0.5 + 0.35 * Math.sin(drive * 0.7 + n.y * 0.02));
        const dx = pointer.x - n.x;
        const dy = pointer.y - n.y;
        if (dx * dx + dy * dy < 140 * 140) n.v += dt * 3;
        if (n.v >= 1) fire(n);
      } else {
        n.v = Math.max(0, n.v - dt * 0.35); // leak
        const dx = pointer.x - n.x;
        const dy = pointer.y - n.y;
        if (dx * dx + dy * dy < 90 * 90) n.v += dt * 1.2;
        if (n.v >= 1) fire(n);
      }
    }
    for (const s of spikes) s.t += dt * s.speed;
    const arrived = spikes.filter((s) => s.t >= 1);
    spikes = spikes.filter((s) => s.t < 1);
    for (const s of arrived) {
      s.e.b.v += 0.34 * s.e.w;
      if (s.e.b.layer === LAYERS.length - 1) s.e.b.flash = Math.min(1, s.e.b.flash + 0.25);
    }
    if (spikes.length > 600) spikes.splice(0, spikes.length - 600);
  }

  function rgba(c: number[], a: number) {
    return `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  }

  function draw(_dt: number) {
    ctx!.clearRect(0, 0, w, h);

    // Edges
    ctx!.lineWidth = 1;
    for (const e of edges) {
      ctx!.strokeStyle = `rgba(255,255,255,${0.028 + e.w * 0.03})`;
      ctx!.beginPath();
      ctx!.moveTo(e.a.x, e.a.y);
      ctx!.lineTo(e.b.x, e.b.y);
      ctx!.stroke();
    }

    // Spikes as short comet trails
    for (const s of spikes) {
      const { a, b } = s.e;
      const t0 = Math.max(0, s.t - 0.12);
      const x0 = a.x + (b.x - a.x) * t0;
      const y0 = a.y + (b.y - a.y) * t0;
      const x1 = a.x + (b.x - a.x) * s.t;
      const y1 = a.y + (b.y - a.y) * s.t;
      const g = ctx!.createLinearGradient(x0, y0, x1, y1);
      g.addColorStop(0, rgba(SIGNAL, 0));
      g.addColorStop(1, rgba(SIGNAL, 0.9));
      ctx!.strokeStyle = g;
      ctx!.lineWidth = 1.6;
      ctx!.beginPath();
      ctx!.moveTo(x0, y0);
      ctx!.lineTo(x1, y1);
      ctx!.stroke();
    }

    // Nodes
    for (const n of nodes) {
      const io = n.layer === 0 || n.layer === LAYERS.length - 1;
      const r = io ? 5 : 2.6;
      if (n.flash > 0.02) {
        const glow = ctx!.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 7);
        glow.addColorStop(0, rgba(io ? SIGNAL : LEAF, 0.45 * n.flash));
        glow.addColorStop(1, rgba(SIGNAL, 0));
        ctx!.fillStyle = glow;
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, r * 7, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.fillStyle = n.flash > 0.05 ? rgba(SIGNAL, 0.6 + 0.4 * n.flash) : io ? '#3a5446' : '#2a3f33';
      ctx!.beginPath();
      ctx!.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx!.fill();
      if (io) {
        ctx!.strokeStyle = rgba(SIGNAL, 0.25 + 0.5 * n.flash);
        ctx!.lineWidth = 1;
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, r + 4, 0, Math.PI * 2);
        ctx!.stroke();
      }
      if (showLabels && n.label) {
        ctx!.font = '500 11px "Geist Mono", ui-monospace, monospace';
        ctx!.fillStyle = rgba([232, 241, 234], 0.62 + 0.38 * n.flash);
        ctx!.textBaseline = 'middle';
        ctx!.textAlign = n.layer === 0 ? 'right' : 'left';
        ctx!.fillText(n.label, n.layer === 0 ? n.x - 16 : n.x + 16, n.y);
      }
    }
  }

  function loop(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    step(dt);
    draw(dt);
    raf = requestAnimationFrame(loop);
  }

  function start() {
    if (running || reduced) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  canvas.addEventListener('pointermove', (e) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
  });
  canvas.addEventListener('pointerleave', () => {
    pointer.x = pointer.y = -9999;
  });

  new ResizeObserver(resize).observe(canvas);
  let inView = false;
  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    inView ? start() : stop();
  }).observe(canvas);
  document.addEventListener('visibilitychange', () => (document.hidden || !inView ? stop() : start()));
}
