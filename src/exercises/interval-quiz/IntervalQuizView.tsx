import type { ExerciseViewProps } from "../../core/exercise";
import { useI18n } from "../../settings/SettingsContext";
import { ChoiceGrid } from "../../ui/ChoiceGrid";
import { FnPlot } from "../../ui/plot/FnPlot";
import { FnCurve, SetOnAxis } from "../../ui/plot/marks";
import { decodeSet } from "../../functions";
import type { IntervalQuizParams } from "./logic";

export function IntervalQuizView({ params, answer, onAnswer, feedback }: ExerciseViewProps<IntervalQuizParams, number>) {
  const { t } = useI18n();
  const revealed = feedback !== null;
  return (
    <div className="exercise interval-quiz">
      <ChoiceGrid
        label={t("intervalQuiz.choices")}
        options={params.options.map((set, i) => ({ value: String(i), label: t("fn.set", { set }) }))}
        answer={answer === null ? null : String(answer)}
        correct={revealed ? String(params.answer) : null}
        onAnswer={(v) => onAnswer(Number(v))}
      />
      {revealed && (
        <div className="chart-card plot-card">
          <FnPlot label={t("fn.chart")}>
            {(s) => (
              <>
                <FnCurve spec={params.spec} s={s} asymptotes />
                <SetOnAxis set={decodeSet(params.options[params.answer])} axis={params.axis} s={s} />
              </>
            )}
          </FnPlot>
        </div>
      )}
    </div>
  );
}
