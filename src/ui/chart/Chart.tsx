import { forwardRef, type ReactNode } from "react";
import { useI18n } from "../../settings/SettingsContext";
import { linearScale, niceTicks, type LinearScale } from "./scale";

export const CHART_WIDTH = 640;
export const CHART_HEIGHT = 300;
const MARGIN = { top: 16, right: 16, bottom: 34, left: 16 };
/** Small multiples (e.g. four curves to pick from) use a smaller canvas so text stays legible. */
const COMPACT = { width: 300, height: 170, margin: { top: 10, right: 12, bottom: 28, left: 12 } };

export interface ChartScales {
  x: LinearScale;
  y: LinearScale;
  plot: { left: number; right: number; top: number; bottom: number };
}

interface ChartProps {
  xDomain: [number, number];
  yMax: number;
  /** Accessible description of what the chart shows. */
  label: string;
  /** Integer-only ticks for discrete data. */
  integerTicks?: boolean;
  children: (scales: ChartScales) => ReactNode;
  className?: string;
  compact?: boolean;
}

/**
 * Graph-paper plotting area with an x axis. The y axis is left unlabeled on
 * purpose: exercises are about shape, center and spread, read by eye.
 */
export const Chart = forwardRef<SVGSVGElement, ChartProps>(function Chart(
  { xDomain, yMax, label, integerTicks, children, className, compact },
  ref,
) {
  const { locale } = useI18n();
  const width = compact ? COMPACT.width : CHART_WIDTH;
  const height = compact ? COMPACT.height : CHART_HEIGHT;
  const margin = compact ? COMPACT.margin : MARGIN;
  const plot = {
    left: margin.left,
    right: width - margin.right,
    top: margin.top,
    bottom: height - margin.bottom,
  };
  const x = linearScale(xDomain, [plot.left, plot.right]);
  const y = linearScale([0, yMax], [plot.bottom, plot.top]);
  let ticks = niceTicks(xDomain[0], xDomain[1], compact ? 4 : 8);
  if (integerTicks) ticks = ticks.filter((t) => Number.isInteger(t));

  const rows = compact ? 4 : 6;
  const gridStep = (plot.bottom - plot.top) / rows;
  const hLines = Array.from({ length: rows }, (_, i) => plot.top + i * gridStep);

  return (
    <svg
      ref={ref}
      className={["chart", className].filter(Boolean).join(" ")}
      viewBox={`0 0 ${width} ${height}`}
      role="group"
      aria-label={label}
    >
      <g className="chart-grid" aria-hidden="true">
        {ticks.map((t) => (
          <line key={`v${t}`} x1={x(t)} x2={x(t)} y1={plot.top} y2={plot.bottom} />
        ))}
        {hLines.map((py) => (
          <line key={`h${py}`} x1={plot.left} x2={plot.right} y1={py} y2={py} />
        ))}
      </g>
      {children({ x, y, plot })}
      <g className="chart-axis" aria-hidden="true">
        <line x1={plot.left} x2={plot.right} y1={plot.bottom} y2={plot.bottom} />
        {ticks.map((t) => (
          <g key={t} transform={`translate(${x(t)},${plot.bottom})`}>
            <line y2={5} />
            <text y={compact ? 19 : 22} textAnchor="middle">
              {(Math.abs(t) < 1e-9 ? 0 : t).toLocaleString(locale === "es" ? "es-AR" : "en-US", { maximumFractionDigits: 4 })}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
});
