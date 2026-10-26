import type { Rng } from "../core/random";
import { linspace, quantile } from "../core/stats";
import { continuous } from "./continuous";
import { discrete } from "./discrete";
import type { DistDef, Params } from "./types";

export type { DistDef, Params, ParamDef, L, Group } from "./types";

export const DISTRIBUTIONS: DistDef[] = [...continuous, ...discrete];
const BY_ID = new Map(DISTRIBUTIONS.map((d) => [d.id, d]));

export function getDist(id: string): DistDef {
  const def = BY_ID.get(id);
  if (!def) throw new Error(`Unknown distribution: ${id}`);
  return def;
}

export const ALL_IDS = DISTRIBUTIONS.map((d) => d.id);

/**
 * Up to `n` wrong options for a shape question. Never from the answer's
 * look-alike group (a gamma and a chi-square can't be told apart by eye),
 * nor two from the same group, preferring the given pool.
 */
export function pickDistractors(rng: Rng, answer: string, pool: string[], n: number): string[] {
  const groupOf = (id: string) => getDist(id).group;
  const out: string[] = [];
  const used = new Set([groupOf(answer)]);
  const tryAdd = (candidates: string[]) => {
    for (const id of rng.shuffle(candidates)) {
      if (out.length >= n) return;
      if (id === answer || out.includes(id) || used.has(groupOf(id))) continue;
      out.push(id);
      used.add(groupOf(id));
    }
  };
  tryAdd(pool);
  const kind = getDist(answer).kind;
  tryAdd(ALL_IDS.filter((id) => getDist(id).kind === kind));
  tryAdd(ALL_IDS);
  return out;
}

/** x range to frame a histogram of `sample`. */
export function frameSample(def: DistDef, p: Params, sample: number[]): [number, number] {
  if (def.kind === "discrete") {
    const hi = Math.max(...sample);
    return [-0.5, Math.max(hi + 1.5, 4.5)];
  }
  const [qa, qb] = def.view ?? [0.005, 0.995];
  const lo = quantile(sample, qa);
  const hi = quantile(sample, qb);
  const pad = (hi - lo) * 0.1;
  return [def.lower ? def.lower(p) : lo - pad, def.upper ? def.upper(p) : hi + pad];
}

/** Integer points (discrete) or a fine grid (continuous) across a range. */
export function gridFor(def: DistDef, range: [number, number], samples = 240): number[] {
  if (def.kind === "discrete") {
    const out: number[] = [];
    for (let k = Math.ceil(range[0]); k <= Math.floor(range[1]); k++) out.push(k);
    return out;
  }
  return linspace(range[0], range[1], samples);
}

/**
 * How much two members of the same family overlap on a range, from 0 to 1
 * (1 minus half the L1 distance between densities). 0.9 = 90% shared area.
 */
export function overlap(def: DistDef, a: Params, b: Params, range: [number, number], resolution = 1200): number {
  if (def.valid && (!def.valid(a) || !def.valid(b))) return 0;
  const l1 = integrate(def, range, (x) => Math.abs(def.density(x, a) - def.density(x, b)), resolution);
  return Math.max(0, 1 - l1 / 2);
}

/** Share of the probability that falls inside the range. */
export function massIn(def: DistDef, p: Params, range: [number, number], resolution = 2000): number {
  return integrate(def, range, (x) => def.density(x, p), resolution);
}

/** Sum over integers (discrete) or trapezoid rule (continuous). */
function integrate(def: DistDef, range: [number, number], raw: (x: number) => number, resolution: number): number {
  // Densities can blow up at a single point (e.g. a Weibull with k < 1 at 0); that point has no area.
  const fn = (x: number) => {
    const v = raw(x);
    return Number.isFinite(v) ? v : 0;
  };
  const xs = gridFor(def, range, resolution);
  if (def.kind === "discrete") return xs.reduce((acc, x) => acc + fn(x), 0);
  const dx = xs[1] - xs[0];
  let total = 0;
  let prev = fn(xs[0]);
  for (let i = 1; i < xs.length; i++) {
    const cur = fn(xs[i]);
    total += ((prev + cur) / 2) * dx;
    prev = cur;
  }
  return total;
}

/** Highest density value on a range (for a y axis). */
export function peakIn(def: DistDef, p: Params, range: [number, number]): number {
  return Math.max(...gridFor(def, range, 400).map((x) => def.density(x, p)).filter(Number.isFinite));
}

/** A random point on the slider grid inside the target range. */
export function drawTargetParams(rng: Rng, def: DistDef): Params {
  const fit = def.fit!;
  const out: Params = {};
  for (const param of def.params) {
    const [min, max, step] = fit.grid[param.key];
    const [lo, hi] = fit.target?.[param.key] ?? [min, max];
    out[param.key] = rng.step(Math.max(lo, min), Math.min(hi, max), step);
  }
  return out;
}

export const FITTABLE_IDS = DISTRIBUTIONS.filter((d) => d.fit).map((d) => d.id);

/**
 * What each parameter is, conceptually. Two parameters with the same concept
 * (p in a binomial and p in a geometric: both "probability of success") read
 * almost the same, so matching or meaning questions never pit them against
 * each other.
 */
const CONCEPTS: Record<string, Record<string, string>> = {
  normal: { mu: "location", sigma: "spread" },
  uniform: { a: "min", b: "max" },
  exponential: { lambda: "rate" },
  lognormal: { mu: "log-location", sigma: "log-spread" },
  gamma: { alpha: "shape", beta: "rate" },
  beta: { alpha: "pull-one", beta: "pull-zero" },
  "chi-square": { k: "df" },
  "student-t": { nu: "df" },
  f: { d1: "df", d2: "df" },
  weibull: { k: "shape", lambda: "spread" },
  pareto: { xm: "min", alpha: "tail" },
  cauchy: { x0: "location", gamma: "spread" },
  laplace: { mu: "location", b: "spread" },
  logistic: { mu: "location", s: "spread" },
  triangular: { a: "min", c: "mode", b: "max" },
  gumbel: { mu: "location", beta: "spread" },
  rayleigh: { sigma: "spread" },
  poisson: { lambda: "rate" },
  binomial: { n: "trials", p: "success" },
  bernoulli: { p: "success" },
  geometric: { p: "success" },
  "negative-binomial": { r: "successes", p: "success" },
  hypergeometric: { N: "population", K: "population-successes", n: "trials" },
  "discrete-uniform": { a: "min", b: "max" },
};

export function conceptOf(dist: string, key: string): string {
  const concept = CONCEPTS[dist]?.[key];
  if (!concept) throw new Error(`No concept for ${dist}.${key}`);
  return concept;
}
