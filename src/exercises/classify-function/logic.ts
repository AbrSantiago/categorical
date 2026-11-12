import type { ExerciseLogic } from "../../core/exercise";
import { msg } from "../../core/i18n";
import { randomSpec, type FamilyId, type FnSpec } from "../../functions";
import { specValues } from "../../functions/messages";
import { familyPool, pickFamilyDistractors } from "../../functions/pick";

/**
 * "¿Qué tipo de función es?": name the family from its graph (or, at
 * difficulty 2, sometimes from its formula). Wrong options are look-alikes:
 * square root vs. logarithm, parabola vs. V, and so on.
 */
export interface ClassifyParams {
  spec: FnSpec;
  mode: "graph" | "formula";
  options: FamilyId[];
}

export const classifyLogic: ExerciseLogic<ClassifyParams, FamilyId> = {
  id: "classify-function",

  generate(rng, difficulty, config) {
    const pool = familyPool(config?.pool);
    const family = rng.pick(pool);
    const spec = randomSpec(rng, family, difficulty === 2);
    const mode = difficulty === 2 && rng.next() < 0.5 ? "formula" : "graph";
    return { spec, mode, options: rng.shuffle([family, ...pickFamilyDistractors(rng, family, 3, pool)]) };
  },

  initialAnswer() {
    return null;
  },

  check(params, answer) {
    const truth = params.spec.family;
    const feature = msg("fn.feature", specValues(params.spec));
    if (answer === truth) {
      return {
        correct: true,
        headline: msg("classify.right", { family: truth }),
        explanation: [msg("fn.trait", { family: truth }), feature],
      };
    }
    return {
      correct: false,
      headline: msg("classify.wrong", { family: truth }),
      explanation: [msg("classify.was", { family: truth }), msg("fn.trait", { family: truth }), msg("classify.chosen", { family: answer })],
    };
  },
};
