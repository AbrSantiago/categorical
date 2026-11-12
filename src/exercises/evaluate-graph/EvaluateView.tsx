import { useRef } from "react";
import type { ExerciseViewProps } from "../../core/exercise";
import { useI18n } from "../../settings/SettingsContext";
import { FnPlot } from "../../ui/plot/FnPlot";
import { pointerToMath, type PlotScales } from "../../ui/plot/geometry";
import { Dot, FnCurve } from "../../ui/plot/marks";
import type { EvaluateAnswer, EvaluateParams } from "./logic";

const clampInt = (v: number) => Math.max(-6, Math.min(6, Math.round(v)));

function Guides({ x, y, s, className }: { x: number; y: number; s: PlotScales; className: string }) {
  return (
    <g className={`fn-guides ${className}`}>
      <line x1={s.x(x)} x2={s.x(x)} y1={s.y(0)} y2={s.y(y)} />
      <line x1={s.x(0)} x2={s.x(x)} y1={s.y(y)} y2={s.y(y)} />
    </g>
  );
}

export function EvaluateView({ params, answer, onAnswer, feedback }: ExerciseViewProps<EvaluateParams, EvaluateAnswer>) {
  const { t } = useI18n();
  const svg = useRef<SVGSVGElement>(null);
  const value = answer ?? { point: null, xs: [], none: false };
  const revealed = feedback !== null;
  const solve = params.variant === "solve";

  const tap = (e: React.PointerEvent<SVGSVGElement>) => {
    if (revealed || !svg.current) return;
    const p = pointerToMath(e, svg.current);
    if (!solve) return onAnswer({ ...value, point: { x: clampInt(p.x), y: clampInt(p.y) } });
    const x = clampInt(p.x);
    const xs = value.xs.includes(x) ? value.xs.filter((v) => v !== x) : [...value.xs, x];
    onAnswer({ ...value, xs, none: false });
  };

  return (
    <div className="exercise evaluate-graph">
      <div className="chart-card plot-card">
        <FnPlot ref={svg} label={t("evaluate.chart")} className="is-tappable" onPointerDown={tap}>
          {(s) => (
            <>
              {solve && <line className="fn-level" x1={s.plot.left} x2={s.plot.right} y1={s.y(params.c)} y2={s.y(params.c)} />}
              <FnCurve spec={params.spec} s={s} />
              {!solve && value.point && (
                <>
                  <Guides x={value.point.x} y={value.point.y} s={s} className="is-user" />
                  <Dot x={value.point.x} y={value.point.y} s={s} className="fn-pick" r={7} />
                </>
              )}
              {solve &&
                value.xs.map((x) => (
                  <g key={x}>
                    <line className="fn-guides is-user" x1={s.x(x)} x2={s.x(x)} y1={s.y(0)} y2={s.y(params.c)} />
                    <Dot x={x} y={0} s={s} className="fn-pick" r={7} />
                  </g>
                ))}
              {revealed &&
                params.solutions.map((x) => (
                  <g key={`t${x}`}>
                    {!solve && <Guides x={x} y={params.c} s={s} className="is-truth" />}
                    <Dot x={x} y={params.c} s={s} className="fn-dot fn-truth-dot" r={6} />
                  </g>
                ))}
            </>
          )}
        </FnPlot>
      </div>
      {solve && (
        <button
          type="button"
          className={`choice none-choice${value.none ? " selected" : ""}`}
          aria-pressed={value.none}
          disabled={revealed}
          onClick={() => onAnswer({ point: null, xs: [], none: !value.none })}
        >
          {t("evaluate.none")}
        </button>
      )}
    </div>
  );
}
