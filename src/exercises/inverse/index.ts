import type { ExerciseType } from "../../core/exercise";
import { msg } from "../../core/i18n";
import { specValues } from "../../functions/messages";
import { InverseView } from "./InverseView";
import { inverseLogic, type InverseParams } from "./logic";
import { inverseMessages } from "./messages";

export const inverse: ExerciseType<InverseParams, number> = {
  ...inverseLogic,
  prompt: (p) => msg(`inv.prompt.${p.variant}`, specValues(p.spec)),
  View: InverseView,
  messages: inverseMessages,
};
