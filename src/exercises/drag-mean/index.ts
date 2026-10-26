import type { ExerciseType } from "../../core/exercise";
import { msg } from "../../core/i18n";
import { dragMeanLogic, type DragMeanParams } from "./logic";
import { dragMeanMessages } from "./messages";
import { DragMeanView } from "./DragMeanView";

export const dragMean: ExerciseType<DragMeanParams, number> = {
  ...dragMeanLogic,
  prompt: (p) => msg(p.target === "mean" ? "dragMean.prompt.mean" : "dragMean.prompt.median"),
  View: DragMeanView,
  messages: dragMeanMessages,
};
