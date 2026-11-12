import type { ExerciseViewProps } from "../../core/exercise";
import { useI18n } from "../../settings/SettingsContext";
import { FnPlot } from "../../ui/plot/FnPlot";
import { FnCurve } from "../../ui/plot/marks";
import type { PickGraphParams } from "./logic";

const LETTERS = ["A", "B", "C", "D"];

export function PickGraphView({ params, answer, onAnswer, feedback }: ExerciseViewProps<PickGraphParams, number>) {
  const { t } = useI18n();
  const revealed = feedback !== null;
  return (
    <div className="exercise pick-graph">
      <div className="curve-options plot-options" role="radiogroup" aria-label={t("pickGraph.choices")}>
        {params.options.map((spec, i) => {
          const state = !revealed ? (answer === i ? "selected" : "") : i === params.answer ? "right" : i === answer ? "wrong" : "dim";
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={answer === i}
              aria-label={t("pickGraph.option", { n: i + 1 })}
              className={`curve-option ${state}`}
              disabled={revealed}
              onClick={() => onAnswer(i)}
            >
              <span className="curve-option-letter" aria-hidden="true">
                {LETTERS[i]}
              </span>
              <FnPlot compact label={t("pickGraph.option", { n: i + 1 })}>
                {(s) => <FnCurve spec={spec} s={s} className={i === params.answer && revealed ? "fn-truth" : "fn-neutral"} asymptotes />}
              </FnPlot>
            </button>
          );
        })}
      </div>
    </div>
  );
}
