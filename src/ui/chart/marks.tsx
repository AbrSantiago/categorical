import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { Bin } from "../../core/stats";
import { linspace } from "../../core/stats";
import type { ChartScales } from "./Chart";
import { useI18n } from "../../settings/SettingsContext";

/** Column path: 4px rounded top, square at the baseline. */
function columnPath(x0: number, x1: number, top: number, base: number): string {
  const h = base - top;
  const r = Math.min(4, (x1 - x0) / 2, h);
  if (h <= 0) return "";
  return [
    `M${x0},${base}`,
    `V${top + r}`,
    `Q${x0},${top} ${x0 + r},${top}`,
    `H${x1 - r}`,
    `Q${x1},${top} ${x1},${top + r}`,
    `V${base}`,
    "Z",
  ].join(" ");
}

interface HistogramProps {
  bins: Bin[];
  scales: ChartScales;
  /** Gap between touching bars, in px. Discrete data gets wider gaps. */
  gap?: number;
  discrete?: boolean;
}

/** Histogram (density scale) with a per-bar hover/focus readout. */
export function Histogram({ bins, scales, gap = 2, discrete }: HistogramProps) {
  const { x, y, plot } = scales;
  const [hover, setHover] = useState<number | null>(null);
  const reduced = useReducedMotion();
  const total = bins.reduce((a, b) => a + b.count, 0);

  return (
    <g className="histogram">
      {bins.map((bin, i) => {
        const left = x(bin.x0) + gap / 2;
        let right = x(bin.x1) - gap / 2;
        if (discrete) right = Math.min(right, left + 24);
        const offset = discrete ? (x(bin.x1) - x(bin.x0) - gap - (right - left)) / 2 : 0;
        const top = y(bin.density);
        const d = columnPath(left + offset, right + offset, top, plot.bottom);
        if (!d) return null;
        return (
          <motion.path
            key={i}
            d={d}
            className={hover === i ? "bar is-hover" : "bar"}
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduced ? 0 : i * 0.012, duration: 0.25 }}
          />
        );
      })}
      {/* Hit targets: full-height columns, bigger than the bars. */}
      {bins.map((bin, i) => (
        <rect
          key={`hit${i}`}
          className="bar-hit"
          x={x(bin.x0)}
          width={x(bin.x1) - x(bin.x0)}
          y={plot.top}
          height={plot.bottom - plot.top}
          onPointerEnter={(e) => e.pointerType === "mouse" && setHover(i)}
          onPointerLeave={() => setHover(null)}
        />
      ))}
      {hover !== null && bins[hover] && (
        <BinTooltip bin={bins[hover]} total={total} scales={scales} discrete={discrete} />
      )}
    </g>
  );
}

function BinTooltip({
  bin,
  total,
  scales,
  discrete,
}: {
  bin: Bin;
  total: number;
  scales: ChartScales;
  discrete?: boolean;
}) {
  const { t, fmt } = useI18n();
  const { x, plot } = scales;
  const cx = (x(bin.x0) + x(bin.x1)) / 2;
  const label = discrete
    ? `x = ${Math.round((bin.x0 + bin.x1) / 2)}`
    : `[${fmt.num(bin.x0)}; ${fmt.num(bin.x1)})`;
  const share = t("chart.tooltip", { count: bin.count, total, pct: Math.round((bin.count / total) * 100) });
  const w = 150;
  const left = Math.min(Math.max(cx - w / 2, plot.left), plot.right - w);
  return (
    <g className="tooltip" transform={`translate(${left},${plot.top})`} pointerEvents="none">
      <rect width={w} height={44} rx={8} />
      <text x={10} y={18} className="tooltip-title">
        {label}
      </text>
      <text x={10} y={35}>
        {share}
      </text>
    </g>
  );
}

interface CurveProps {
  fn: (x: number) => number;
  scales: ChartScales;
  className: string;
  samples?: number;
  /** Shade the area under the curve with a light wash. */
  area?: boolean;
  dashed?: boolean;
}

