import type { ScenarioId } from '../../data/site';
import { DECISION_SECONDS, readPalette } from './config';
import { computeGeometry } from './geometry';
import { LoopRenderer } from './renderer';
import { LoopSimulation } from './simulation';

const pad = (n: number, width: number) => String(n).padStart(width, '0');

function formatReadout(decision: number): string {
  const minutes = ((decision + 1) * 5) % 1440;
  return `Decision ${pad(decision + 1, 3)} / 288 · ${pad(Math.floor(minutes / 60), 2)}:${pad(minutes % 60, 2)}`;
}

/**
 * Wires the Fig. 1 closed-loop figure: canvas animation, scenario buttons,
 * pause/play, off-screen pausing and reduced-motion handling.
 */
export function mountClosedLoop(root: HTMLElement) {
  const canvas = root.querySelector<HTMLCanvasElement>('[data-loop-canvas]');
  const readout = root.querySelector<HTMLElement>('[data-loop-readout]');
  const pauseBtn = root.querySelector<HTMLButtonElement>('[data-loop-pause]');
  const pauseLabel = root.querySelector<HTMLElement>('[data-loop-pause-label]');
  const pauseIcon = root.querySelector<SVGPathElement>('[data-loop-pause-icon]');
  const scenarioBtns = root.querySelectorAll<HTMLButtonElement>('[data-scenario]');
  if (!canvas || !canvas.getContext || !readout || !pauseBtn || !pauseLabel || !pauseIcon) return;

  const container = canvas.parentElement ?? root;
  const measure = () => Math.max(260, Math.round(container.getBoundingClientRect().width));

  let geo = computeGeometry(measure());
  const renderer = new LoopRenderer(canvas, readPalette(root));
  const sim = new LoopSimulation(geo, (d) => (readout.textContent = formatReadout(d)));
  renderer.resize(geo);
  readout.textContent = formatReadout(sim.decision);

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let running = !reducedMotion.matches;
  let visible = true;
  let raf = 0;
  let last = 0;

  const drawStill = () => {
    sim.snapshot();
    renderer.draw(sim, 0);
  };

  const frame = (ts: number) => {
    const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0;
    last = ts;
    sim.step(dt);
    renderer.draw(sim, sim.phase / DECISION_SECONDS);
    if (running && visible) {
      raf = requestAnimationFrame(frame);
    } else {
      raf = 0;
      last = 0;
    }
  };

  const kick = () => {
    if (running && visible && !raf) {
      last = 0;
      raf = requestAnimationFrame(frame);
    }
  };

  const setRunning = (next: boolean) => {
    running = next;
    pauseBtn.setAttribute('aria-pressed', String(!next));
    pauseLabel.textContent = next ? 'Pause' : 'Play';
    pauseIcon.setAttribute('d', next ? 'M3 2v8M9 2v8' : 'M3 1.5l7 4.5-7 4.5z');
    pauseIcon.setAttribute('fill', next ? 'none' : 'currentColor');
    if (next) kick();
  };

  scenarioBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      sim.setScenario(btn.dataset.scenario as ScenarioId);
      scenarioBtns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      if (!running) drawStill();
    });
  });

  pauseBtn.addEventListener('click', () => setRunning(!running));

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting && !document.hidden;
        kick();
      },
      { threshold: 0.05 },
    ).observe(canvas);
  }
  document.addEventListener('visibilitychange', () => {
    visible = !document.hidden;
    kick();
  });

  const relayout = () => {
    const width = measure();
    if (width === geo.width) return;
    geo = computeGeometry(width);
    sim.setGeometry(geo);
    renderer.resize(geo);
    // Resizing clears the canvas; repaint now instead of waiting for the next frame.
    if (running) renderer.draw(sim, sim.phase / DECISION_SECONDS);
    else drawStill();
  };
  new ResizeObserver(relayout).observe(container);

  // Labels are drawn on the canvas, so redraw once the web fonts have arrived.
  document.fonts?.ready.then(() => {
    renderer.buildStaticLayer();
    if (!running) drawStill();
  });

  if (running) {
    sim.kickoff();
    setRunning(true);
  } else {
    setRunning(false);
    drawStill();
  }
}
