import { useMemo, useRef, useState } from "react";
import type { ExerciseViewProps } from "../../core/exercise";
import { decodeSet, imageOf, minus, solve, type FnSpec } from "../../functions";
import { useI18n } from "../../settings/SettingsContext";
import { ChoiceGrid } from "../../ui/ChoiceGrid";
import { FnPlot } from "../../ui/plot/FnPlot";
import { pointerToMath, squashX, type PlotScales } from "../../ui/plot/geometry";
import { Dot, FnCurve, SetOnAxis } from "../../ui/plot/marks";
import { Slider } from "../../ui/Slider";
import { KINDS, type InjectivityParams, type Kind } from "./logic";

/** How many x land on each height: the paint that piles up when squashing. */
function paint(spec: FnSpec, s: PlotScales): { from: number; to: number; n: number }[] {
  const out: { from: number; to: number; n: number }[] = [];
  const stepY = 0.04;
  for (let y = s.view.y[0]; y <= s.view.y[1]; y += stepY) {
    const xs = solve(spec, y + stepY / 2);
    const n = xs === null ? 2 : Math.min(xs.length, 2);
    const last = out[out.length - 1];
    if (last && last.n === n && Math.abs(last.to - y) < 1e-9) last.to = y + stepY;
    else out.push({ from: y, to: y + stepY, n });
  }
  return out.filter((seg) => seg.n > 0);
}

export function InjectivityView({ params, answer, onAnswer, feedback }: ExerciseViewProps<InjectivityParams, Kind>) {
  const { t } = useI18n();
  const svg = useRef<SVGSVGElement>(null);
  const [lineY, setLineY] = useState(3.5);
  const [squash, setSquash] = useState(0);
  const dragging = useRef(false);
  const revealed = feedback !== null;
  const codomain = useMemo(() => decodeSet(params.codomain), [params.codomain]);
  const gaps = useMemo(() => minus(codomain, imageOf(params.spec)), [codomain, params.spec]);
  const hits = solve(params.spec, lineY) ?? [];

  const moveLine = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svg.current) return;
    const y = pointerToMath(e, svg.current).y;
    setLineY(Math.max(-5.75, Math.min(5.75, Math.round(y * 4) / 4)));
  };

  return (
    <div className="exercise injectivity">
      <div className="chart-card plot-card">
        <FnPlot
          ref={svg}
          label={t("fn.chart")}
          className="is-draggable"
          onPointerDown={(e) => {
            dragging.current = true;
            (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
            moveLine(e);
          }}
          onPointerMove={(e) => dragging.current && moveLine(e)}
          onPointerUp={() => (dragging.current = false)}
        >
          {(s) => {
            const x0 = s.x(0);
            return (
              <>
                <SetOnAxis set={codomain} axis="y" s={s} className="fn-codomain" markers={false} />
                {squash > 0 &&
                  paint(params.spec, s).map((seg, i) => (
                    <line
                      key={i}
                      className={`fn-paint is-${seg.n}`}
                      style={{ opacity: squash }}
                      x1={x0}
                      x2={x0}
                      y1={s.y(seg.from)}
                      y2={s.y(seg.to)}
                      clipPath={s.clip}
                    />
                  ))}
                {squash > 0.95 && <SetOnAxis set={gaps} axis="y" s={s} className="fn-gap" markers={false} />}
                <FnCurve spec={params.spec} s={s} m={squashX(squash)} far={1e4} className="fn-truth" opacity={Math.max(0.12, 1 - Math.max(0, squash - 0.75) * 3.5)} />
                <g className="fn-hline">
                  <line x1={s.plot.left} x2={s.plot.right} y1={s.y(lineY)} y2={s.y(lineY)} />
                  <text x={s.plot.right - 8} y={s.y(lineY) - 8} textAnchor="end">
                    {t("inj.line", { n: hits.length })}
                  </text>
                </g>
                {squash === 0 && hits.map((x) => <Dot key={x} x={x} y={lineY} s={s} className="fn-hit" r={6} />)}
              </>
            );
          }}
        </FnPlot>
        <p className="hint">{t("inj.lineHelp")}</p>
        <Slider symbol="t" name={t("squash.slider")} value={squash} min={0} max={1} step={0.01} display={`${Math.round(squash * 100)}%`} onChange={setSquash} />
        <div className="legend inj-legend" aria-hidden="true">
          <span className="legend-item">
            <span className="swatch swatch-codomain" /> {t("inj.codomain")}
          </span>
          <span className="legend-item">
            <span className="swatch swatch-paint" /> {t("inj.paint")}
          </span>
        </div>
      </div>
      <ChoiceGrid
        stacked
        label={t("inj.choices")}
        options={KINDS.map((kind) => ({ value: kind, label: t("inj.kind", { kind }) }))}
        answer={answer}
        correct={revealed ? params.kind : null}
        onAnswer={(v) => onAnswer(v as Kind)}
      />
    </div>
  );
}
