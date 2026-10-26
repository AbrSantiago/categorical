import { useMemo } from "react";
import type { ExerciseViewProps } from "../../core/exercise";
import { histogram, normalPdf } from "../../core/stats";
import { useI18n } from "../../settings/SettingsContext";
import { Chart } from "../../ui/chart/Chart";
import { Curve, Histogram, LegendKey } from "../../ui/chart/marks";
import { Slider } from "../../ui/Slider";
import { MU_RANGE, SIGMA_RANGE, START, type FitNormalAnswer, type FitNormalParams } from "./logic";

const Y_MAX = 0.9;

export function FitNormalView({ params, answer, onAnswer, feedback }: ExerciseViewProps<FitNormalParams, FitNormalAnswer>) {
  const { t } = useI18n();
  const value = answer ?? START;
  const { target, domain, mode } = params;
  const bins = useMemo(
    () => (mode === "sample" ? histogram(params.sample, domain[0], domain[1], 48) : []),
    [mode, params.sample, domain],
  );
  const showTarget = mode === "curve" || feedback !== null;

  const legend = [
    { className: "key-user", label: t("fitNormal.legend.user") },
    ...(showTarget
      ? [{ className: "key-target", label: t(mode === "curve" ? "fitNormal.legend.target" : "fitNormal.legend.real"), dashed: true }]
      : []),
    ...(mode === "sample" ? [{ className: "key-bars", label: t("fitNormal.legend.sample", { n: params.sample.length }) }] : []),
  ];

  return (
    <div className="exercise fit-normal">
      <div className="chart-card">
        <Chart xDomain={domain} yMax={Y_MAX} label={t("fitNormal.chart")}>
          {(s) => (
            <>
              {mode === "sample" && <Histogram bins={bins} scales={s} gap={1} />}
              {showTarget && (
                <Curve fn={(x) => normalPdf(x, target.mu, target.sigma)} scales={s} className="series-target" dashed />
              )}
              <Curve fn={(x) => normalPdf(x, value.mu, value.sigma)} scales={s} className="series-user" area />
            </>
          )}
        </Chart>
        <LegendKey items={legend} />
      </div>
      <div className="controls">
        <Slider
          symbol="\mu"
          name={t("fitNormal.slider.mu")}
          value={value.mu}
          {...MU_RANGE}
          disabled={feedback !== null}
          onChange={(mu) => onAnswer({ ...value, mu })}
        />
        <Slider
          symbol="\sigma"
          name={t("fitNormal.slider.sigma")}
          value={value.sigma}
          {...SIGMA_RANGE}
          decimals={2}
          disabled={feedback !== null}
          onChange={(sigma) => onAnswer({ ...value, sigma })}
        />
      </div>
    </div>
  );
}
