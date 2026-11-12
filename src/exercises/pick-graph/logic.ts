import type { ExerciseLogic } from "../../core/exercise";
import { msg, type Msg } from "../../core/i18n";
import type { Rng } from "../../core/random";
import { FAMILIES, maxGap, randomSpec, type FnSpec } from "../../functions";
import { specValues } from "../../functions/messages";
import { familyPool } from "../../functions/pick";

/**
 * "¿Cuál es el gráfico de f?": four graphs, one right. The wrong ones are
 * the classic slips: shifting the wrong way (x − 2 goes right!), flipping
 * the sign of a, mixing up the horizontal and vertical shifts, or a
 * look-alike family.
 */
export type Slip = "h-sign" | "a-sign" | "k-sign" | "swap" | "family" | "other";

export interface PickGraphParams {
  spec: FnSpec;
  options: FnSpec[];
  /** What each option got wrong (null for the right one). */
  slips: (Slip | null)[];
  answer: number;
}

function slipsOf(rng: Rng, s: FnSpec): { spec: FnSpec; slip: Slip }[] {
  const out: { spec: FnSpec; slip: Slip }[] = [];
  if (s.family === "linear") {
    out.push({ spec: { ...s, a: -s.a }, slip: "a-sign" });
    if (s.k !== 0) out.push({ spec: { ...s, k: -s.k }, slip: "k-sign" });
    if (Number.isInteger(s.a) && s.a !== s.k) out.push({ spec: { ...s, a: s.k || 1, k: s.a }, slip: "swap" });
  } else if (s.family === "constant") {
    out.push({ spec: { ...s, k: -s.k }, slip: "k-sign" });
    out.push({ spec: { family: "linear", a: s.k > 0 ? 1 : -1, h: 0, k: s.k }, slip: "family" });
  } else {
    if (s.h !== 0) out.push({ spec: { ...s, h: -s.h }, slip: "h-sign" });
    out.push({ spec: { ...s, a: -s.a }, slip: "a-sign" });
    if (s.k !== 0) out.push({ spec: { ...s, k: -s.k }, slip: "k-sign" });
    if (s.h !== s.k) out.push({ spec: { ...s, h: s.k, k: s.h }, slip: "swap" });
    const twin = FAMILIES[s.family].similar.find((f) => f !== "constant" && f !== "linear");
    if (twin) out.push({ spec: { ...s, family: twin }, slip: "family" });
  }
  return rng.shuffle(out);
}

export const pickGraphLogic: ExerciseLogic<PickGraphParams, number> = {
  id: "pick-graph",

  generate(rng, difficulty, config) {
    const pool = familyPool(config?.pool);
    let spec = randomSpec(rng, rng.pick(pool), difficulty === 2);
    // A shift-free function makes "shifted the wrong way" impossible; nudge it.
    if (spec.family !== "linear" && spec.family !== "constant" && spec.h === 0) spec = { ...spec, h: rng.pick([-2, -1, 1, 2]) };
    const chosen: { spec: FnSpec; slip: Slip | null }[] = [{ spec, slip: null }];
    const distinct = (c: FnSpec) => chosen.every((o) => maxGap(o.spec, c) > 0.9);
    // Prefer the "x − h goes right" slip: it's the one people make most.
    const candidates = slipsOf(rng, spec).sort((p, q) => Number(q.slip === "h-sign") - Number(p.slip === "h-sign"));
    for (const c of candidates) if (chosen.length < 4 && distinct(c.spec)) chosen.push(c);
    for (let tries = 0; chosen.length < 4 && tries < 80; tries++) {
      const c = randomSpec(rng, spec.family, true);
      if (distinct(c)) chosen.push({ spec: c, slip: "other" });
    }
    const order = rng.shuffle(chosen.map((_, i) => i));
    return {
      spec,
      options: order.map((i) => chosen[i].spec),
      slips: order.map((i) => chosen[i].slip),
      answer: order.indexOf(0),
    };
  },

  initialAnswer() {
    return null;
  },

  check(params, answer) {
    const feature = msg("fn.feature", specValues(params.spec));
    if (answer === params.answer) return { correct: true, headline: msg("pickGraph.right"), explanation: [feature] };
    const slip = params.slips[answer] ?? "other";
    const explanation: Msg[] = [msg(`pickGraph.slip.${slip}`, { ...specValues(params.spec), other: params.options[answer].family })];
    explanation.push(feature);
    return { correct: false, headline: msg("pickGraph.wrong"), explanation };
  },
};
