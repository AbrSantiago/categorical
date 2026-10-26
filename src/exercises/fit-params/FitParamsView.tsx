import type { ExerciseViewProps } from "../../core/exercise";
import { getDist, type Params } from "../../distributions";
import { useI18n } from "../../settings/SettingsContext";
import { Chart } from "../../ui/chart/Chart";
import { DistributionMark } from "../../ui/chart/DistributionMark";
import { LegendKey } from "../../ui/chart/marks";
import { Slider } from "../../ui/Slider";
import type { FitParamsParams } from "./logic";

function decimalsOf(step: number): number {
  return step >= 1 ? 0 : step >= 0.1 ? 1 : 2;
}

export function FitParamsView({ params, answer, onAnswer, feedback }: ExerciseViewProps<FitParamsParams, Params>) {
  const { t } = useI18n();
  const def = getDist(params.dist);
  const value = answer ?? params.start;
  const discrete = def.kind === "discrete";
  // Discrete ranges sit between integers so the first and last bars aren't cut in half.
  const xDomain: [number, number] = discrete ? [params.range[0] - 0.5, params.range[1] + 0.5] : params.range;

  return (
    <div className="exercise fit-params">
      <div className="chart-card">
        <Chart xDomain={xDomain} yMax={params.yMax} integerTicks={discrete} label={t("fit.chart")}>
          {(s) => (
            <>
              <DistributionMark def={def} params={params.target} scales={s} range={params.range} role="target" />
              <DistributionMark def={def} params={value} scales={s} range={params.range} role="user" />
            </>
          )}
        </Chart>
        <LegendKey
          items={[
            { className: "key-user", label: t("fit.legend.user"), dot: discrete },
            { className: discrete ? "key-bars-target" : "key-target", label: t("fit.legend.target"), dashed: !discrete },
          ]}
        />
      </div>
      <div className="controls">
        {def.params.map((p) => {
          const [min, max, step] = def.fit!.grid[p.key];
          return (
            <Slider
              key={p.key}
              symbol={p.tex}
              name={t(`dist.${def.id}.param.${p.key}.role`)}
              value={value[p.key]}
              min={min}
              max={max}
              step={step}
              decimals={decimalsOf(step)}
              disabled={feedback !== null}
              onChange={(v) => onAnswer({ ...value, [p.key]: v })}
            />
          );
        })}
      </div>
    </div>
  );
}
