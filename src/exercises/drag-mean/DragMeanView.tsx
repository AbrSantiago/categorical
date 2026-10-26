import { useMemo, useRef, type KeyboardEvent, type PointerEvent } from "react";
import type { ExerciseViewProps } from "../../core/exercise";
import { histogram } from "../../core/stats";
import { Chart, type ChartScales } from "../../ui/chart/Chart";
import { Histogram, LegendKey, VLine } from "../../ui/chart/marks";
import { useI18n } from "../../settings/SettingsContext";
import type { DragMeanParams } from "./logic";

const STEP = 0.1;

export function DragMeanView({ params, answer, onAnswer, feedback }: ExerciseViewProps<DragMeanParams, number>) {
  const { sample, domain, stats, target } = params;
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const bins = useMemo(() => histogram(sample, domain[0], domain[1], 30), [sample, domain]);
  const yMax = Math.max(...bins.map((b) => b.density)) * 1.3;
  const value = answer ?? (domain[0] + domain[1]) / 2;
  const locked = feedback !== null;
  const { t, fmt } = useI18n();

  const clamp = (v: number) => Math.min(domain[1], Math.max(domain[0], Math.round(v / STEP) * STEP));

  function valueFromPointer(e: PointerEvent, scales: ChartScales): number {
    const svg = svgRef.current!;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const local = pt.matrixTransform(svg.getScreenCTM()!.inverse());
    return clamp(scales.x.invert(local.x));
  }

  function onKeyDown(e: KeyboardEvent) {
    if (locked) return;
    const big = e.shiftKey ? 10 : 1;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") onAnswer(clamp(value + STEP * big));
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") onAnswer(clamp(value - STEP * big));
    else return;
    e.preventDefault();
  }

  return (
    <div className="exercise drag-mean">
      <div className="chart-card">
        <Chart ref={svgRef} xDomain={domain} yMax={yMax} label={t("dragMean.chart", { n: sample.length })} className={locked ? "" : "is-draggable"}>
          {(s) => (
            <>
              <Histogram bins={bins} scales={s} />
              {locked && (
                <>
                  <VLine value={stats.mean} scales={s} className="series-target" />
                  <VLine value={stats.median} scales={s} className="series-ink" />
                </>
              )}
              <g
                className="drag-handle"
                role="slider"
                tabIndex={locked ? -1 : 0}
                aria-label={t("dragMean.handle", { target })}
                aria-valuemin={domain[0]}
                aria-valuemax={domain[1]}
                aria-valuenow={Number(value.toFixed(1))}
                aria-valuetext={fmt.num(value)}
                aria-disabled={locked}
                onKeyDown={onKeyDown}
              >
                <VLine value={value} scales={s} className="series-user" />
                <circle className="handle-knob" cx={s.x(value)} cy={s.plot.bottom} r={9} />
              </g>
              {/* Capture layer: press anywhere on the plot and drag. */}
              {!locked && (
                <rect
                  className="drag-capture"
                  x={s.plot.left}
                  y={s.plot.top}
                  width={s.plot.right - s.plot.left}
                  height={s.plot.bottom - s.plot.top + 20}
                  onPointerDown={(e) => {
                    dragging.current = true;
                    e.currentTarget.setPointerCapture(e.pointerId);
                    onAnswer(valueFromPointer(e, s));
                  }}
                  onPointerMove={(e) => {
                    if (dragging.current) onAnswer(valueFromPointer(e, s));
                  }}
                  onPointerUp={() => {
                    dragging.current = false;
                  }}
                  onPointerCancel={() => {
                    dragging.current = false;
                  }}
                />
              )}
            </>
          )}
        </Chart>
        <LegendKey
          items={[
            { className: "key-user", label: t("dragMean.legend.user", { value: fmt.num(value) }) },
            ...(locked
              ? [
                  { className: "key-target", label: t("dragMean.legend.mean", { value: fmt.num(stats.mean) }) },
                  { className: "key-ink", label: t("dragMean.legend.median", { value: fmt.num(stats.median) }), dashed: true },
                ]
              : []),
          ]}
        />
      </div>
      <p className="hint">
        {locked ? " " : t("dragMean.hint")}
      </p>
    </div>
  );
}
