import type { ExerciseType } from "../../core/exercise";
import { msg } from "../../core/i18n";
import { paramQuizLogic, type ParamQuizParams } from "./logic";
import { paramQuizMessages } from "./messages";
import { ParamQuizView } from "./ParamQuizView";

export const paramQuiz: ExerciseType<ParamQuizParams, string> = {
  ...paramQuizLogic,
  prompt: (p) => msg(`quiz.prompt.${p.variant}`, p.key ? { dist: p.dist, key: p.key } : { dist: p.dist }),
  View: ParamQuizView,
  messages: paramQuizMessages,
};
