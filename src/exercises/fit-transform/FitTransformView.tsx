import type { ExerciseViewProps } from "../../core/exercise";
import { formulaTex, type FnSpec } from "../../functions";
import { texNum } from "../../functions/messages";
import { useI18n } from "../../settings/SettingsContext";
import { LegendKey } from "../../ui/chart/marks";
import { Tex } from "../../ui/Math";
import { FnPlot } from "../../ui/plot/FnPlot";
import { FnCurve } from "../../ui/plot/marks";
import { Slider } from "../../ui/Slider";
import { A_STEPS, type Abc, type FitTransformParams } from "./logic";

export function FitTransformView({ params, answer, onAnswer, feedback }: ExerciseViewProps<FitTransformParams, Abc>) {
  const { t, fmt } = useI18n();
  const value = answer ?? { a: 1, h: 0, k: 0 };
  const yours: FnSpec = { family: params.family, ...value };
  const done = feedback !== null;
  const aIndex = A_STEPS.indexOf(value.a);
  return (
    <div className="exercise fit-transform">
      <div className="chart-card plot-card">
        <FnPlot label={t("fitFn.chart")}>
          {(s) => (
            <>
              <FnCurve spec={params.target} s={s} className="fn-truth" dashed dots={false} />
              {value.a !== 0 && <FnCurve spec={yours} s={s} className="fn-user" />}
            </>
          )}
        </FnPlot>
        <p className="formula-live" aria-live="polite">
          <Tex>{value.a === 0 ? `f(x)=${texNum(fmt)(value.k)}` : `f(x)=${formulaTex(yours, texNum(fmt))}`}</Tex>
        </p>
        <LegendKey
          items={[
            { className: "key-user", label: t("fitFn.legend.user") },
            { className: "key-target", label: t("fitFn.legend.target"), dashed: true },
          ]}
        />
      </div>
      <div className="controls">
        {params.free.includes("a") && (
          <Slider
            symbol="a"
            name={t("fitFn.a")}
            value={aIndex}
            min={0}
            max={A_STEPS.length - 1}
            step={1}
            display={fmt.num(value.a, Number.isInteger(value.a) ? 0 : 1)}
            disabled={done}
            onChange={(i) => onAnswer({ ...value, a: A_STEPS[i] })}
          />
        )}
        <Slider symbol="h" name={t("fitFn.hName")} value={value.h} min={-4} max={4} step={1} decimals={0} disabled={done} onChange={(h) => onAnswer({ ...value, h })} />
        <Slider symbol="k" name={t("fitFn.kName")} value={value.k} min={-4} max={4} step={1} decimals={0} disabled={done} onChange={(k) => onAnswer({ ...value, k })} />
      </div>
    </div>
  );
}
