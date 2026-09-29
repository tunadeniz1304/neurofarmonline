import type { ScenarioId } from '../../data/site';
import { DECISION_SECONDS, DECISIONS_PER_DAY, LAYERS, SCENARIO_PARAMS, START_DECISION } from './config';
import type { Geometry } from './geometry';

export interface Spike {
  lane: number;
  x: number;
}

export interface Pulse {
  ax: number;
  ay: number;
  bx: number;
  by: number;
  t: number;
  duration: number;
  layer: number;
  node: number;
}

/**
 * Illustrative state machine: spikes stream along the input lanes and, once per
 * decision period, a forward pass ripples through the layers and nudges the actuators.
 * Activity is random (~50% of hidden neurons fire) — it explains the idea, it is not the policy.
 */
export class LoopSimulation {
  scenario: ScenarioId = 'nominal';
  spikes: Spike[] = [];
  pulses: Pulse[] = [];
  activation: Float32Array[] = LAYERS.map((n) => new Float32Array(n));
  actuators: number[] = [...SCENARIO_PARAMS.nominal.actuators];
  decision = START_DECISION;
  phase = 0; // seconds into the current decision period

  private target: number[] = [...this.actuators];
  private waveT = -1;
  private waveStage = 0;

  constructor(private geo: Geometry, private onDecision: (decision: number) => void) {}

  setGeometry(geo: Geometry) {
    this.geo = geo;
    this.spikes = [];
    this.pulses = [];
  }

  setScenario(id: ScenarioId) {
    this.scenario = id;
  }

  /** Starts a new decision immediately (used on first play). */
  kickoff() {
    this.waveT = 0;
    this.waveStage = 0;
  }

  step(dt: number) {
    const g = this.geo;
    const { rates } = SCENARIO_PARAMS[this.scenario];

    // Input spikes
    for (let lane = 0; lane < rates.length; lane++) {
      if (Math.random() < rates[lane] * dt) this.spikes.push({ lane, x: g.laneX0 });
    }
    const speed = (g.laneX1 - g.laneX0) / 1.7;
    for (let i = this.spikes.length - 1; i >= 0; i--) {
      const s = this.spikes[i];
      s.x += speed * dt;
      if (s.x >= g.laneX1) {
        this.activation[0][s.lane] = 1;
        this.spikes.splice(i, 1);
      }
    }

    // Activation decay
    const hiddenDecay = Math.exp(-dt * 3.2);
    const outputDecay = Math.exp(-dt * 1.2);
    this.activation.forEach((layer, l) => {
      const k = l === LAYERS.length - 1 ? outputDecay : hiddenDecay;
      for (let j = 0; j < layer.length; j++) layer[j] *= k;
    });

    // Decision clock
    this.phase += dt;
    if (this.phase >= DECISION_SECONDS) {
      this.phase -= DECISION_SECONDS;
      this.decision = (this.decision + 1) % DECISIONS_PER_DAY;
      this.onDecision(this.decision);
      this.kickoff();
    }

    // Forward-pass wave, layer by layer
    if (this.waveT >= 0) {
      this.waveT += dt;
      // Hidden layer 1 fires at once, layer 2 at 0.45 s, the output layer at 0.9 s.
      const stageStart = [0, 0.45, 0.9];
      while (this.waveStage < stageStart.length && this.waveT >= stageStart[this.waveStage]) {
        this.waveStage += 1;
        this.fire(this.waveStage);
      }
      if (this.waveT > 1.6) this.waveT = -1;
    }

    for (let i = this.pulses.length - 1; i >= 0; i--) {
      const p = this.pulses[i];
      p.t += dt;
      if (p.t >= p.duration) {
        this.activation[p.layer][p.node] = 1;
        this.pulses.splice(i, 1);
      }
    }

    const ease = 1 - Math.exp(-dt * 2.6);
    for (let a = 0; a < this.actuators.length; a++) {
      this.actuators[a] += (this.target[a] - this.actuators[a]) * ease;
    }
  }

  /** A representative still frame for reduced motion / paused state. */
  snapshot() {
    const g = this.geo;
    const { rates, actuators } = SCENARIO_PARAMS[this.scenario];
    this.spikes = [];
    this.pulses = [];
    rates.forEach((rate, lane) => {
      const n = Math.max(1, Math.round(rate * 1.7));
      for (let k = 0; k < n; k++) {
        const offset = 0.35 + ((lane * 0.13) % 0.5);
        this.spikes.push({ lane, x: (g.laneX1 - g.laneX0) * ((k + offset) / n) });
      }
    });
    this.activation.forEach((layer, l) => {
      for (let j = 0; j < layer.length; j++) {
        layer[j] = l === 0 ? 0.6 : l === LAYERS.length - 1 ? 0.8 : (j * 7 + l * 3) % 2 === 0 ? 0.85 : 0;
      }
    });
    this.actuators = [...actuators];
    this.target = [...actuators];
    this.phase = 0;
  }

  private fire(layer: number) {
    const nodes = this.geo.nodes;
    const isOutput = layer === LAYERS.length - 1;
    const chosen: number[] = [];
    for (let i = 0; i < LAYERS[layer]; i++) if (isOutput || Math.random() < 0.5) chosen.push(i);

    let sources: number[] = [];
    for (let k = 0; k < LAYERS[layer - 1]; k++) {
      if (layer === 1 || this.activation[layer - 1][k] > 0.25) sources.push(k);
    }
    if (!sources.length) sources = Array.from({ length: LAYERS[layer - 1] }, (_, i) => i);

    for (const node of chosen) {
      const fanIn = isOutput ? 3 : 2;
      for (let p = 0; p < fanIn; p++) {
        const src = sources[Math.floor(Math.random() * sources.length)];
        const a = nodes[layer - 1][src];
        const b = nodes[layer][node];
        this.pulses.push({ ax: a.x, ay: a.y, bx: b.x, by: b.y, t: 0, duration: 0.38 + Math.random() * 0.1, layer, node });
      }
    }

    if (isOutput) {
      this.target = SCENARIO_PARAMS[this.scenario].actuators.map((v) =>
        Math.max(0.03, Math.min(0.97, v + (Math.random() - 0.5) * 0.08)),
      );
    }
  }
}
