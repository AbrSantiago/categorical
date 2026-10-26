import type { ExerciseType } from "../core/exercise";
import { dragMean } from "./drag-mean";
import { fitNormal } from "./fit-normal";
import { fitParams } from "./fit-params";
import { guessDistribution } from "./guess-distribution";
import { matchPairs } from "./match-pairs";
import { paramQuiz } from "./param-quiz";
import { pickCurve } from "./pick-curve";
import { trueFalse } from "./true-false";

// Each type has its own params/answer shapes; the registry erases them.
// oxlint-disable-next-line typescript/no-explicit-any
export type AnyExerciseType = ExerciseType<any, any>;

/** Add a new exercise type: create its folder and register it here. */
export const exerciseTypes: Record<string, AnyExerciseType> = {
  [fitNormal.id]: fitNormal,
  [guessDistribution.id]: guessDistribution,
  [dragMean.id]: dragMean,
  [fitParams.id]: fitParams,
  [pickCurve.id]: pickCurve,
  [matchPairs.id]: matchPairs,
  [paramQuiz.id]: paramQuiz,
  [trueFalse.id]: trueFalse,
};

export function getExerciseType(id: string): AnyExerciseType {
  const type = exerciseTypes[id];
  if (!type) throw new Error(`Unknown exercise type: ${id}`);
  return type;
}
