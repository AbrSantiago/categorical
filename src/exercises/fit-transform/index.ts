import type { ExerciseType } from "../../core/exercise";
import { msg } from "../../core/i18n";
import { FitTransformView } from "./FitTransformView";
import { fitTransformLogic, type Abc, type FitTransformParams } from "./logic";
import { fitTransformMessages } from "./messages";

export const fitTransform: ExerciseType<FitTransformParams, Abc> = {
  ...fitTransformLogic,
  prompt: (p) => msg("fitFn.prompt", { family: p.family }),
  View: FitTransformView,
  messages: fitTransformMessages,
};
