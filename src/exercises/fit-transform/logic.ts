import type { ExerciseLogic } from "../../core/exercise";
import { msg, type Msg } from "../../core/i18n";
import { domainOf, equalSets, evaluate, randomSpec, VIEW, type FamilyId, type FnSpec } from "../../functions";
import { specValues } from "../../functions/messages";
import { familyPool } from "../../functions/pick";

/**
 * "Mové la curva hasta tapar la otra": sliders for a, h and k in
 * a·f(x − h) + k. Difficulty 1 only moves (h and k); difficulty 2 also
 * stretches and flips (a). Graded by the graph, so equivalent settings count.
 */
export interface FitTransformParams {
  family: FamilyId;
  target: FnSpec;
  /** Which sliders to show. */
  free: ("a" | "h" | "k")[];
}

export type Abc = { a: number; h: number; k: number };

const SHIFTABLE: FamilyId[] = ["quadratic", "cubic", "sqrt", "abs", "rational", "exponential", "log"];

export const A_STEPS = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2];

/** Same graph on the window: same domain, same values. */
export function sameGraph(p: FnSpec, q: FnSpec): boolean {
  if (!equalSets(domainOf(p), domainOf(q))) return false;
  for (let i = 0; i <= 96; i++) {
    const x = VIEW.x[0] + (i * (VIEW.x[1] - VIEW.x[0])) / 96 + 0.013;
    const a = evaluate(p, x);
    const b = evaluate(q, x);
    if (Number.isFinite(a) !== Number.isFinite(b)) return false;
    if (Number.isFinite(a) && Math.abs(a - b) > 1e-6) return false;
  }
  return true;
}

export const fitTransformLogic: ExerciseLogic<FitTransformParams, Abc> = {
  id: "fit-transform",

  generate(rng, difficulty, config) {
    const pool = familyPool(config?.pool, SHIFTABLE).filter((f) => SHIFTABLE.includes(f));
    const family = rng.pick(pool.length ? pool : SHIFTABLE);
    const free: FitTransformParams["free"] = difficulty === 1 ? ["h", "k"] : ["a", "h", "k"];
    let target = randomSpec(rng, family, difficulty === 2);
    if (difficulty === 1) target = { ...target, a: 1 };
    // Never start on the answer.
    while (target.h === 0 && target.k === 0) target = { ...target, h: rng.pick([-2, -1, 1, 2]), k: rng.pick([-2, 1, 2]) };
    return { family, target, free };
  },

  initialAnswer() {
    return { a: 1, h: 0, k: 0 };
  },

  check(params, answer) {
    const yours: FnSpec = { family: params.family, ...answer };
    const t = params.target;
    if (answer.a !== 0 && sameGraph(yours, t)) {
      return { correct: true, headline: msg("fitFn.right"), explanation: [msg("fitFn.was", specValues(t))] };
    }
    const explanation: Msg[] = [];
    if (answer.a === 0) explanation.push(msg("fitFn.zero"));
    else {
      if (answer.h !== t.h) explanation.push(msg("fitFn.h", { dir: answer.h < t.h ? "right" : "left", by: Math.abs(t.h - answer.h) }));
      if (answer.k !== t.k) explanation.push(msg("fitFn.k", { dir: answer.k < t.k ? "up" : "down", by: Math.abs(t.k - answer.k) }));
      if (Math.sign(answer.a) !== Math.sign(t.a)) explanation.push(msg("fitFn.flip"));
      else if (Math.abs(answer.a) !== Math.abs(t.a)) explanation.push(msg("fitFn.stretch", { dir: Math.abs(answer.a) < Math.abs(t.a) ? "more" : "less" }));
    }
    explanation.push(msg("fitFn.was", specValues(t)));
    const close = explanation.length === 2;
    return { correct: false, headline: msg(close ? "fitFn.close" : "fitFn.wrong"), explanation };
  },
};
