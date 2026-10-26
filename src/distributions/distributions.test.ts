import { describe, expect, it } from "vitest";
import { Rng } from "../core/random";
import { lgamma } from "../core/special";
import { mean, quantile } from "../core/stats";
import { conceptOf, DISTRIBUTIONS, frameSample, gridFor, massIn, overlap, pickDistractors } from "./index";

describe("distribution library", () => {
  for (const def of DISTRIBUTIONS) {
    describe(def.id, () => {
      const rng = new Rng(11);
      const params = def.shapeParams(rng);
      const sample = rng.sample(40_000, (r) => def.sample(r, params));

      it("has a density that integrates to 1", () => {
        if (def.kind === "discrete") {
          expect(massIn(def, params, [0, Math.max(...sample) + 40])).toBeCloseTo(1, 4);
          return;
        }
        // The central 99.9% of the sample should hold ~99.9% of the density.
        const lo = Math.max(quantile(sample, 0.0005), def.lower?.(params) ?? -Infinity);
        const hi = quantile(sample, 0.9995);
        const expected = (def.lower ? 1 : 0.9995) - 0.0005;
        expect(Math.abs(massIn(def, params, [lo, hi], 40_000) - expected)).toBeLessThan(0.004);
      });

      it("samples agree with the density", () => {
        // The density's mass between two sample quantiles should match the 50% in between.
        const a = quantile(sample, 0.25);
        const b = quantile(sample, 0.75);
        if (def.kind === "discrete") {
          const inside = sample.filter((x) => x >= Math.ceil(a) && x <= Math.floor(b)).length / sample.length;
          expect(Math.abs(massIn(def, params, [Math.ceil(a), Math.floor(b)]) - inside)).toBeLessThan(0.015);
        } else {
          expect(Math.abs(massIn(def, params, [a, b], 20_000) - 0.5)).toBeLessThan(0.015);
        }
      });

      if (def.id !== "cauchy" && def.id !== "student-t") {
        it("samples have the density's mean", () => {
          const range: [number, number] =
            def.kind === "discrete" ? [0, Math.max(...sample) + 30] : [def.lower?.(params) ?? quantile(sample, 0.00001), quantile(sample, 0.99999)];
          const xs = gridFor(def, range, 40_000);
          const dx = def.kind === "discrete" ? 1 : xs[1] - xs[0];
          const mass = xs.reduce((acc, x) => acc + def.density(x, params) * dx, 0);
          const theoretical = xs.reduce((acc, x) => acc + x * def.density(x, params) * dx, 0) / mass;
          const spread = quantile(sample, 0.9) - quantile(sample, 0.1);
          expect(Math.abs(mean(sample) - theoretical)).toBeLessThan(0.03 * spread + 0.01);
        });
      }

      it("frames its histogram around the data", () => {
        const [lo, hi] = frameSample(def, params, sample.slice(0, 500));
        expect(hi).toBeGreaterThan(lo);
      });

      it("has texts and parameters in both languages", () => {
        for (const text of [def.name, def.article, def.trait, def.use, ...def.params.flatMap((p) => [p.role, p.effect])]) {
          expect(text.es.length).toBeGreaterThan(0);
          expect(text.en.length).toBeGreaterThan(0);
        }
        for (const p of def.params) expect(conceptOf(def.id, p.key)).toBeTruthy();
        expect(def.facts.some((f) => f.truth)).toBe(true);
        expect(def.facts.some((f) => !f.truth)).toBe(true);
      });

      if (def.fit) {
        it("has a fit setup whose start differs from typical targets", () => {
          for (const p of def.params) expect(def.fit!.grid[p.key]).toBeDefined();
          expect(overlap(def, def.fit!.start, def.fit!.start, def.fit!.range)).toBeCloseTo(1, 5);
        });
      }
    });
  }

  it("never offers a look-alike as a distractor", () => {
    const rng = new Rng(3);
    for (const def of DISTRIBUTIONS) {
      for (let i = 0; i < 20; i++) {
        const options = pickDistractors(rng, def.id, DISTRIBUTIONS.map((d) => d.id), 3);
        expect(options).toHaveLength(3);
        const groups = [def.group, ...options.map((id) => DISTRIBUTIONS.find((d) => d.id === id)!.group)];
        expect(new Set(groups).size).toBe(4);
      }
    }
  });
});

/** The TeX in `mean.right`, written as code, checked against simulated data. */
const MEAN_FORMULAS: Record<string, (p: Record<string, number>) => number> = {
  normal: (p) => p.mu,
  uniform: (p) => (p.a + p.b) / 2,
  exponential: (p) => 1 / p.lambda,
  lognormal: (p) => Math.exp(p.mu + p.sigma ** 2 / 2),
  gamma: (p) => p.alpha / p.beta,
  beta: (p) => p.alpha / (p.alpha + p.beta),
  "chi-square": (p) => p.k,
  "student-t": () => 0,
  f: (p) => p.d2 / (p.d2 - 2),
  weibull: (p) => p.lambda * Math.exp(lgamma(1 + 1 / p.k)),
  pareto: (p) => (p.alpha * p.xm) / (p.alpha - 1),
  laplace: (p) => p.mu,
  logistic: (p) => p.mu,
  triangular: (p) => (p.a + p.b + p.c) / 3,
  rayleigh: (p) => p.sigma * Math.sqrt(Math.PI / 2),
  poisson: (p) => p.lambda,
  binomial: (p) => p.n * p.p,
  bernoulli: (p) => p.p,
  geometric: (p) => 1 / p.p,
  "negative-binomial": (p) => (p.r * (1 - p.p)) / p.p,
  hypergeometric: (p) => (p.n * p.K) / p.N,
  "discrete-uniform": (p) => (p.a + p.b) / 2,
};

describe("mean formulas shown to the player", () => {
  for (const def of DISTRIBUTIONS.filter((d) => d.mean && d.mean.right !== "NONE")) {
    it(`${def.id}: ${def.mean!.right}`, () => {
      const formula = MEAN_FORMULAS[def.id];
      expect(formula, "missing formula in test").toBeDefined();
      const rng = new Rng(29);
      const params = def.shapeParams(rng);
      const sample = rng.sample(200_000, (r) => def.sample(r, params));
      const spread = quantile(sample, 0.9) - quantile(sample, 0.1);
      expect(Math.abs(mean(sample) - formula(params))).toBeLessThan(0.02 * spread + 0.005);
    });
  }
});
