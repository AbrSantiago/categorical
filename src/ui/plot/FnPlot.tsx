import { forwardRef, useId, type PointerEventHandler, type ReactNode } from "react";
import { VIEW } from "../../functions";
import { COMPACT, makeScales, SIZE, type PlotScales, type View } from "./geometry";
import { useI18n } from "../../settings/SettingsContext";

interface FnPlotProps {
  label: string;
  view?: View;
  compact?: boolean;
  className?: string;
  children: (s: PlotScales) => ReactNode;
  /** Pointer handlers for exercises that let you tap or drag on the plane. */
  onPointerDown?: PointerEventHandler<SVGSVGElement>;
  onPointerMove?: PointerEventHandler<SVGSVGElement>;
  onPointerUp?: PointerEventHandler<SVGSVGElement>;
}


/**
 * Square graph paper with both axes, one grid line per unit and labels every
 * other unit along the axes, so values can be read off the picture.
 */
export const FnPlot = forwardRef<SVGSVGElement, FnPlotProps>(function FnPlot(
  { label, view = VIEW, compact = false, className, children, ...handlers },
  ref,
) {
  const { locale } = useI18n();
  const clipId = useId().replace(/:/g, "");
  const size = compact ? COMPACT : SIZE;
  const { x, y, plot } = makeScales(view, compact);
  const xs = range(Math.ceil(view.x[0]), Math.floor(view.x[1]));
  const ys = range(Math.ceil(view.y[0]), Math.floor(view.y[1]));
  const fmt = (v: number) => v.toLocaleString(locale === "es" ? "es-AR" : "en-US");
  const x0 = Math.min(Math.max(x(0), plot.left), plot.right);
  const y0 = Math.min(Math.max(y(0), plot.top), plot.bottom);
  const s: PlotScales = { x, y, plot, clip: `url(#${clipId})`, view, compact };

  return (
    <svg
      ref={ref}
      className={["fn-plot", compact ? "is-compact" : "", className].filter(Boolean).join(" ")}
      viewBox={`0 0 ${size} ${size}`}
      role="group"
      aria-label={label}
      {...handlers}
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={plot.left} y={plot.top} width={plot.right - plot.left} height={plot.bottom - plot.top} />
        </clipPath>
        <marker id={`${clipId}-arrow`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" className="fn-arrow" />
        </marker>
      </defs>
      <rect className="fn-paper" x={plot.left} y={plot.top} width={plot.right - plot.left} height={plot.bottom - plot.top} rx={compact ? 6 : 10} />
      <g className="fn-grid" aria-hidden="true">
        {xs.map((v) => (
          <line key={`v${v}`} x1={x(v)} x2={x(v)} y1={plot.top} y2={plot.bottom} />
        ))}
        {ys.map((v) => (
          <line key={`h${v}`} x1={plot.left} x2={plot.right} y1={y(v)} y2={y(v)} />
        ))}
      </g>
      <g className="fn-axes" aria-hidden="true">
        <line x1={plot.left} x2={plot.right} y1={y0} y2={y0} markerEnd={`url(#${clipId}-arrow)`} />
        <line x1={x0} x2={x0} y1={plot.bottom} y2={plot.top} markerEnd={`url(#${clipId}-arrow)`} />
        {xs
          .filter((v) => v !== 0 && v % (compact ? 4 : 2) === 0 && v > view.x[0] && v < view.x[1])
          .map((v) => (
            <g key={`tx${v}`} transform={`translate(${x(v)},${y0})`}>
              <line y1={-4} y2={4} />
              <text y={compact ? 14 : 18} textAnchor="middle">
                {fmt(v)}
              </text>
            </g>
          ))}
        {ys
          .filter((v) => v !== 0 && v % (compact ? 4 : 2) === 0 && v > view.y[0] && v < view.y[1])
          .map((v) => (
            <g key={`ty${v}`} transform={`translate(${x0},${y(v)})`}>
              <line x1={-4} x2={4} />
              <text x={compact ? -6 : -8} y={compact ? 4 : 5} textAnchor="end">
                {fmt(v)}
              </text>
            </g>
          ))}
        {!compact && (
          <>
            <text className="fn-axis-name" x={plot.right - 6} y={y0 - 8} textAnchor="end">
              x
            </text>
            <text className="fn-axis-name" x={x0 + 8} y={plot.top + 16}>
              y
            </text>
          </>
        )}
      </g>
      {children(s)}
    </svg>
  );
});

function range(from: number, to: number): number[] {
  return Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i);
}

export type { PlotScales, View } from "./geometry";
