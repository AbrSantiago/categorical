import type { ExerciseLogic } from "../../core/exercise";
import { msg, type Msg } from "../../core/i18n";

/**
 * "Ajustá la curva": move μ and σ with sliders until your normal curve
 * matches the target. Difficulty 1 shows the target curve; difficulty 2
 * shows only a sample (histogram), which is how data usually arrives.
 */
export interface FitNormalParams {
  mode: "curve" | "sample";
  target: { mu: number; sigma: number };
  sample: number[];
  domain: [number, number];
  tolerance: { mu: number; sigmaRatio: number };
}

export interface FitNormalAnswer {
  mu: number;
  sigma: number;
}

export const START: FitNormalAnswer = { mu: 0, sigma: 1 };
export const MU_RANGE = { min: -6, max: 6, step: 0.1 };
export const SIGMA_RANGE = { min: 0.3, max: 3, step: 0.05 };
export const DOMAIN: [number, number] = [-8, 8];

export const fitNormalLogic: ExerciseLogic<FitNormalParams, FitNormalAnswer> = {
  id: "fit-normal",

  generate(rng, difficulty) {
    let mu: number;
    let sigma: number;
    do {
      mu = rng.step(-4, 4, 0.5);
      sigma = rng.step(0.5, 2.4, 0.1);
    } while (Math.abs(mu - START.mu) < 1 && Math.abs(sigma - START.sigma) < 0.4);

    const mode = difficulty === 1 ? "curve" : "sample";
    return {
      mode,
      target: { mu, sigma },
      sample: mode === "sample" ? rng.sample(400, (r) => r.normal(mu, sigma)) : [],
      domain: DOMAIN,
      tolerance:
        mode === "curve"
          ? { mu: 0.25, sigmaRatio: 0.12 }
          : { mu: Math.max(0.3, 0.25 * sigma), sigmaRatio: 0.18 },
    };
  },

  initialAnswer() {
    return { ...START };
  },

  check(params, answer) {
    const { target, tolerance } = params;
    const dMu = answer.mu - target.mu;
    const ratio = answer.sigma / target.sigma;
    const muOk = Math.abs(dMu) <= tolerance.mu;
    const sigmaOk = Math.abs(ratio - 1) <= tolerance.sigmaRatio;
    const real = msg("fitNormal.real", { mu: target.mu, sigma: target.sigma });

    if (muOk && sigmaOk) {
      return {
        correct: true,
        headline: msg("fitNormal.headline.right"),
        explanation: [real, msg(params.mode === "sample" ? "fitNormal.tip.sample" : "fitNormal.tip.curve")],
      };
    }

    const explanation: Msg[] = [];
    if (!muOk) explanation.push(msg("fitNormal.wrong.mu", { side: dMu > 0 ? "right" : "left", mu: answer.mu }));
    if (!sigmaOk) explanation.push(msg("fitNormal.wrong.sigma", { shape: ratio > 1 ? "wide" : "narrow", sigma: answer.sigma }));
    explanation.push(real);
    return {
      correct: false,
      headline: msg(muOk || sigmaOk ? "fitNormal.headline.almost" : "fitNormal.headline.off"),
      explanation,
    };
  },
};
