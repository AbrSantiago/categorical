import type { ExerciseLogic } from "../../core/exercise";
import { msg, type Msg } from "../../core/i18n";
import { drawTargetParams, FITTABLE_IDS, getDist, massIn, overlap, peakIn, type Params } from "../../distributions";

/**
 * "Ajustá los parámetros": move one slider per parameter until your curve
 * covers the target. Graded by how much the two curves overlap, so any
 * parameter combination that draws the same curve counts.
 */
export interface FitParamsParams {
  dist: string;
  target: Params;
  start: Params;
  range: [number, number];
  yMax: number;
  /** Share of area the curves must have in common to pass (0..1). */
  threshold: number;
}

export const fitParamsLogic: ExerciseLogic<FitParamsParams, Params> = {
  id: "fit-params",

  generate(rng, difficulty, config) {
    const pool = (config?.pool ?? FITTABLE_IDS).filter((id) => getDist(id).fit);
    const dist = rng.pick(pool);
    const def = getDist(dist);
    const { range, start } = def.fit!;
    // The target must be clearly away from the start, or leaving the sliders alone would pass.
    // Keep the most different candidate in case the family makes that hard.
    const threshold = difficulty === 1 ? 0.9 : 0.93;
    let target = drawTargetParams(rng, def);
    let best = { params: target, similarity: Infinity };
    for (let tries = 0; tries < 60; tries++) {
      if ((!def.valid || def.valid(target)) && massIn(def, target, range, 400) > 0.97) {
        const similarity = overlap(def, start, target, range, 400);
        if (similarity < best.similarity) best = { params: target, similarity };
        if (similarity < threshold - 0.15) break;
      }
      target = drawTargetParams(rng, def);
    }
    target = best.params;
    return {
      dist,
      target,
      start: { ...start },
      range,
      yMax: peakIn(def, target, range) * 1.35,
      threshold,
    };
  },

  initialAnswer(params) {
    return { ...params.start };
  },

  check(params, answer) {
    const def = getDist(params.dist);
    if (def.valid && !def.valid(answer)) {
      return {
        correct: false,
        headline: msg("fit.headline.invalid"),
        explanation: [msg(`fit.invalid.${params.dist}`), msg("fit.real", { id: params.dist, ...params.target })],
      };
    }
    const shared = overlap(def, answer, params.target, params.range);
    const correct = shared >= params.threshold;
    const explanation: Msg[] = [msg("fit.overlap", { pct: Math.round(shared * 100) })];
    if (!correct) {
      for (const p of def.params) {
        const [min, max, step] = def.fit!.grid[p.key];
        const diff = answer[p.key] - params.target[p.key];
        if (Math.abs(diff) > Math.max(2 * step, 0.08 * (max - min))) {
          explanation.push(msg("fit.param", { dist: params.dist, key: p.key, dir: diff > 0 ? "high" : "low" }));
        }
      }
    }
    explanation.push(msg("fit.real", { id: params.dist, ...params.target }));
    return {
      correct,
      headline: msg(correct ? "fit.headline.right" : shared >= params.threshold - 0.12 ? "fit.headline.close" : "fit.headline.off"),
      explanation,
    };
  },
};
