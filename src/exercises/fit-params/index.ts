import type { ExerciseType } from "../../core/exercise";
import { msg } from "../../core/i18n";
import type { Params } from "../../distributions";
import { fitParamsLogic, type FitParamsParams } from "./logic";
import { fitParamsMessages } from "./messages";
import { FitParamsView } from "./FitParamsView";

export const fitParams: ExerciseType<FitParamsParams, Params> = {
  ...fitParamsLogic,
  prompt: (p) => msg("fit.prompt", { dist: p.dist }),
  View: FitParamsView,
  messages: fitParamsMessages,
};
