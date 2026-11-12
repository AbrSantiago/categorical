import type { ExerciseLogic } from "../../core/exercise";
import { msg, type Msg } from "../../core/i18n";
import type { Rng } from "../../core/random";
import {
  decodeSet,
  encodeSet,
  equalSets,
  imageOf,
  interval,
  isInjective,
  minus,
  randomSpec,
  REALS,
  solve,
  type FamilyId,
  type FnSpec,
  type IntervalSet,
} from "../../functions";

/**
 * f: A → B with the codomain B written out. Is it injective, surjective,
 * both (bijective) or neither? Two tools: a horizontal line you drag (hits
 * twice → not injective) and the squash, which paints the y axis darker
 * where several x land and leaves the uncovered part of B blank.
 */
export type Kind = "bijective" | "injective" | "surjective" | "neither";
export const KINDS: Kind[] = ["bijective", "injective", "surjective", "neither"];

export interface InjectivityParams {
  spec: FnSpec;
  /** Encoded codomain. */
  codomain: string;
  kind: Kind;
}

function injectiveSpec(rng: Rng, needGap: boolean, hard: boolean): FnSpec {
  // needGap: its range must miss part of ℝ (so codomain ℝ isn't covered).
  const families: FamilyId[] = needGap ? ["exponential", "sqrt", "rational", "quadratic"] : ["linear", "cubic", "exponential", "sqrt", "log", "rational", "quadratic"];
  const family = rng.pick(families);
  const s = randomSpec(rng, family, hard);
  if (family === "quadratic" || family === "abs") {
    const right = rng.next() < 0.5;
    return { ...s, restrict: [right ? interval(s.h, Infinity, true) : interval(-Infinity, s.h, false, true)] };
  }
  return s;
}

export function kindOf(spec: FnSpec, codomain: IntervalSet): Kind {
  const inj = isInjective(spec);
  const sur = equalSets(imageOf(spec), codomain);
  return inj && sur ? "bijective" : inj ? "injective" : sur ? "surjective" : "neither";
}

export const injectivityLogic: ExerciseLogic<InjectivityParams, Kind> = {
  id: "injectivity",

  generate(rng, difficulty) {
    const hard = difficulty === 2;
    const kind = rng.pick(KINDS);
    let spec: FnSpec;
    let codomain: IntervalSet;
    if (kind === "bijective") {
      spec = injectiveSpec(rng, false, hard);
      codomain = imageOf(spec);
    } else if (kind === "injective") {
      spec = injectiveSpec(rng, true, hard);
      codomain = REALS;
    } else {
      spec = randomSpec(rng, rng.pick<FamilyId>(["quadratic", "abs"]), hard);
      codomain = kind === "surjective" ? imageOf(spec) : REALS;
    }
    return { spec, codomain: encodeSet(codomain), kind: kindOf(spec, codomain) };
  },

  initialAnswer() {
    return null;
  },

  check(params, answer) {
    const { spec } = params;
    const codomain = decodeSet(params.codomain);
    const image = imageOf(spec);
    const explanation: Msg[] = [];
    if (isInjective(spec)) explanation.push(msg("inj.yes"));
    else {
      // A height hit twice: one unit away from the vertex.
      const c = spec.a + spec.k;
      const xs = solve(spec, c) ?? [];
      explanation.push(msg("inj.no", { c, x1: xs[0] ?? spec.h - 1, x2: xs[1] ?? spec.h + 1 }));
    }
    const missing = minus(codomain, image);
    explanation.push(
      missing.length ? msg("inj.notSur", { image: encodeSet(image), codomain: params.codomain }) : msg("inj.sur", { image: encodeSet(image) }),
    );
    const correct = answer === params.kind;
    return { correct, headline: msg(correct ? "inj.right" : "inj.wrong", { kind: params.kind }), explanation };
  },
};
