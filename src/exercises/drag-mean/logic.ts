import type { ExerciseLogic } from "../../core/exercise";
import { msg } from "../../core/i18n";
import type { Rng } from "../../core/random";
import { mean, median, quantile, sd } from "../../core/stats";

/**
 * "Marcá el centro": drag a line to where you think the mean (or median) of
 * the histogram is. Skewed shapes make the mean and median split apart.
 */
export type Shape = "symmetric" | "right-skew" | "left-skew" | "bimodal";
export type Target = "mean" | "median";

export interface DragMeanParams {
  target: Target;
  shape: Shape;
  sample: number[];
  domain: [number, number];
  stats: { mean: number; median: number; sd: number };
  tolerance: number;
}

const SPAN = 20;

function drawShape(rng: Rng, shape: Shape, n: number): number[] {
  switch (shape) {
    case "symmetric": {
      const mu = rng.step(7, 13, 0.5);
      const sigma = rng.step(1.6, 2.8, 0.2);
      return rng.sample(n, (r) => r.normal(mu, sigma));
    }
    case "right-skew": {
      const k = rng.step(1.3, 2.2, 0.1);
      const theta = rng.step(1.8, 2.6, 0.1);
      const shift = rng.step(0.5, 2, 0.5);
      return rng.sample(n, (r) => shift + r.gamma(k, theta));
    }
    case "left-skew": {
      const k = rng.step(1.3, 2.2, 0.1);
      const theta = rng.step(1.8, 2.6, 0.1);
      const shift = rng.step(0.5, 2, 0.5);
      return rng.sample(n, (r) => SPAN - shift - r.gamma(k, theta));
    }
    case "bimodal": {
      const a = rng.step(4, 7, 0.5);
      const b = a + rng.step(6, 8, 0.5);
      const w = rng.step(0.3, 0.7, 0.1);
      return rng.sample(n, (r) => (r.next() < w ? r.normal(a, 1.2) : r.normal(b, 1.2)));
    }
  }
}

export const dragMeanLogic: ExerciseLogic<DragMeanParams, number> = {
  id: "drag-mean",

  generate(rng, difficulty) {
    const shape = rng.pick<Shape>(
      difficulty === 1 ? ["symmetric", "right-skew", "left-skew"] : ["right-skew", "left-skew", "bimodal", "symmetric"],
    );
    const target: Target = difficulty === 1 ? "mean" : rng.pick<Target>(["mean", "median"]);
    const sample = drawShape(rng, shape, difficulty === 1 ? 500 : 250).filter((x) => x >= 0 && x <= SPAN);
    const s = { mean: mean(sample), median: median(sample), sd: sd(sample) };
    const lo = Math.max(0, Math.floor(quantile(sample, 0.001)) - 1);
    const hi = Math.min(SPAN, Math.ceil(quantile(sample, 0.999)) + 1);
    return {
      target,
      shape,
      sample,
      domain: [lo, hi],
      stats: s,
      tolerance: Math.max(0.25, 0.2 * s.sd),
    };
  },

  initialAnswer(params) {
    return (params.domain[0] + params.domain[1]) / 2;
  },

  check(params, answer) {
    const { stats, target, shape, tolerance } = params;
    const truth = target === "mean" ? stats.mean : stats.median;
    const error = Math.abs(answer - truth);
    const correct = error <= tolerance;

    const explanation = [
      msg("dragMean.result", { target, answer, mean: stats.mean, median: stats.median }),
      msg(target === "mean" ? "dragMean.idea.mean" : "dragMean.idea.median"),
      shape === "right-skew" || shape === "left-skew"
        ? msg("dragMean.shape.skew", { side: shape === "right-skew" ? "right" : "left" })
        : msg(`dragMean.shape.${shape}`),
    ];

    return {
      correct,
      headline: msg(correct ? "dragMean.headline.right" : error <= 2 * tolerance ? "dragMean.headline.close" : "dragMean.headline.far"),
      explanation,
    };
  },
};
