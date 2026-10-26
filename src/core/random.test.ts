import { describe, expect, it } from "vitest";
import { Rng } from "./random";
import { mean, sd } from "./stats";

describe("Rng", () => {
  it("is deterministic for a given seed", () => {
    const a = new Rng(42).sample(5, (r) => r.next());
    const b = new Rng(42).sample(5, (r) => r.next());
    expect(a).toEqual(b);
    expect(new Rng(43).next()).not.toBe(a[0]);
  });

  it("draws normals with the requested mean and sd", () => {
    const xs = new Rng(1).sample(20_000, (r) => r.normal(5, 2));
    expect(mean(xs)).toBeCloseTo(5, 1);
    expect(sd(xs)).toBeCloseTo(2, 1);
  });

  it("draws Poisson and gamma with the right means", () => {
    const rng = new Rng(2);
    expect(mean(rng.sample(20_000, (r) => r.poisson(4)))).toBeCloseTo(4, 1);
    expect(mean(rng.sample(20_000, (r) => r.gamma(2, 1.5)))).toBeCloseTo(3, 1);
    expect(mean(rng.sample(20_000, (r) => r.exponential(0.5)))).toBeCloseTo(2, 1);
  });

  it("keeps int() within bounds", () => {
    const rng = new Rng(3);
    const xs = rng.sample(2000, (r) => r.int(1, 3));
    expect(new Set(xs)).toEqual(new Set([1, 2, 3]));
  });
});
