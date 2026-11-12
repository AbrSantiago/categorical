import type { ExerciseType } from "../../core/exercise";
import { msg } from "../../core/i18n";
import { specValues } from "../../functions/messages";
import { EvaluateView } from "./EvaluateView";
import { evaluateLogic, type EvaluateAnswer, type EvaluateParams } from "./logic";
import { evaluateMessages } from "./messages";

export const evaluateGraph: ExerciseType<EvaluateParams, EvaluateAnswer> = {
  ...evaluateLogic,
  prompt: (p) =>
    p.variant === "value" ? msg("evaluate.prompt.value", { ...specValues(p.spec), x0: p.x0 }) : msg("evaluate.prompt.solve", { c: p.c }),
  View: EvaluateView,
  ready: (a) => a.point !== null || a.xs.length > 0 || a.none,
  messages: evaluateMessages,
};
