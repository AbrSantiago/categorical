import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { LINE_MAX, LINE_MIN, type LineAnswer } from "./lineAnswer";

/**
 * An interval answer marked on a number line: two ends you drag (past the
 * last tick means ±∞), each tapped to switch between included (filled) and
 * excluded (hollow), and an optional hole for sets like ℝ − {2}.
 */
const W = 360;
const H = 76;
const PAD = 22;
const SLOTS = LINE_MAX - LINE_MIN + 3; // −∞, the integers, +∞
const step = (W - 2 * PAD) / (SLOTS - 1);
const slotOf = (v: number) => (v === -Infinity ? 0 : v === Infinity ? SLOTS - 1 : v - LINE_MIN + 1);
const valueOf = (slot: number) => (slot <= 0 ? -Infinity : slot >= SLOTS - 1 ? Infinity : slot - 1 + LINE_MIN);
const px = (v: number) => PAD + slotOf(v) * step;
const Y = 34;

type Handle = "lo" | "hi" | "hole";

interface Props {
  value: LineAnswer;
  onChange(v: LineAnswer): void;
  disabled?: boolean;
  axisName: "x" | "y";
  labels: { lo: string; hi: string; hole: string; addHole: string; removeHole: string; line: string; toggle: string };
}

export function NumberLine({ value, onChange, disabled, axisName, labels }: Props) {
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<{ handle: Handle; moved: boolean; slot: number } | null>(null);
  const [active, setActive] = useState<Handle | null>(null);

  const slotAt = (clientX: number) => {
    const box = svg.current!.getBoundingClientRect();
    const x = ((clientX - box.left) / box.width) * W;
    return Math.max(0, Math.min(SLOTS - 1, Math.round((x - PAD) / step)));
  };

  const place = (handle: Handle, slot: number, v = value): LineAnswer => {
    const target = valueOf(slot);
    if (handle === "lo") {
      const lo = Math.min(target === Infinity ? LINE_MAX : target, v.hi);
      return { ...v, lo, loClosed: Number.isFinite(lo) && (Number.isFinite(v.lo) ? v.loClosed : true) };
    }
    if (handle === "hi") {
      const hi = Math.max(target === -Infinity ? LINE_MIN : target, v.lo);
      return { ...v, hi, hiClosed: Number.isFinite(hi) && (Number.isFinite(v.hi) ? v.hiClosed : true) };
    }
    if (!Number.isFinite(target)) return v;
    return { ...v, hole: target };
  };

  const toggle = (handle: Handle) => {
    if (handle === "lo" && Number.isFinite(value.lo)) onChange({ ...value, loClosed: !value.loClosed });
    if (handle === "hi" && Number.isFinite(value.hi)) onChange({ ...value, hiClosed: !value.hiClosed });
    if (handle === "hole") onChange({ ...value, hole: null });
  };

  const down = (handle: Handle) => (e: PointerEvent) => {
    if (disabled) return;
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    drag.current = { handle, moved: false, slot: slotAt(e.clientX) };
    setActive(handle);
  };
  const move = (e: PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const slot = slotAt(e.clientX);
    if (slot === d.slot) return;
    d.slot = slot;
    d.moved = true;
    onChange(place(d.handle, slot));
  };
  const up = () => {
    const d = drag.current;
    drag.current = null;
    setActive(null);
    if (d && !d.moved) toggle(d.handle);
  };
  // Tapping the bare line pulls the nearest end there.
  const tapLine = (e: PointerEvent) => {
    if (disabled) return;
    const slot = slotAt(e.clientX);
    const handle: Handle = Math.abs(slot - slotOf(value.lo)) <= Math.abs(slot - slotOf(value.hi)) ? "lo" : "hi";
    onChange(place(handle, slot));
  };
  const key = (handle: Handle) => (e: KeyboardEvent) => {
    if (disabled) return;
    const current = handle === "lo" ? value.lo : handle === "hi" ? value.hi : value.hole ?? 0;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") onChange(place(handle, slotOf(current) - 1));
    else if (e.key === "ArrowRight" || e.key === "ArrowUp") onChange(place(handle, slotOf(current) + 1));
    else if (e.key === "Enter" || e.key === " ") toggle(handle);
    else return;
    e.preventDefault();
  };

  const ticks = Array.from({ length: LINE_MAX - LINE_MIN + 1 }, (_, i) => LINE_MIN + i);
  const end = (handle: "lo" | "hi") => {
    const v = value[handle];
    const closed = handle === "lo" ? value.loClosed : value.hiClosed;
    const x = px(v);
    const infinite = !Number.isFinite(v);
    return (
      <g
        key={handle}
        className={`nl-handle${active === handle ? " is-active" : ""}`}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={labels[handle]}
        aria-valuetext={infinite ? (v > 0 ? "+∞" : "−∞") : `${v}, ${closed ? "[ ]" : "( )"}`}
        onPointerDown={down(handle)}
        onKeyDown={key(handle)}
      >
        <circle cx={x} cy={Y} r={20} className="nl-hit" />
        {infinite ? (
          <path className="nl-arrow" d={v > 0 ? `M${x - 10} ${Y - 9} L${x + 4} ${Y} L${x - 10} ${Y + 9}` : `M${x + 10} ${Y - 9} L${x - 4} ${Y} L${x + 10} ${Y + 9}`} />
        ) : (
          <circle cx={x} cy={Y} r={8} className={closed ? "nl-end" : "nl-end is-open"} />
        )}
      </g>
    );
  };

  const holeVisible = value.hole !== null && value.hole > value.lo && value.hole < value.hi;
  return (
    <div className="number-line">
      <svg
        ref={svg}
        viewBox={`0 0 ${W} ${H}`}
        className={`nl${disabled ? " is-disabled" : ""}`}
        role="group"
        aria-label={labels.line}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      >
        <rect x={0} y={Y - 18} width={W} height={36} className="nl-hit" onPointerDown={tapLine} />
        <line x1={PAD - 8} x2={W - PAD + 8} y1={Y} y2={Y} className="nl-axis" />
        {ticks.map((v) => (
          <g key={v} transform={`translate(${px(v)},${Y})`} className="nl-tick">
            <line y1={-5} y2={5} />
            {v % 2 === 0 && (
              <text y={26} textAnchor="middle">
                {v}
              </text>
            )}
          </g>
        ))}
        <text x={px(-Infinity)} y={Y + 26} textAnchor="middle" className="nl-inf">
          −∞
        </text>
        <text x={px(Infinity)} y={Y + 26} textAnchor="middle" className="nl-inf">
          +∞
        </text>
        <text x={W - 4} y={12} textAnchor="end" className="nl-name">
          {axisName}
        </text>
        {value.lo === value.hi ? null : <line x1={px(value.lo)} x2={px(value.hi)} y1={Y} y2={Y} className="nl-band" />}
        {holeVisible && (
          <g
            className={`nl-handle${active === "hole" ? " is-active" : ""}`}
            role="slider"
            tabIndex={disabled ? -1 : 0}
            aria-label={labels.hole}
            aria-valuetext={String(value.hole)}
            onPointerDown={down("hole")}
            onKeyDown={key("hole")}
          >
            <circle cx={px(value.hole!)} cy={Y} r={18} className="nl-hit" />
            <circle cx={px(value.hole!)} cy={Y} r={7} className="nl-end is-open" />
          </g>
        )}
        {end("lo")}
        {end("hi")}
      </svg>
      <div className="nl-tools">
        <span className="nl-help">{labels.toggle}</span>
        <button
          type="button"
          className="chip-button"
          disabled={disabled}
          onClick={() => {
            if (holeVisible) return onChange({ ...value, hole: null });
            const lo = Number.isFinite(value.lo) ? value.lo : LINE_MIN - 1;
            const hi = Number.isFinite(value.hi) ? value.hi : LINE_MAX + 1;
            const mid = Math.round((lo + hi) / 2);
            if (mid > value.lo && mid < value.hi) onChange({ ...value, hole: mid });
          }}
        >
          {holeVisible ? labels.removeHole : labels.addHole}
        </button>
      </div>
    </div>
  );
}
