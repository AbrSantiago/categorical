import { describe, expect, it } from "vitest";
import { histogram, integerHistogram, linspace, mean, median, normalPdf, poissonPmf, quantile, sd } from "./stats";

describe("descriptive statistics", () => {
  it("computes mean, median, sd and quantiles", () => {
    const xs = [1, 2, 3, 4, 100];
    expect(mean(xs)).toBe(22);
    expect(median(xs)).toBe(3);
    expect(sd([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(2.138, 3);
    expect(quantile([1, 2, 3, 4], 0.5)).toBe(2.5);
  });

  it("builds histograms whose densities integrate to 1", () => {
    const xs = linspace(0, 10, 1000);
    const bins = histogram(xs, 0, 10, 20);
    expect(bins.reduce((a, b) => a + b.count, 0)).toBe(1000);
    expect(bins.reduce((a, b) => a + b.density * (b.x1 - b.x0), 0)).toBeCloseTo(1, 6);
  });

  it("counts integers one bar each", () => {
    const bins = integerHistogram([0, 1, 1, 3], 0, 3);
    expect(bins.map((b) => b.count)).toEqual([1, 2, 0, 1]);
  });
});

describe("densities", () => {
  it("normal pdf integrates to 1", () => {
    const xs = linspace(-8, 8, 2001);
    const dx = xs[1] - xs[0];
    expect(xs.reduce((a, x) => a + normalPdf(x, 0.5, 1.3) * dx, 0)).toBeCloseTo(1, 3);
  });

  it("Poisson pmf sums to 1", () => {
    let total = 0;
    for (let k = 0; k < 60; k++) total += poissonPmf(k, 4.5);
    expect(total).toBeCloseTo(1, 8);
  });
});
