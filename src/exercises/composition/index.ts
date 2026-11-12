import type { ExerciseType } from "../../core/exercise";
import { msg } from "../../core/i18n";
import { CompositionView } from "./CompositionView";
import { compositionLogic, type CompositionParams } from "./logic";
import { compositionMessages } from "./messages";

export const composition: ExerciseType<CompositionParams, number> = {
  ...compositionLogic,
  prompt: (p) => msg(`comp.prompt.${p.variant}`, { fid: p.f.id, fc: p.f.c, gid: p.g.id, gc: p.g.c, x0: p.x0 }),
  View: CompositionView,
  messages: compositionMessages,
};
