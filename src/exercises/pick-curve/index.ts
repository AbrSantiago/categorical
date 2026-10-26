import type { ExerciseType } from "../../core/exercise";
import { msg } from "../../core/i18n";
import { pickCurveLogic, type PickCurveParams } from "./logic";
import { pickCurveMessages } from "./messages";
import { PickCurveView } from "./PickCurveView";

export const pickCurve: ExerciseType<PickCurveParams, number> = {
  ...pickCurveLogic,
  prompt: (p) => msg("pick.prompt", { id: p.dist, ...p.target }),
  View: PickCurveView,
  messages: pickCurveMessages,
};