export function Curve({ fn, scales, className, samples = 160, area, dashed }: CurveProps) {
  const { x, y, plot } = scales;
  const xs = linspace(x.domain[0], x.domain[1], samples);
  const pts = xs.map((v) => [x(v), Math.max(plot.top - 40, y(fn(v)))] as const);
  const line = pts.map(([px, py], i) => `${i ? "L" : "M"}${px.toFixed(2)},${py.toFixed(2)}`).join(" ");
  const fill = `${line} L${plot.right},${plot.bottom} L${plot.left},${plot.bottom} Z`;
  return (
    <g className={`curve ${className}`}>
      {area && <path className="curve-area" d={fill} />}
      <path className="curve-line" d={line} strokeDasharray={dashed ? "7 6" : undefined} />
    </g>
  );
}

interface VLineProps {
  value: number;
  scales: ChartScales;
  className: string;
  label?: string;
  /** Where to place the label vertically, 0 = top. */
  labelRow?: number;
}

export function VLine({ value, scales, className, label, labelRow = 0 }: VLineProps) {
  const { x, plot } = scales;
  const px = x(value);
  const anchorRight = px > (plot.left + plot.right) / 2;
  return (
    <g className={`vline ${className}`}>
      <line x1={px} x2={px} y1={plot.top} y2={plot.bottom} />
      {label && (
        <text
          x={px + (anchorRight ? -8 : 8)}
          y={plot.top + 14 + labelRow * 20}
          textAnchor={anchorRight ? "end" : "start"}
          className="vline-label"
        >
          {label}
        </text>
      )}
    </g>
  );
}

export function LegendKey({
  items,
}: {
  items: { className: string; label: string; dashed?: boolean; dot?: boolean }[];
}) {
  return (
    <ul className="legend">
      {items.map((item) => (
        <li key={item.label}>
          <svg width="22" height="10" aria-hidden="true" className={item.className}>
            {item.dot ? (
              <circle cx="11" cy="5" r="4" />
            ) : (
              <line x1="1" x2="21" y1="5" y2="5" strokeDasharray={item.dashed ? "5 4" : undefined} />
            )}
          </svg>
          {item.label}
        </li>
      ))}
    </ul>
  );
}

/** Probability mass as lollipops: a stem and a dot at each integer. */
export function Stems({
  fn,
  scales,
  className,
  from,
  to,
}: {
  fn: (k: number) => number;
  scales: ChartScales;
  className: string;
  from: number;
  to: number;
}) {
  const { x, y, plot } = scales;
  const ks: number[] = [];
  for (let k = Math.ceil(from); k <= Math.floor(to); k++) ks.push(k);
  return (
    <g className={`stems ${className}`}>
      {ks.map((k) => {
        const v = fn(k);
        if (v < 1e-4) return null;
        const top = Math.max(plot.top - 30, y(v));
        return (
          <g key={k}>
            <line x1={x(k)} x2={x(k)} y1={plot.bottom} y2={top} />
            <circle cx={x(k)} cy={top} r={4.5} />
          </g>
        );
      })}
    </g>
  );
}

/** Probability mass as bars centered on each integer. */
export function MassBars({
  fn,
  scales,
  className,
  from,
  to,
}: {
  fn: (k: number) => number;
  scales: ChartScales;
  className: string;
  from: number;
  to: number;
}) {
  const { x, y, plot } = scales;
  const ks: number[] = [];
  for (let k = Math.ceil(from); k <= Math.floor(to); k++) ks.push(k);
  const slot = ks.length > 1 ? x(ks[1]) - x(ks[0]) : 24;
  const w = Math.min(20, slot * 0.7);
  return (
    <g className={`mass-bars ${className}`}>
      {ks.map((k) => {
        const v = fn(k);
        if (v < 1e-4) return null;
        const top = Math.max(plot.top - 30, y(v));
        return <path key={k} d={columnPath(x(k) - w / 2, x(k) + w / 2, top, plot.bottom)} />;
      })}
    </g>
  );
}
