import type { ExerciseType } from "../../core/exercise";
import { msg } from "../../core/i18n";
import { trueFalseLogic, type TrueFalseAnswer, type TrueFalseParams } from "./logic";
import { trueFalseMessages } from "./messages";
import { TrueFalseView } from "./TrueFalseView";

export const trueFalse: ExerciseType<TrueFalseParams, TrueFalseAnswer> = {
  ...trueFalseLogic,
  prompt: () => msg("tf.prompt"),
  View: TrueFalseView,
  messages: trueFalseMessages,
};
