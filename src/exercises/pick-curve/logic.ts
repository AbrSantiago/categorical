import type { ExerciseLogic } from "../../core/exercise";
import { msg, type Msg } from "../../core/i18n";
import type { Rng } from "../../core/random";
import { drawTargetParams, FITTABLE_IDS, getDist, massIn, overlap, peakIn, type DistDef, type Params } from "../../distributions";

/**
 * "¿Cuál es la curva?": four small charts from the same family; tap the one
 * with the given parameters. Each wrong option changes a single parameter,
 * so telling them apart means knowing what that parameter does.
 */
export interface PickCurveParams {
  dist: string;
  target: Params;
  /** The four candidates in display order; one equals `target`. */
  options: Params[];
  answer: number;
  range: [number, number];
  yMax: number;
}

/** Same parameters except one, moved to another grid value. */
function variant(rng: Rng, def: DistDef, base: Params): { params: Params; key: string } {
  const p = rng.pick(def.params);
  const [min, max, step] = def.fit!.grid[p.key];
  const [lo, hi] = def.fit!.target?.[p.key] ?? [min, max];
  return { params: { ...base, [p.key]: rng.step(Math.max(lo, min), Math.min(hi, max), step) }, key: p.key };
}

export const pickCurveLogic: ExerciseLogic<PickCurveParams, number> = {
  id: "pick-curve",

  generate(rng, difficulty, config) {
    const pool = (config?.pool ?? FITTABLE_IDS).filter((id) => getDist(id).fit);
    const dist = rng.pick(pool);
    const def = getDist(dist);
    const range = def.fit!.range;
    const usable = (p: Params) => (!def.valid || def.valid(p)) && massIn(def, p, range, 300) > 0.95;
    // A coarse grid is plenty to tell curves apart, and keeps generation instant.
    const similar = (a: Params, b: Params) => overlap(def, a, b, range, 300);

    let target = drawTargetParams(rng, def);
    for (let i = 0; i < 60 && !usable(target); i++) target = drawTargetParams(rng, def);

    // Harder questions allow wrong options that look more like the answer. One-parameter
    // families (exponential, chi-square…) always overlap a lot, so they get more slack.
    const maxSimilarity = (difficulty === 1 ? 0.7 : 0.8) + (def.params.length === 1 ? 0.12 : 0);
    const options: Params[] = [target];
    for (let tries = 0; options.length < 4 && tries < 120; tries++) {
      const { params } = variant(rng, def, target);
      if (!usable(params)) continue;
      if (options.some((o) => similar(o, params) > maxSimilarity)) continue;
      options.push(params);
    }
    // Fallback for very constrained families: allow any grid point, just not near-duplicates.
    for (let tries = 0; options.length < 4 && tries < 200; tries++) {
      const params = drawTargetParams(rng, def);
      if (usable(params) && options.every((o) => similar(o, params) < 0.93)) options.push(params);
    }

    const order = rng.shuffle([0, 1, 2, 3]);
    const shuffled = order.map((i) => options[i]);
    return {
      dist,
      target,
      options: shuffled,
      answer: order.indexOf(0),
      range,
      yMax: Math.max(...shuffled.map((o) => peakIn(def, o, range))) * 1.15,
    };
  },

  initialAnswer() {
    return null;
  },

  check(params, answer) {
    const def = getDist(params.dist);
    const correct = answer === params.answer;
    const explanation: Msg[] = [];
    if (!correct) {
      const chosen = params.options[answer];
      explanation.push(msg("pick.chosen", { id: params.dist, ...chosen }));
      for (const p of def.params) {
        if (chosen[p.key] !== params.target[p.key]) {
          explanation.push(
            msg("pick.diff", { dist: params.dist, key: p.key, dir: chosen[p.key] > params.target[p.key] ? "more" : "less" }),
          );
        }
      }
    } else {
      // Remind what each parameter did in this family.
      for (const p of def.params) explanation.push(msg("pick.effect", { dist: params.dist, key: p.key }));
    }
    return { correct, headline: msg(correct ? "pick.headline.right" : "pick.headline.wrong"), explanation };
  },
};
