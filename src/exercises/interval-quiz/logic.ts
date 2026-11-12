import type { ExerciseLogic } from "../../core/exercise";
import { msg } from "../../core/i18n";
import type { Rng } from "../../core/random";
import {
  decodeSet,
  domainOf,
  encodeSet,
  equalSets,
  imageOf,
  interval,
  normalize,
  randomSpec,
  REALS,
  type FamilyId,
  type FnSpec,
  type IntervalSet,
} from "../../functions";
import { specValues } from "../../functions/messages";
import { familyPool } from "../../functions/pick";

/**
 * "¿Cuál es el dominio (o la imagen) de f?" from the formula alone, in
 * interval notation. The wrong options are the usual slips: a bracket
 * instead of a parenthesis, the sign of the shift, the other set, or ℝ.
 */
export interface IntervalQuizParams {
  spec: FnSpec;
  axis: "x" | "y";
  /** Encoded sets (see encodeSet). */
  options: string[];
  answer: number;
}

function slips(set: IntervalSet, other: IntervalSet): IntervalSet[] {
  const n = normalize(set);
  const out: IntervalSet[] = [other, REALS];
  n.forEach((piece, i) => {
    const swap = (p: typeof piece) => n.map((q, j) => (j === i ? p : q));
    if (Number.isFinite(piece.lo)) out.push(swap({ ...piece, loClosed: !piece.loClosed }));
    if (Number.isFinite(piece.hi)) out.push(swap({ ...piece, hiClosed: !piece.hiClosed }));
  });
  // Sign slip: every finite end negated.
  out.push(n.map((p) => interval(Number.isFinite(p.lo) ? -p.lo : p.lo, Number.isFinite(p.hi) ? -p.hi : p.hi, p.loClosed, p.hiClosed)));
  // Wrong direction: [a, +∞) ↔ (−∞, a].
  if (n.length === 1 && Number.isFinite(n[0].lo) && n[0].hi === Infinity) out.push([interval(-Infinity, n[0].lo, false, n[0].loClosed)]);
  if (n.length === 1 && n[0].lo === -Infinity && Number.isFinite(n[0].hi)) out.push([interval(n[0].hi, Infinity, n[0].hiClosed)]);
  return out;
}

function fill(rng: Rng): IntervalSet {
  const v = rng.int(-3, 3);
  return rng.pick([[interval(v, Infinity, true)], [interval(-Infinity, v)], [interval(-Infinity, v), interval(v, Infinity)]]);
}

const FAMILIES: FamilyId[] = ["sqrt", "log", "rational", "quadratic", "exponential", "abs"];

export const intervalQuizLogic: ExerciseLogic<IntervalQuizParams, number> = {
  id: "interval-quiz",

  generate(rng, difficulty, config) {
    const spec = randomSpec(rng, rng.pick(familyPool(config?.pool, FAMILIES)), difficulty === 2);
    const axis = rng.next() < 0.5 ? "x" : "y";
    const truth = axis === "x" ? domainOf(spec) : imageOf(spec);
    const other = axis === "x" ? imageOf(spec) : domainOf(spec);
    const chosen: IntervalSet[] = [truth];
    for (const s of rng.shuffle(slips(truth, other))) if (chosen.length < 4 && s.length && chosen.every((c) => !equalSets(c, s))) chosen.push(s);
    for (let tries = 0; chosen.length < 4 && tries < 50; tries++) {
      const s = fill(rng);
      if (chosen.every((c) => !equalSets(c, s))) chosen.push(s);
    }
    const order = rng.shuffle([0, 1, 2, 3]);
    return { spec, axis, options: order.map((i) => encodeSet(chosen[i])), answer: order.indexOf(0) };
  },

  initialAnswer() {
    return null;
  },

  check(params, answer) {
    const truth = params.options[params.answer];
    const why = msg("fn.why", { ...specValues(params.spec), axis: params.axis });
    const truthMsg = msg(`squash.truth.${params.axis}`, { set: truth });
    if (answer === params.answer) return { correct: true, headline: msg("squash.right"), explanation: [why] };
    const picked = decodeSet(params.options[answer]);
    const other = params.axis === "x" ? imageOf(params.spec) : domainOf(params.spec);
    const explanation = [truthMsg, why];
    if (equalSets(picked, other)) explanation.unshift(msg(`intervalQuiz.other.${params.axis}`));
    return { correct: false, headline: msg("squash.wrong"), explanation };
  },
};
