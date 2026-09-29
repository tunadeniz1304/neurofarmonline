import { actuators, sensors } from '../../data/site';
import { DECISIONS_PER_DAY, LAYERS, type Palette } from './config';
import type { Geometry } from './geometry';
import type { LoopSimulation } from './simulation';

const TAU = Math.PI * 2;
const mono = (size: number) => `500 ${size}px "JetBrains Mono", ui-monospace, monospace`;

function withAlpha(hex: string, alpha: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha.toFixed(3)})`;
}

function mix(from: string, to: string, t: number): string {
  const a = parseInt(from.replace('#', ''), 16);
  const b = parseInt(to.replace('#', ''), 16);
  const ch = (shift: number) => Math.round(((a >> shift) & 255) + (((b >> shift) & 255) - ((a >> shift) & 255)) * t);
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
}

export class LoopRenderer {
  private ctx: CanvasRenderingContext2D;
  private staticLayer = document.createElement('canvas');
  private dpr = 1;
  private geo!: Geometry;

  constructor(private canvas: HTMLCanvasElement, private colors: Palette) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D not supported');
    this.ctx = ctx;
  }

  resize(geo: Geometry) {
    this.geo = geo;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(geo.width * this.dpr);
    this.canvas.height = Math.round(geo.height * this.dpr);
    this.canvas.style.height = `${geo.height}px`;
    this.buildStaticLayer();
  }

  /** Everything that never moves: lanes, labels, faint connectivity, tracks, day ruler. */
  buildStaticLayer() {
    const g = this.geo;
    const c = this.colors;
    const layer = this.staticLayer;
    layer.width = this.canvas.width;
    layer.height = this.canvas.height;
    const s = layer.getContext('2d');
    if (!s) return;
    s.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    s.clearRect(0, 0, g.width, g.height);
    s.textBaseline = 'alphabetic';

    // Sensor lanes
    s.lineWidth = 1;
    g.laneY.forEach((y, i) => {
      s.strokeStyle = c.line;
      s.beginPath();
      s.moveTo(g.laneX0, y + 0.5);
      s.lineTo(g.laneX1, y + 0.5);
      s.moveTo(g.laneX1 + 4, y + 0.5);
      s.lineTo(g.layerX[0] - 6, y + 0.5);
      s.stroke();
      s.fillStyle = c.muted;
      s.font = mono(g.font);
      s.fillText((g.narrow ? sensors[i].short : sensors[i].chart).toUpperCase(), 0, y - g.font * 1.9);
    });

    // Dense connectivity, very faint
    s.lineWidth = 0.6;
    for (let l = 0; l < LAYERS.length - 1; l++) {
      s.strokeStyle = l === 2 ? withAlpha(c.amber, 0.1) : withAlpha(c.accent, l === 0 ? 0.1 : 0.045);
      s.beginPath();
      for (const a of g.nodes[l]) {
        for (const b of g.nodes[l + 1]) {
          s.moveTo(a.x, a.y);
          s.lineTo(b.x, b.y);
        }
      }
      s.stroke();
    }

    // Actuator connectors, labels, tracks
    s.lineWidth = 1.5;
    s.strokeStyle = withAlpha(c.amber, 0.6);
    g.outY.forEach((y, j) => {
      s.beginPath();
      s.moveTo(g.layerX[3] + 8, y);
      s.lineTo(g.outX0 - 4, y);
      s.stroke();
      s.fillStyle = c.muted;
      s.font = mono(g.font);
      s.fillText((g.narrow ? actuators[j].short : actuators[j].chart).toUpperCase(), g.outX0, y - g.font * 0.9);
      s.fillStyle = c.track;
      s.fillRect(g.outX0, y + 2, g.outX1 - g.outX0, 5);
    });

    // Layer counts
    s.fillStyle = c.faint;
    s.font = mono(g.font - 0.5);
    s.textAlign = 'center';
    const cy = g.bottom + g.font * 2.4;
    LAYERS.forEach((n, i) => s.fillText(String(n), g.layerX[i], cy));
    s.fillText(g.narrow ? 'SPIKES IN' : 'SENSOR SPIKES', (g.laneX0 + g.laneX1) / 2, cy);
    s.fillText(g.narrow ? 'OUT' : 'ACTUATORS', (g.outX0 + g.outX1) / 2, cy);

    // Day ruler
    s.fillStyle = c.track;
    s.fillRect(0, g.dayY, g.width, 3);
    s.fillStyle = c.faint;
    s.font = mono(g.font - 1);
    for (let h = 0; h <= 24; h += 6) s.fillRect(Math.min((g.width * h) / 24, g.width - 1), g.dayY - 4, 1, 11);
    s.textAlign = 'left';
    s.fillText('00:00', 0, g.dayY - 8);
    s.textAlign = 'right';
    s.fillText('24:00', g.width, g.dayY - 8);
    s.textAlign = 'center';
    s.fillText(g.narrow ? '288 DECISIONS / DAY' : 'ONE FORWARD PASS EVERY 5 MIN · 288 PER DAY', g.width / 2, g.dayY - 8);
    s.textAlign = 'left';
  }

  draw(sim: LoopSimulation, progress: number) {
    const { ctx, geo: g, colors: c } = this;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.drawImage(this.staticLayer, 0, 0);
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    // Input spikes
    const spikeH = g.narrow ? 12 : 16;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    for (const s of sim.spikes) {
      const y = g.laneY[s.lane];
      const near = s.x / (g.laneX1 || 1);
      ctx.strokeStyle = near > 0.85 ? c.accent : c.ink;
      ctx.globalAlpha = 0.35 + 0.65 * Math.min(1, near * 1.3);
      ctx.beginPath();
      ctx.moveTo(s.x, y);
      ctx.lineTo(s.x, y - spikeH);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Travelling pulses
    for (const p of sim.pulses) {
      const t = Math.min(1, p.t / p.duration);
      const t0 = Math.max(0, t - 0.25);
      const x = p.ax + (p.bx - p.ax) * t;
      const y = p.ay + (p.by - p.ay) * t;
      const hue = p.layer === LAYERS.length - 1 ? c.amber : c.accent;
      ctx.strokeStyle = withAlpha(hue, 0.55);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(p.ax + (p.bx - p.ax) * t0, p.ay + (p.by - p.ay) * t0);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.fillStyle = hue;
      ctx.beginPath();
      ctx.arc(x, y, 1.8, 0, TAU);
      ctx.fill();
    }

    // Neurons
    const radius = g.narrow ? [3.5, 2.2, 2.8, 5] : [4.5, 2.8, 3.6, 6.5];
    g.nodes.forEach((layer, l) => {
      layer.forEach((n, i) => {
        const a = sim.activation[l][i];
        if (l === LAYERS.length - 1) {
          ctx.fillStyle = withAlpha(c.amber, 0.45 + 0.55 * a);
          ctx.beginPath();
          ctx.arc(n.x, n.y, radius[l], 0, TAU);
          ctx.fill();
          if (a > 0.05) this.ring(n.x, n.y, radius[l] + 3 + (1 - a) * 6, withAlpha(c.amber, a * 0.5));
          return;
        }
        ctx.fillStyle = l === 0 ? mix(c.ink, c.accent, a) : c.dim;
        ctx.beginPath();
        ctx.arc(n.x, n.y, radius[l], 0, TAU);
        ctx.fill();
        if (l > 0 && a > 0.02) {
          ctx.fillStyle = withAlpha(c.accent, a);
          ctx.beginPath();
          ctx.arc(n.x, n.y, radius[l] + 0.4, 0, TAU);
          ctx.fill();
        }
        if (l === 0 && a > 0.05) this.ring(n.x, n.y, radius[l] + 2 + (1 - a) * 5, withAlpha(c.accent, a * 0.6));
      });
    });

    // Actuator levels
    ctx.fillStyle = c.amber;
    g.outY.forEach((y, j) => ctx.fillRect(g.outX0, y + 2, (g.outX1 - g.outX0) * sim.actuators[j], 5));

    // Day progress
    const px = (g.width * (sim.decision + progress)) / DECISIONS_PER_DAY;
    ctx.fillStyle = withAlpha(c.accent, 0.55);
    ctx.fillRect(0, g.dayY, px, 3);
    ctx.fillStyle = c.accent;
    ctx.fillRect(Math.max(0, px - 1), g.dayY - 5, 2, 13);
  }

  private ring(x: number, y: number, r: number, color: string) {
    const ctx = this.ctx;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.stroke();
  }
}
