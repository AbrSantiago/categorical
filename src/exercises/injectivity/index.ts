import type { ExerciseType } from "../../core/exercise";
import { msg } from "../../core/i18n";
import { specValues } from "../../functions/messages";
import { InjectivityView } from "./InjectivityView";
import { injectivityLogic, type InjectivityParams, type Kind } from "./logic";
import { injectivityMessages } from "./messages";

export const injectivity: ExerciseType<InjectivityParams, Kind> = {
  ...injectivityLogic,
  prompt: (p) => msg("inj.prompt", { ...specValues(p.spec), codomain: p.codomain }),
  View: InjectivityView,
  messages: injectivityMessages,
};
