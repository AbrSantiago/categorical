import type { ExerciseLogic } from "../../core/exercise";
import { msg, type Msg } from "../../core/i18n";
import { ALL_IDS, getDist } from "../../distributions";

/**
 * "¿Verdadero o falso?": a statement about a distribution. Either one of the
 * hand-written facts in the library, or a claim about its mean built from
 * the right formula or a plausible wrong one.
 */
export type TrueFalseParams =
  | { kind: "fact"; dist: string; index: number; truth: boolean }
  | { kind: "mean"; dist: string; formula: string; truth: boolean };

export type TrueFalseAnswer = "true" | "false";

export const trueFalseLogic: ExerciseLogic<TrueFalseParams, TrueFalseAnswer> = {
  id: "true-false",

  generate(rng, _difficulty, config) {
    const pool = config?.pool ?? ALL_IDS;
    const dist = rng.pick(pool);
    const def = getDist(dist);
    if (def.mean && def.mean.right !== "NONE" && rng.next() < 0.3) {
      const truth = rng.next() < 0.5;
      return { kind: "mean", dist, truth, formula: truth ? def.mean.right : rng.pick(def.mean.wrong) };
    }
    const index = rng.int(0, def.facts.length - 1);
    return { kind: "fact", dist, index, truth: def.facts[index].truth };
  },

  initialAnswer() {
    return null;
  },

  check(params, answer) {
    const correct = (answer === "true") === params.truth;
    const explanation: Msg[] =
      params.kind === "fact"
        ? [msg(`dist.${params.dist}.fact.${params.index}.why`)]
        : [msg("tf.mean.why", { dist: params.dist })];
    return {
      correct,
      headline: msg(correct ? "tf.right" : params.truth ? "tf.wasTrue" : "tf.wasFalse"),
      explanation,
    };
  },
};

export function statementOf(params: TrueFalseParams): Msg {
  return params.kind === "fact"
    ? msg(`dist.${params.dist}.fact.${params.index}`)
    : msg("tf.mean.statement", { dist: params.dist, formula: params.formula });
}
