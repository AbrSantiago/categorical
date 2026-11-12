import type { ExerciseType } from "../../core/exercise";
import { msg } from "../../core/i18n";
import { specValues } from "../../functions/messages";
import { IntervalQuizView } from "./IntervalQuizView";
import { intervalQuizLogic, type IntervalQuizParams } from "./logic";
import { intervalQuizMessages } from "./messages";

export const intervalQuiz: ExerciseType<IntervalQuizParams, number> = {
  ...intervalQuizLogic,
  prompt: (p) => msg(`intervalQuiz.prompt.${p.axis}`, specValues(p.spec)),
  View: IntervalQuizView,
  messages: intervalQuizMessages,
};
