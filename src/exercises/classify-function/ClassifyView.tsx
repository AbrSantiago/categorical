import type { ExerciseViewProps } from "../../core/exercise";
import type { FamilyId } from "../../functions";
import { useI18n } from "../../settings/SettingsContext";
import { ChoiceGrid } from "../../ui/ChoiceGrid";
import { FnPlot } from "../../ui/plot/FnPlot";
import { FnCurve } from "../../ui/plot/marks";
import type { ClassifyParams } from "./logic";

export function ClassifyView({ params, answer, onAnswer, feedback }: ExerciseViewProps<ClassifyParams, FamilyId>) {
  const { t } = useI18n();
  const revealed = feedback !== null;
  const showGraph = params.mode === "graph" || revealed;
  return (
    <div className="exercise classify-function">
      {showGraph && (
        <div className="chart-card plot-card">
          <FnPlot label={t("fn.chart")}>{(s) => <FnCurve spec={params.spec} s={s} asymptotes={revealed} />}</FnPlot>
        </div>
      )}
      <ChoiceGrid
        label={t("classify.choices")}
        options={params.options.map((family) => ({ value: family, label: t("fn.Name", { family }) }))}
        answer={answer}
        correct={revealed ? params.spec.family : null}
        onAnswer={(v) => onAnswer(v as FamilyId)}
      />
    </div>
  );
}
