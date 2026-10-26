import { useMemo } from "react";
import type { ExerciseViewProps } from "../../core/exercise";
import { histogram, integerHistogram } from "../../core/stats";
import { getDist } from "../../distributions";
import { useI18n } from "../../settings/SettingsContext";
import { Chart } from "../../ui/chart/Chart";
import { Curve, Histogram, LegendKey } from "../../ui/chart/marks";
import { ChoiceGrid } from "../../ui/ChoiceGrid";
import type { GuessDistributionParams } from "./logic";

export function GuessDistributionView({ params, answer, onAnswer, feedback }: ExerciseViewProps<GuessDistributionParams, string>) {
  const { t } = useI18n();
  const { sample, domain, discrete, dist, options } = params;
  const def = getDist(dist);
  const bins = useMemo(
    () =>
      discrete
        ? integerHistogram(sample, 0, Math.floor(domain[1]))
        : histogram(sample, domain[0], domain[1], sample.length > 300 ? 28 : 16),
    [sample, domain, discrete],
  );
  const density = (x: number) => def.density(x, params.params);
  const yMax = Math.max(...bins.map((b) => b.density)) * 1.15;
  const revealed = feedback !== null;

  return (
    <div className="exercise guess-distribution">
      <div className="chart-card">
        <Chart xDomain={domain} yMax={yMax} integerTicks={discrete} label={t("guess.chart", { n: sample.length })}>
          {(s) => (
            <>
              <Histogram bins={bins} scales={s} discrete={discrete} gap={discrete ? 6 : 2} />
              {revealed && !discrete && <Curve fn={density} scales={s} className="series-target" dashed />}
              {revealed &&
                discrete &&
                bins.map((b) => {
                  const k = Math.round((b.x0 + b.x1) / 2);
                  return <circle key={k} className="pmf-dot" cx={s.x(k)} cy={s.y(density(k))} r={5} />;
                })}
            </>
          )}
        </Chart>
        <LegendKey
          items={[
            { className: "key-bars", label: t("guess.legend.sample", { n: sample.length }) },
            ...(revealed
              ? [{ className: "key-target", label: t("guess.legend.theory", { dist }), dashed: !discrete, dot: discrete }]
              : []),
          ]}
        />
      </div>
      <ChoiceGrid
        label={t("guess.choices")}
        options={options.map((id) => ({ value: id, label: t("guess.name", { dist: id }) }))}
        answer={answer}
        correct={revealed ? dist : null}
        onAnswer={onAnswer}
      />
    </div>
  );
}
