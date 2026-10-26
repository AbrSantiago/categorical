import type { ExerciseType } from "../../core/exercise";
import { msg } from "../../core/i18n";
import { guessDistributionLogic, type GuessDistributionParams } from "./logic";
import { guessDistributionMessages } from "./messages";
import { GuessDistributionView } from "./GuessDistributionView";

export const guessDistribution: ExerciseType<GuessDistributionParams, string> = {
  ...guessDistributionLogic,
  prompt: () => msg("guess.prompt"),
  View: GuessDistributionView,
  messages: guessDistributionMessages,
};
