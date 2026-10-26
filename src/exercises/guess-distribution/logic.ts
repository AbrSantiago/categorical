import type { ExerciseLogic } from "../../core/exercise";
import { msg } from "../../core/i18n";
import { frameSample, getDist, pickDistractors, type Params } from "../../distributions";

/**
 * "¿Qué distribución es?": look at a histogram and name the family.
 * The lesson decides which distributions can appear (`config.pool`);
 * difficulty 2 uses smaller, noisier samples.
 */
export interface GuessDistributionParams {
  dist: string;
  params: Params;
  sample: number[];
  options: string[];
  domain: [number, number];
  discrete: boolean;
}

/** The original "Formas" set, used when a step doesn't say otherwise. */
export const DEFAULT_POOL = ["normal", "uniform", "exponential", "poisson"];
const DEFAULT_POOL_HARD = [...DEFAULT_POOL, "lognormal"];

/** Pairs that are easy to confuse get a specific tip (see messages.ts). */
export const TIP_PAIRS = [
  "exponential-lognormal",
  "exponential-gamma",
  "normal-uniform",
  "normal-lognormal",
  "normal-poisson",
  "exponential-poisson",
  "binomial-poisson",
  "geometric-poisson",
  "laplace-normal",
  "cauchy-normal",
  "student-t-cauchy",
  "triangular-uniform",
  "beta-normal",
  "pareto-gamma",
  "discrete-uniform-binomial",
] as const;

function tipFor(a: string, b: string): string | undefined {
  return TIP_PAIRS.find((pair) => pair === `${a}-${b}` || pair === `${b}-${a}`);
}

export const guessDistributionLogic: ExerciseLogic<GuessDistributionParams, string> = {
  id: "guess-distribution",

  generate(rng, difficulty, config) {
    const pool = config?.pool ?? (difficulty === 1 ? DEFAULT_POOL : DEFAULT_POOL_HARD);
    const dist = rng.pick(pool);
    const def = getDist(dist);
    const params = def.shapeParams(rng);
    const n = difficulty === 1 ? 600 : 150;
    const sample = rng.sample(n, (r) => def.sample(r, params));
    const distractors = pickDistractors(rng, dist, [...pool, ...(config?.distractors ?? [])], 3);
    return {
      dist,
      params,
      sample,
      options: rng.shuffle([dist, ...distractors]),
      domain: frameSample(def, params, sample),
      discrete: def.kind === "discrete",
    };
  },

  initialAnswer() {
    return null;
  },

  check(params, answer) {
    const truth = params.dist;
    if (answer === truth) {
      return {
        correct: true,
        headline: msg("guess.headline.right", { dist: truth }),
        explanation: [msg("guess.why.right", { dist: truth }), msg("guess.use", { dist: truth })],
      };
    }
    const explanation = [msg("guess.was", { dist: truth }), msg("guess.chosen", { dist: answer })];
    const tip = tipFor(truth, answer);
    if (tip) explanation.push(msg(`guess.tip.${tip}`));
    return { correct: false, headline: msg("guess.headline.wrong", { dist: truth }), explanation };
  },
};
