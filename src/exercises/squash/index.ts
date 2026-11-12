import type { ExerciseType } from "../../core/exercise";
import { msg } from "../../core/i18n";
import { specValues } from "../../functions/messages";
import type { LineAnswer } from "../../ui/plot/lineAnswer";
import { squashDomainLogic, squashRangeLogic, type SquashParams } from "./logic";
import { squashMessages } from "./messages";
import { SquashView } from "./SquashView";

export const squashRange: ExerciseType<SquashParams, LineAnswer> = {
  ...squashRangeLogic,
  prompt: (p) => msg("squash.prompt.y", specValues(p.spec)),
  View: SquashView,
  messages: squashMessages,
};

export const squashDomain: ExerciseType<SquashParams, LineAnswer> = {
  ...squashDomainLogic,
  prompt: (p) => msg("squash.prompt.x", specValues(p.spec)),
  View: SquashView,
  messages: squashMessages,
};
