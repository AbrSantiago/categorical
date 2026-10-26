import type { ExerciseType } from "../../core/exercise";
import { msg } from "../../core/i18n";
import { isComplete, matchPairsLogic, type MatchAnswer, type MatchPairsParams } from "./logic";
import { matchPairsMessages } from "./messages";
import { MatchPairsView } from "./MatchPairsView";

export const matchPairs: ExerciseType<MatchPairsParams, MatchAnswer> = {
  ...matchPairsLogic,
  prompt: () => msg("match.prompt"),
  View: MatchPairsView,
  messages: matchPairsMessages,
  ready: isComplete,
};
