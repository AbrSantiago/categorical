import type { ExerciseType } from "../../core/exercise";
import { msg } from "../../core/i18n";
import { fitNormalLogic, type FitNormalAnswer, type FitNormalParams } from "./logic";
import { fitNormalMessages } from "./messages";
import { FitNormalView } from "./FitNormalView";

export const fitNormal: ExerciseType<FitNormalParams, FitNormalAnswer> = {
  ...fitNormalLogic,
  prompt: (p) => msg(p.mode === "curve" ? "fitNormal.prompt.curve" : "fitNormal.prompt.sample"),
  View: FitNormalView,
  messages: fitNormalMessages,
};
