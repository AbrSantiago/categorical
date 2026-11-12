import type { ExerciseType } from "../../core/exercise";
import { msg } from "../../core/i18n";
import type { FamilyId } from "../../functions";
import { specValues } from "../../functions/messages";
import { ClassifyView } from "./ClassifyView";
import { classifyLogic, type ClassifyParams } from "./logic";
import { classifyMessages } from "./messages";

export const classifyFunction: ExerciseType<ClassifyParams, FamilyId> = {
  ...classifyLogic,
  prompt: (p) => (p.mode === "graph" ? msg("classify.prompt.graph") : msg("classify.prompt.formula", specValues(p.spec))),
  View: ClassifyView,
  messages: classifyMessages,
};
