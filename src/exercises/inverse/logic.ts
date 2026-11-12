import type { ExerciseLogic } from "../../core/exercise";
import { msg, type Msg } from "../../core/i18n";
import type { Rng } from "../../core/random";
import { evaluate, randomSpec, type FamilyId, type FnSpec } from "../../functions";
import { specValues } from "../../functions/messages";

/**
 * The inverse as a mirror image across y = x (the swap matrix [[0,1],[1,0]]).
 * Three variants:
 *  - graph: pick the graph of f⁻¹; the others are the other mirrors (y axis,
 *    x axis, the other diagonal).
 *  - formula: pick f⁻¹(x); the traps are 1/f, −f and sign slips.
 *  - restrict: f isn't injective, its mirror fails the vertical line test;
 *    what makes an inverse possible?
 */
export type Mirror = "diagonal" | "y-axis" | "x-axis" | "anti";
export const MIRRORS: Record<Mirror, [number, number, number, number]> = {
  diagonal: [0, 1, 1, 0],
  "y-axis": [-1, 0, 0, 1],
  "x-axis": [1, 0, 0, -1],
  anti: [0, -1, -1, 0],
};
export type FormulaOption = "inverse" | "flipped" | "recip" | "neg";
export type RestrictOption = "domain" | "codomain" | "recip" | "never";

export type InverseParams =
  | { variant: "graph"; spec: FnSpec; options: Mirror[]; point: [number, number] | null }
  | { variant: "formula"; spec: FnSpec; options: FormulaOption[]; point: [number, number] | null }
  | { variant: "restrict"; spec: FnSpec; options: RestrictOption[]; side: "right" | "left" };

const GRAPH_FAMILIES: FamilyId[] = ["linear", "exponential", "sqrt", "log", "cubic", "rational"];

function asymmetric(rng: Rng, family: FamilyId): FnSpec {
  for (;;) {
    const s = randomSpec(rng, family, false);
    const spec = family === "linear" ? { ...s, a: rng.pick([2, 3, 0.5]) } : family === "cubic" || family === "exponential" ? { ...s, a: 1 } : s;
    const okLinear = family !== "linear" || spec.k !== 0;
    const okShift = family === "linear" || (spec.h !== 0 && spec.k !== 0 && Math.abs(spec.h) !== Math.abs(spec.k));
    if (okLinear && okShift) return spec;
  }
}

/** An integer point (x, f(x)) inside the window, to show how mirroring swaps coordinates. */
function samplePoint(spec: FnSpec): [number, number] | null {
  for (const x of [1, 2, -1, 3, -2, 0, 4, -3]) {
    const y = evaluate(spec, x);
    if (Number.isInteger(y) && Math.abs(y) <= 5 && y !== x) return [x, y];
  }
  return null;
}

export const inverseLogic: ExerciseLogic<InverseParams, number> = {
  id: "inverse",

  generate(rng, difficulty) {
    const roll = rng.next();
    if ((difficulty === 1 && roll < 0.35) || (difficulty === 2 && roll < 0.3)) {
      const spec: FnSpec = { ...randomSpec(rng, rng.pick<FamilyId>(["quadratic", "abs"]), false), a: rng.pick([1, -1]) };
      return {
        variant: "restrict",
        spec,
        side: rng.next() < 0.5 ? "right" : "left",
        options: rng.shuffle<RestrictOption>(["domain", "codomain", "recip", "never"]),
      };
    }
    if (difficulty === 1) {
      const spec = asymmetric(rng, rng.pick(GRAPH_FAMILIES));
      return { variant: "graph", spec, point: samplePoint(spec), options: rng.shuffle<Mirror>(["diagonal", "y-axis", "x-axis", "anti"]) };
    }
    const family = rng.pick<FamilyId>(["linear", "cubic", "sqrt", "exponential", "log", "rational"]);
    let spec = asymmetric(rng, family);
    if (family === "linear") spec = { ...spec, a: rng.pick([2, 3, -2]) };
    return { variant: "formula", spec, point: samplePoint(spec), options: rng.shuffle<FormulaOption>(["inverse", "flipped", "recip", "neg"]) };
  },

  initialAnswer() {
    return null;
  },

  check(params, answer) {
    const values = specValues(params.spec);
    if (params.variant === "restrict") {
      const picked = params.options[answer];
      const correct = picked === "domain";
      const explanation: Msg[] = [];
      if (!correct) explanation.push(msg(`inv.restrictWrong.${picked}`));
      explanation.push(msg("inv.restrictWhy", { ...values, side: params.side }));
      return { correct, headline: msg(correct ? "inv.right" : "inv.wrong"), explanation };
    }
    const right = params.variant === "graph" ? params.options.indexOf("diagonal") : params.options.indexOf("inverse");
    const explanation: Msg[] = [msg("inv.mirror")];
    if (params.point) explanation.push(msg("inv.point", { x: params.point[0], y: params.point[1] }));
    if (params.variant === "formula") explanation.push(msg("inv.formula", values));
    if (answer !== right) {
      const picked = params.options[answer];
      explanation.unshift(msg(`inv.trap.${picked}`, values));
    }
    return { correct: answer === right, headline: msg(answer === right ? "inv.right" : "inv.wrong"), explanation };
  },
};
