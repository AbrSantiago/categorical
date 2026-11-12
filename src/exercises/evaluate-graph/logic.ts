import type { ExerciseLogic } from "../../core/exercise";
import { msg, type Msg } from "../../core/i18n";
import type { Rng } from "../../core/random";
import { contains, evaluate, imageOf, randomSpec, solve, type FamilyId, type FnSpec } from "../../functions";

/**
 * Reading values off a graph, no algebra: tap the point (x₀, f(x₀)), or tap
 * every x where the curve is at height c (maybe none).
 */
export interface EvaluateParams {
  spec: FnSpec;
  variant: "value" | "solve";
  x0: number;
  c: number;
  /** For "solve": every x with f(x) = c. */
  solutions: number[];
}

export interface EvaluateAnswer {
  point: { x: number; y: number } | null;
  xs: number[];
  none: boolean;
}

const VALUE_FAMILIES: FamilyId[] = ["linear", "quadratic", "abs", "sqrt", "cubic", "exponential"];
const SOLVE_FAMILIES: FamilyId[] = ["quadratic", "abs", "linear", "sqrt", "quadratic", "abs"];
const inside = (v: number) => Number.isInteger(v) && v >= -5 && v <= 5;

function simple(rng: Rng, family: FamilyId): FnSpec {
  const s = randomSpec(rng, family, false);
  if (family === "linear") return { ...s, a: rng.pick([1, 2, -1, -2]) };
  if (family === "cubic" || family === "exponential") return { ...s, h: rng.int(-1, 1), k: rng.int(-2, 2) };
  return s;
}

export const evaluateLogic: ExerciseLogic<EvaluateParams, EvaluateAnswer> = {
  id: "evaluate-graph",

  generate(rng, difficulty) {
    const variant = difficulty === 1 ? "value" : "solve";
    for (let tries = 0; tries < 400; tries++) {
      if (variant === "value") {
        const spec = simple(rng, rng.pick(VALUE_FAMILIES));
        const x0 = rng.int(-4, 4);
        const y = evaluate(spec, x0);
        if (inside(y) && x0 !== 0) return { spec, variant, x0, c: y, solutions: [x0] };
      } else {
        const spec = simple(rng, rng.pick(SOLVE_FAMILIES));
        let c: number;
        if (rng.next() < 0.2) {
          c = rng.int(-4, 4);
          if (contains(imageOf(spec), c)) continue;
        } else {
          const x = rng.int(-5, 5);
          c = evaluate(spec, x);
        }
        if (!inside(c) || c === 0) continue;
        const xs = solve(spec, c) ?? [];
        if (xs.every(inside)) return { spec, variant, x0: 0, c, solutions: xs };
      }
    }
    return { spec: { family: "linear", a: 1, h: 0, k: 1 }, variant, x0: 2, c: 3, solutions: [2] };
  },

  initialAnswer() {
    return { point: null, xs: [], none: false };
  },

  check(params, answer) {
    if (params.variant === "value") {
      const p = answer.point ?? { x: NaN, y: NaN };
      const y = params.c;
      if (p.x === params.x0 && p.y === y) {
        return { correct: true, headline: msg("evaluate.right"), explanation: [msg("evaluate.value", { x: params.x0, y })] };
      }
      const explanation: Msg[] = [
        p.x !== params.x0 ? msg("evaluate.wrongX", { px: p.x, x: params.x0 }) : msg("evaluate.wrongY", { x: params.x0, y }),
      ];
      explanation.push(msg("evaluate.value", { x: params.x0, y }));
      return { correct: false, headline: msg("evaluate.wrong"), explanation };
    }
    const truth = params.solutions;
    const yours = answer.none ? [] : [...answer.xs].sort((a, b) => a - b);
    const correct = truth.length === yours.length && truth.every((x, i) => x === yours[i]);
    const summary = truth.length ? msg("evaluate.solutions", { c: params.c, xs: truth.join(";") }) : msg("evaluate.noSolution", { c: params.c });
    if (correct) return { correct: true, headline: msg("evaluate.right"), explanation: [summary] };
    const explanation: Msg[] = [];
    const missing = truth.filter((x) => !yours.includes(x));
    const extra = yours.filter((x) => !truth.includes(x));
    if (answer.none && truth.length) explanation.push(msg("evaluate.notNone", { c: params.c, n: truth.length }));
    else {
      if (missing.length) explanation.push(msg("evaluate.missing", { xs: missing.join(";") }));
      if (extra.length) explanation.push(msg("evaluate.extra", { xs: extra.join(";"), c: params.c }));
    }
    explanation.push(summary);
    return { correct: false, headline: msg("evaluate.wrong"), explanation };
  },
};
