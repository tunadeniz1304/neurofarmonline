import { LAYERS } from './config';

export interface Point {
  x: number;
  y: number;
}

export interface Geometry {
  width: number;
  height: number;
  narrow: boolean;
  font: number;
  top: number;
  bottom: number;
  laneX0: number;
  laneX1: number;
  layerX: number[];
  outX0: number;
  outX1: number;
  laneY: number[];
  outY: number[];
  nodes: Point[][];
  dayY: number;
}

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

/** Computes every position the renderer needs from the container width. */
export function computeGeometry(width: number): Geometry {
  const narrow = width < 480;
  const height = Math.round(width * (narrow ? 1.02 : 0.78));
  const top = height * (narrow ? 0.1 : 0.09);
  const bottom = height * (narrow ? 0.8 : 0.82);
  const span = bottom - top;
  const font = narrow ? 10 : Math.max(10.5, Math.min(12, width / 50));

  const layerX = narrow
    ? [width * 0.32, width * 0.46, width * 0.6, width * 0.72]
    : [width * 0.345, width * 0.475, width * 0.605, width * 0.73];

  const laneY = range(LAYERS[0]).map((i) => top + ((i + 0.5) * span) / LAYERS[0]);
  const outY = range(LAYERS[3]).map((j) => top + ((j + 0.5) * span) / LAYERS[3]);

  const nodes: Point[][] = [
    laneY.map((y) => ({ x: layerX[0], y })),
    range(LAYERS[1]).map((i) => ({ x: layerX[1], y: top + 4 + (i * (span - 8)) / (LAYERS[1] - 1) })),
    range(LAYERS[2]).map((i) => ({ x: layerX[2], y: top + span * 0.08 + (i * span * 0.84) / (LAYERS[2] - 1) })),
    outY.map((y) => ({ x: layerX[3], y })),
  ];

  return {
    width,
    height,
    narrow,
    font,
    top,
    bottom,
    laneX0: 0,
    laneX1: width * (narrow ? 0.26 : 0.28),
    layerX,
    outX0: width * 0.765,
    outX1: width - 1,
    laneY,
    outY,
    nodes,
    dayY: height - font * 1.6,
  };
}
