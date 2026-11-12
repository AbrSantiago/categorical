import type { ExerciseLogic } from "../../core/exercise";
import { msg } from "../../core/i18n";
import { domainOf, encodeSet, equalSets, imageOf, randomSpec, type FamilyId, type FnSpec, type IntervalSet } from "../../functions";
import { specValues } from "../../functions/messages";
import { familyPool } from "../../functions/pick";
import { INITIAL_LINE, lineToSet, type LineAnswer } from "../../ui/plot/lineAnswer";

/**
 * "Aplastá el gráfico": a slider squashes the plane onto one axis with the
 * matrix [[1 − t, 0], [0, 1]] (or its twin for the x axis). What's left
 * painted on the axis is the range (or the domain). Then mark it on a number
 * line, deciding each end: included or not, finite or ∞, with or without a
 * hole. Difficulty 2 hides the end markers on the shadow until you check.
 */
export interface SquashParams {
  spec: FnSpec;
  axis: "x" | "y";
  /** Show filled/hollow markers on the squashed shadow before checking. */
  markers: boolean;
}

export const exactSet = (p: SquashParams): IntervalSet => (p.axis === "y" ? imageOf(p.spec) : domainOf(p.spec));

const RANGE_FAMILIES: FamilyId[] = ["quadratic", "abs", "sqrt", "rational", "exponential", "cubic", "constant"];
const DOMAIN_FAMILIES: FamilyId[] = ["sqrt", "log", "rational", "quadratic", "exponential"];

function makeSquash(id: string, axis: "x" | "y"): ExerciseLogic<SquashParams, LineAnswer> {
  return {
    id,
    generate(rng, difficulty, config) {
      const family = rng.pick(familyPool(config?.pool, axis === "y" ? RANGE_FAMILIES : DOMAIN_FAMILIES));
      const spec = randomSpec(rng, family, difficulty === 2);
      return { spec, axis, markers: difficulty === 1 };
    },
    initialAnswer() {
      return { ...INITIAL_LINE };
    },
    check(params, answer) {
      const truth = exactSet(params);
      const yours = lineToSet(answer);
      const why = msg("fn.why", { ...specValues(params.spec), axis });
      if (equalSets(truth, yours)) {
        return { correct: true, headline: msg("squash.right"), explanation: [msg(`squash.truth.${axis}`, { set: encodeSet(truth) }), why] };
      }
      return {
        correct: false,
        headline: msg("squash.wrong"),
        explanation: [msg("squash.yours", { set: encodeSet(yours) }), msg(`squash.truth.${axis}`, { set: encodeSet(truth) }), why],
      };
    },
  };
}

export const squashRangeLogic = makeSquash("squash-range", "y");
export const squashDomainLogic = makeSquash("squash-domain", "x");
