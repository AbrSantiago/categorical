import type { Rng } from "../core/random";

/** A text in both languages. May contain inline TeX between `$...$`. */
export interface L {
  es: string;
  en: string;
}

export type Params = Record<string, number>;

export interface ParamDef {
  key: string;
  /** TeX symbol, e.g. "\\lambda". */
  tex: string;
  /** Short role, used in matching exercises: "tasa: eventos promedio por intervalo". */
  role: L;
  /** What happens when it grows; used in feedback. */
  effect: L;
  integer?: boolean;
}

/** Slider setup for the "fit the curve" exercise. */
export interface FitSetup {
  /** Fixed x range, so moving the sliders doesn't move the axis. */
  range: [number, number];
  start: Params;
  /** Per parameter: [min, max, step]. Targets are drawn from the same grid. */
  grid: Record<string, [number, number, number]>;
  /** Keep targets inside this sub-range when it differs from the slider range. */
  target?: Record<string, [number, number]>;
}

export type Group =
  | "bell"
  | "peak"
  | "flat"
  | "triangle"
  | "decay"
  | "hump"
  | "unit"
  | "d-binary"
  | "d-bell"
  | "d-decay"
  | "d-skew"
  | "d-flat";

export interface Fact {
  text: L;
  truth: boolean;
  why: L;
}

export interface DistDef {
  id: string;
  kind: "continuous" | "discrete";
  /**
   * Distributions in the same group look alike in a histogram (gamma vs
   * chi-square, say). Shape questions never ask to tell them apart.
   */
  group: Group;
  name: L;
  /** "una normal" / "a normal" */
  article: L;
  /** What gives it away in a histogram, written to follow "<article> ...". */
  trait: L;
  /** One line of what it models. */
  use: L;
  params: ParamDef[];
  /** Typical parameters for shape questions (they should look characteristic). */
  shapeParams(rng: Rng): Params;
  sample(rng: Rng, p: Params): number;
  /** pdf (continuous) or pmf (discrete). */
  density(x: number, p: Params): number;
  /** Where to start/end the x axis when the support is bounded (e.g. 0 for positive variables). */
  lower?(p: Params): number;
  upper?(p: Params): number;
  /** Rejects parameter combinations that make no sense (e.g. a ≥ b in a uniform). */
  valid?(p: Params): boolean;
  /** Quantiles used to frame a histogram when the support is unbounded. */
  view?: [number, number];
  /** Mean as TeX in terms of the parameters, plus plausible wrong answers. "NONE" means it has no mean. */
  mean?: { right: string; wrong: string[] };
  facts: Fact[];
  fit?: FitSetup;
}
