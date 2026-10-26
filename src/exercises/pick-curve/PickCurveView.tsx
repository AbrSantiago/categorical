import type { ExerciseViewProps } from "../../core/exercise";
import { getDist } from "../../distributions";
import { useI18n } from "../../settings/SettingsContext";
import { Chart } from "../../ui/chart/Chart";
import { DistributionMark } from "../../ui/chart/DistributionMark";
import { RichText } from "../../ui/Math";
import type { PickCurveParams } from "./logic";

const LETTERS = ["A", "B", "C", "D"];

export function PickCurveView({ params, answer, onAnswer, feedback }: ExerciseViewProps<PickCurveParams, number>) {
  const { t } = useI18n();
  const def = getDist(params.dist);
  const discrete = def.kind === "discrete";
  const xDomain: [number, number] = discrete ? [params.range[0] - 0.5, params.range[1] + 0.5] : params.range;
  const revealed = feedback !== null;

  return (
    <div className="exercise pick-curve">
      <div className="curve-options" role="radiogroup" aria-label={t("pick.choices")}>
        {params.options.map((option, i) => {
          const state = !revealed
            ? answer === i
              ? "selected"
              : ""
            : i === params.answer
              ? "right"
              : i === answer
                ? "wrong"
                : "dim";
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={answer === i}
              aria-label={t("pick.option", { n: i + 1 })}
              className={`curve-option ${state}`}
              disabled={revealed}
              onClick={() => onAnswer(i)}
            >
              <span className="curve-option-letter" aria-hidden="true">
                {LETTERS[i]}
              </span>
              <Chart compact xDomain={xDomain} yMax={params.yMax} integerTicks={discrete} label={t("pick.option", { n: i + 1 })}>
                {(s) => <DistributionMark def={def} params={option} scales={s} range={params.range} role="user" />}
              </Chart>
              {revealed && (
                <span className="curve-option-caption">
                  <RichText text={t({ id: "dist.call", values: { id: params.dist, ...option } })} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
