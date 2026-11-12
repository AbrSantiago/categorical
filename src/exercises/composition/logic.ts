import type { ExerciseLogic } from "../../core/exercise";
import { msg } from "../../core/i18n";
import type { Rng } from "../../core/random";
import { applyOp, type Op, type OpId } from "./ops";

/**
 * f ∘ g as two machines in a row: x goes into g, what comes out goes into f.
 * Formula variant: pick (f ∘ g)(x) among g ∘ f, f · g and f + g. Value
 * variant: compute (f ∘ g)(x₀) with the machines, then see it run.
 */
export type CompositionOption = "fg" | "gf" | "product" | "sum";

export interface CompositionParams {
  variant: "formula" | "value";
  f: Op;
  g: Op;
  x0: number;
  options: CompositionOption[];
  /** For the value variant: the number each option stands for. */
  values: number[];
}

const EASY: OpId[] = ["add", "mul", "square"];
const HARD: OpId[] = ["add", "mul", "square", "sqrt", "abs", "recip", "exp"];
const VALUE_OPS: OpId[] = ["add", "mul", "square", "abs"];

function randomOp(rng: Rng, ids: OpId[]): Op {
  const id = rng.pick(ids);
  return { id, c: id === "add" ? rng.pick([-3, -2, -1, 1, 2, 3]) : id === "mul" ? rng.pick([2, 3]) : 0 };
}

export const fg = (p: { f: Op; g: Op }, x: number) => applyOp(p.f, applyOp(p.g, x));
export const gf = (p: { f: Op; g: Op }, x: number) => applyOp(p.g, applyOp(p.f, x));

function differ(f: Op, g: Op): boolean {
  if (f.id === g.id) return false;
  return [-1.5, 0.5, 2.5, 4].some((x) => {
    const a = fg({ f, g }, x);
    const b = gf({ f, g }, x);
    return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) > 1e-6;
  });
}

export const compositionLogic: ExerciseLogic<CompositionParams, number> = {
  id: "composition",

  generate(rng, difficulty) {
    const variant = difficulty === 1 && rng.next() < 0.5 ? "value" : "formula";
    for (let tries = 0; tries < 300; tries++) {
      const ids = variant === "value" ? VALUE_OPS : difficulty === 1 ? EASY : HARD;
      const f = randomOp(rng, ids);
      const g = randomOp(rng, ids);
      if (!differ(f, g)) continue;
      if (variant === "formula") {
        return { variant, f, g, x0: 1, options: rng.shuffle<CompositionOption>(["fg", "gf", "product", "sum"]), values: [] };
      }
      const x0 = rng.pick([-2, -1, 1, 2, 3]);
      const vals = { fg: fg({ f, g }, x0), gf: gf({ f, g }, x0), product: applyOp(f, x0) * applyOp(g, x0), sum: applyOp(g, x0) };
      const nums = Object.values(vals);
      if (new Set(nums).size < 4 || nums.some((v) => !Number.isInteger(v) || Math.abs(v) > 99)) continue;
      const options = rng.shuffle<CompositionOption>(["fg", "gf", "product", "sum"]);
      return { variant, f, g, x0, options, values: options.map((o) => vals[o]) };
    }
    return {
      variant: "formula",
      f: { id: "square", c: 0 },
      g: { id: "add", c: 1 },
      x0: 1,
      options: ["fg", "gf", "product", "sum"],
      values: [],
    };
  },

  initialAnswer() {
    return null;
  },

  check(params, answer) {
    const right = params.options.indexOf("fg");
    const picked = params.options[answer];
    const opValues = { fc: params.f.c, gc: params.g.c, fid: params.f.id, gid: params.g.id };
    const explanation = [msg("comp.order")];
    if (params.variant === "value") {
      const inner = applyOp(params.g, params.x0);
      explanation.push(msg("comp.steps", { ...opValues, x: params.x0, inner, outer: fg(params, params.x0) }));
    } else explanation.push(msg("comp.formula", opValues));
    if (answer !== right) explanation.unshift(msg(`comp.trap.${picked}.${params.variant}`, opValues));
    return { correct: answer === right, headline: msg(answer === right ? "comp.right" : "comp.wrong"), explanation };
  },
};
