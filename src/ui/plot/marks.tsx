import {
  domainOf,
  endpoints,
  evaluate,
  horizontalAsymptote,
  holes,
  normalize,
  verticalAsymptote,
  type FnSpec,
  type IntervalSet,
} from "../../functions";
import { IDENTITY, type Mat, type PlotScales } from "./geometry";

const apply = (m: Mat, x: number, y: number): [number, number] => [m[0] * x + m[1] * y, m[2] * x + m[3] * y];
const clampPx = (v: number) => Math.max(-1e5, Math.min(1e5, v));

/**
 * x values to sample on one piece of the domain: even inside the window,
 * geometric outside it (so squashing brings far-away parts in) and dense
 * near finite ends (so curves hug their asymptotes).
 */
function samples(lo: number, hi: number, inner: number, far: number): number[] {
  const a = Math.max(lo, -far);
  const b = Math.min(hi, far);
  if (a > b) return [];
  const out = new Set<number>([a, b]);
  const ia = Math.max(a, -inner);
  const ib = Math.min(b, inner);
  for (let i = 0; i <= 260 && ia < ib; i++) out.add(ia + ((ib - ia) * i) / 260);
  for (let v = inner; v < far; v *= 1.12) {
    if (v > a && v < b) out.add(v);
    if (-v > a && -v < b) out.add(-v);
  }
  for (let j = 1; j <= 34; j++) {
    const e = 2 ** -j;
    if (Number.isFinite(lo)) out.add(lo + e);
    if (Number.isFinite(hi)) out.add(hi - e);
  }
  return [...out].filter((v) => v >= a && v <= b).sort((p, q) => p - q);
}

interface CurveProps {
  spec: FnSpec;
  s: PlotScales;
  m?: Mat;
  className?: string;
  /** How far beyond the window to sample (large when squashing). */
  far?: number;
  dots?: boolean;
  asymptotes?: boolean;
  dashed?: boolean;
  opacity?: number;
}

/** The graph of f, piece by piece, with end dots and (optionally) asymptotes. */
export function FnCurve({ spec, s, m = IDENTITY, className = "fn-truth", far = 9, dots = true, asymptotes = false, dashed, opacity }: CurveProps) {
  const inner = Math.max(Math.abs(s.view.x[0]), Math.abs(s.view.x[1])) + 1;
  const paths = domainOf(spec).map((piece) => {
    const pts: string[] = [];
    for (const x of samples(piece.lo, piece.hi, inner, Math.max(far, inner))) {
      const y = evaluate(spec, x);
      if (!Number.isFinite(y)) continue;
      const [px, py] = apply(m, x, Math.max(-1e6, Math.min(1e6, y)));
      pts.push(`${clampPx(s.x(px)).toFixed(2)},${clampPx(s.y(py)).toFixed(2)}`);
    }
    return pts.length > 1 ? `M${pts.join("L")}` : "";
  });
  const v = asymptotes ? verticalAsymptote(spec) : null;
  const h = asymptotes ? horizontalAsymptote(spec) : null;
  const line = (x1: number, y1: number, x2: number, y2: number) => {
    const [a, b] = apply(m, x1, y1);
    const [c, d] = apply(m, x2, y2);
    return { x1: clampPx(s.x(a)), y1: clampPx(s.y(b)), x2: clampPx(s.x(c)), y2: clampPx(s.y(d)) };
  };
  return (
    <g className={`fn-curve ${className}${dashed ? " is-dashed" : ""}`} clipPath={s.clip} style={opacity === undefined ? undefined : { opacity }}>
      {v !== null && <line className="fn-asymptote" {...line(v, -100, v, 100)} />}
      {h !== null && <line className="fn-asymptote" {...line(-100, h, 100, h)} />}
      {paths.map((d, i) => d && <path key={i} d={d} className="fn-line" />)}
      {dots &&
        endpoints(spec).map((p, i) => {
          const [px, py] = apply(m, p.x, p.y);
          return <circle key={i} cx={s.x(px)} cy={s.y(py)} r={s.compact ? 3.5 : 5.5} className={p.closed ? "fn-dot" : "fn-dot is-open"} />;
        })}
    </g>
  );
}

interface SetProps {
  set: IntervalSet;
  axis: "x" | "y";
  s: PlotScales;
  className?: string;
  /** Draw filled and hollow end markers. */
  markers?: boolean;
  opacity?: number;
}

/** A set of numbers painted on one axis: the shadow left after squashing. */
export function SetOnAxis({ set, axis, s, className = "fn-shadow", markers = true, opacity = 1 }: SetProps) {
  const [vmin, vmax] = axis === "x" ? s.view.x : s.view.y;
  const pos = (v: number) => {
    const c = Math.max(vmin - 0.4, Math.min(vmax + 0.4, v));
    return axis === "x" ? { x: s.x(c), y: s.y(0) } : { x: s.x(0), y: s.y(c) };
  };
  const pieces = normalize(set);
  const gaps = holes(pieces).filter((v) => v >= vmin && v <= vmax);
  return (
    <g className={`fn-set ${className}`} style={{ opacity }} clipPath={s.clip}>
      {pieces.map((p, i) => {
        const a = pos(p.lo);
        const b = pos(p.hi);
        return p.lo === p.hi ? (
          <circle key={i} cx={a.x} cy={a.y} r={7} className="fn-set-point" />
        ) : (
          <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="fn-set-band" />
        );
      })}
      {markers &&
        pieces.flatMap((p, i) =>
          [
            { v: p.lo, closed: p.loClosed },
            { v: p.hi, closed: p.hiClosed },
          ]
            .filter((e) => Number.isFinite(e.v) && e.v >= vmin && e.v <= vmax && p.lo !== p.hi)
            .map((e, j) => {
              const c = pos(e.v);
              return <circle key={`${i}-${j}`} cx={c.x} cy={c.y} r={6} className={e.closed ? "fn-dot" : "fn-dot is-open"} />;
            }),
        )}
      {/* Holes like the 0 in ℝ − {0} always show, even without end markers. */}
      {!markers &&
        gaps.map((v) => {
          const c = pos(v);
          return <circle key={`gap${v}`} cx={c.x} cy={c.y} r={6} className="fn-dot is-open fn-hole" />;
        })}
    </g>
  );
}

/** A dot in math coordinates. */
export function Dot({ x, y, s, className = "fn-dot", r = 6 }: { x: number; y: number; s: PlotScales; className?: string; r?: number }) {
  return <circle cx={s.x(x)} cy={s.y(y)} r={r} className={className} />;
}
