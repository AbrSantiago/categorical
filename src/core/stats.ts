/** Descriptive statistics and probability densities. Pure functions only. */

export function mean(xs: readonly number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

/** Sample variance (n - 1 in the denominator). */
export function variance(xs: readonly number[]): number {
  const m = mean(xs);
  return xs.reduce((acc, x) => acc + (x - m) ** 2, 0) / (xs.length - 1);
}

export function sd(xs: readonly number[]): number {
  return Math.sqrt(variance(xs));
}

/** Quantile with linear interpolation (type 7, the R / NumPy default). */
export function quantile(xs: readonly number[], p: number): number {
  const sorted = [...xs].sort((a, b) => a - b);
  const h = (sorted.length - 1) * p;
  const lo = Math.floor(h);
  const hi = Math.ceil(h);
  return sorted[lo] + (h - lo) * (sorted[hi] - sorted[lo]);
}

export function median(xs: readonly number[]): number {
  return quantile(xs, 0.5);
}

export interface Bin {
  x0: number;
  x1: number;
  count: number;
  /** count / (n * width): lets a histogram share an axis with a pdf. */
  density: number;
}

/** Equal-width histogram over [min, max]. Values outside are ignored. */
export function histogram(xs: readonly number[], min: number, max: number, bins: number): Bin[] {
  const width = (max - min) / bins;
  const counts = new Array<number>(bins).fill(0);
  for (const x of xs) {
    if (x < min || x > max) continue;
    const i = Math.min(bins - 1, Math.floor((x - min) / width));
    counts[i]++;
  }
  return counts.map((count, i) => ({
    x0: min + i * width,
    x1: min + (i + 1) * width,
    count,
    density: count / (xs.length * width),
  }));
}

/** One bar per integer value — for discrete distributions. */
export function integerHistogram(xs: readonly number[], min: number, max: number): Bin[] {
  const out: Bin[] = [];
  for (let k = min; k <= max; k++) {
    const count = xs.filter((x) => x === k).length;
    out.push({ x0: k - 0.5, x1: k + 0.5, count, density: count / xs.length });
  }
  return out;
}

export function normalPdf(x: number, mu: number, sigma: number): number {
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
}

export function exponentialPdf(x: number, lambda: number): number {
  return x < 0 ? 0 : lambda * Math.exp(-lambda * x);
}

export function uniformPdf(x: number, a: number, b: number): number {
  return x < a || x > b ? 0 : 1 / (b - a);
}

export function logNormalPdf(x: number, mu: number, sigma: number): number {
  if (x <= 0) return 0;
  const z = (Math.log(x) - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (x * sigma * Math.sqrt(2 * Math.PI));
}

export function poissonPmf(k: number, lambda: number): number {
  if (k < 0 || !Number.isInteger(k)) return 0;
  let logP = -lambda + k * Math.log(lambda);
  for (let i = 2; i <= k; i++) logP -= Math.log(i);
  return Math.exp(logP);
}

export function linspace(min: number, max: number, n: number): number[] {
  return Array.from({ length: n }, (_, i) => min + ((max - min) * i) / (n - 1));
}
