import type { ScenarioId } from '../../data/site';

/** Layer widths of the distilled policy network. */
export const LAYERS = [5, 32, 16, 3] as const;

/** One simulated decision period (5 min) in animation seconds. */
export const DECISION_SECONDS = 4.2;
export const DECISIONS_PER_DAY = 288;
export const START_DECISION = 72; // 06:00

/**
 * ILLUSTRATIVE ONLY. Input spike rates (spikes per animation second, per sensor lane)
 * and actuator levels (0–1) are invented to explain the idea. They are not model
 * output and must never be presented as results.
 */
export const SCENARIO_PARAMS: Record<ScenarioId, { rates: number[]; actuators: number[] }> = {
  nominal: { rates: [3, 3, 4, 3, 3], actuators: [0.45, 0.65, 0.35] },
  drought: { rates: [0.8, 5, 5, 3, 4.5], actuators: [0.85, 0.5, 0.3] },
  over: { rates: [7, 3, 3.5, 3, 1.6], actuators: [0.08, 0.65, 0.42] },
  co2: { rates: [3, 3, 4, 0.6, 3], actuators: [0.4, 0.45, 0.3] },
};

export interface Palette {
  ink: string;
  dim: string;
  line: string;
  muted: string;
  faint: string;
  accent: string;
  amber: string;
  track: string;
}

/** Reads colours from the CSS tokens so the canvas never drifts from the design system. */
export function readPalette(el: Element): Palette {
  const css = getComputedStyle(el);
  const v = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
  return {
    ink: v('--text', '#edf0e7'),
    dim: v('--line-2', '#3a4634'),
    line: v('--line-soft', '#2b3527'),
    muted: v('--muted', '#a7b09f'),
    faint: v('--faint', '#7f8977'),
    accent: v('--accent', '#c6f36b'),
    amber: v('--amber', '#f5b650'),
    track: v('--line', '#232b20'),
  };
}
