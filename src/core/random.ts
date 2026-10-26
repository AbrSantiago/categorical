/**
 * Seeded pseudo-random generator.
 *
 * Every exercise is generated from a seed, so the same seed always produces
 * the same exercise. That makes tests deterministic and, later on, lets two
 * players (or a server) reproduce exactly the same exercise from a number.
 */
export class Rng {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  /** Uniform float in [0, 1). Mulberry32. */
  next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  uniform(min: number, max: number): number {
    return min + (max - min) * this.next();
  }

  /** Integer in [min, max], both inclusive. */
  int(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1));
  }

  /** Uniform value on a grid: min, min + step, ..., max. */
  step(min: number, max: number, step: number): number {
    const n = Math.round((max - min) / step);
    return roundTo(min + this.int(0, n) * step, 6);
  }

  pick<T>(items: readonly T[]): T {
    return items[this.int(0, items.length - 1)];
  }

  shuffle<T>(items: readonly T[]): T[] {
    const out = [...items];
    for (let i = out.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  /** Normal(mu, sigma) via Box–Muller. */
  normal(mu = 0, sigma = 1): number {
    let u = 0;
    while (u === 0) u = this.next();
    const v = this.next();
    return mu + sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  /** Exponential with rate lambda (mean 1 / lambda). */
  exponential(lambda: number): number {
    let u = 0;
    while (u === 0) u = this.next();
    return -Math.log(u) / lambda;
  }

  /** Poisson(lambda) by Knuth's method — fine for the small lambdas we use. */
  poisson(lambda: number): number {
    const limit = Math.exp(-lambda);
    let k = 0;
    let p = 1;
    do {
      k++;
      p *= this.next();
    } while (p > limit);
    return k - 1;
  }

  /** Gamma(shape k, scale theta) via Marsaglia–Tsang. */
  gamma(k: number, theta: number): number {
    if (k < 1) {
      return this.gamma(k + 1, theta) * Math.pow(this.next(), 1 / k);
    }
    const d = k - 1 / 3;
    const c = 1 / Math.sqrt(9 * d);
    for (;;) {
      let x: number;
      let v: number;
      do {
        x = this.normal();
        v = 1 + c * x;
      } while (v <= 0);
      v = v * v * v;
      const u = this.next();
      if (u < 1 - 0.0331 * x ** 4) return d * v * theta;
      if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v * theta;
    }
  }

  logNormal(mu: number, sigma: number): number {
    return Math.exp(this.normal(mu, sigma));
  }

  sample(n: number, draw: (rng: Rng) => number): number[] {
    return Array.from({ length: n }, () => draw(this));
  }
}

export function roundTo(value: number, decimals: number): number {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

/** A fresh, non-deterministic seed (used when a lesson starts). */
export function randomSeed(): number {
  return Math.floor(Math.random() * 2 ** 32);
}
