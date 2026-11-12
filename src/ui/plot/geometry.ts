import { VIEW } from "../../functions";
import { linearScale, type LinearScale } from "../chart/scale";

export const SIZE = 360;
export const COMPACT = 180;

export interface View {
  x: [number, number];
  y: [number, number];
}

export interface PlotScales {
  x: LinearScale;
  y: LinearScale;
  plot: { left: number; right: number; top: number; bottom: number };
  /** clip-path url that keeps marks inside the window. */
  clip: string;
  view: View;
  compact: boolean;
}

/** Scales of a plot, for code that needs coordinates outside the render callback. */
export function makeScales(view: View = VIEW, compact = false) {
  const size = compact ? COMPACT : SIZE;
  const pad = compact ? 4 : 8;
  const plot = { left: pad, right: size - pad, top: pad, bottom: size - pad };
  return {
    x: linearScale(view.x, [plot.left, plot.right]),
    y: linearScale(view.y, [plot.bottom, plot.top]),
    plot,
  };
}

/** Pixel position of a pointer event inside the plot, in math coordinates. */
export function pointerToMath(e: { clientX: number; clientY: number }, svg: SVGSVGElement, view: View = VIEW): { x: number; y: number } {
  const s = makeScales(view);
  const box = svg.getBoundingClientRect();
  const px = ((e.clientX - box.left) / box.width) * SIZE;
  const py = ((e.clientY - box.top) / box.height) * SIZE;
  return { x: s.x.invert(px), y: s.y.invert(py) };
}

/** Linear map (x, y) → (m[0]x + m[1]y, m[2]x + m[3]y): squashing and mirroring. */
export type Mat = [number, number, number, number];
export const IDENTITY: Mat = [1, 0, 0, 1];
/** Squash onto the y axis (t = 1 flattens every point to x = 0). */
export const squashX = (t: number): Mat => [1 - t, 0, 0, 1];
/** Squash onto the x axis. */
export const squashY = (t: number): Mat => [1, 0, 0, 1 - t];
/** Halfway between the identity and the swap (x, y) → (y, x): mirror across y = x at t = 1. */
export const mirror = (t: number): Mat => [1 - t, t, t, 1 - t];

