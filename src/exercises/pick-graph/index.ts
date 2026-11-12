import type { ExerciseType } from "../../core/exercise";
import { msg } from "../../core/i18n";
import { specValues } from "../../functions/messages";
import { pickGraphLogic, type PickGraphParams } from "./logic";
import { pickGraphMessages } from "./messages";
import { PickGraphView } from "./PickGraphView";

export const pickGraph: ExerciseType<PickGraphParams, number> = {
  ...pickGraphLogic,
  prompt: (p) => msg("pickGraph.prompt", specValues(p.spec)),
  View: PickGraphView,
  messages: pickGraphMessages,
};
