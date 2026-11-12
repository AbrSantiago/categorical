import type { Rng } from "../core/random";
import { baseLimit, FAMILIES, type FamilyId } from "./families";
import { affine, contains, interval, intersect, normalize, point, type Interval, type IntervalSet } from "./intervals";

export * from "./families";
export * from "./intervals";

/**
 * f(x) = a·g(x − h) + k for a parent g, optionally restricted to a smaller
 * domain. Linear functions use h = 0, so a is the slope and k the intercept;
 * constants use a = 1, h = 0, so the value is k.
 */
export interface FnSpec {
  family: FamilyId;
  a: number;
  h: number;
  k: number;
  restrict?: IntervalSet;
}

/** The square window every function exercise draws in. */
export const VIEW = { x: [-6, 6] as [number, number], y: [-6, 6] as [number, number] };

const def = (s: FnSpec) => FAMILIES[s.family];

export function evaluate(s: FnSpec, x: number): number {
  if (!contains(domainOf(s), x)) return NaN;
  return s.a * def(s).base(x - s.h) + s.k;
}

export function naturalDomain(s: FnSpec): IntervalSet {
  return affine(def(s).domain, 1, s.h);
}

export function domainOf(s: FnSpec): IntervalSet {
  return s.restrict ? intersect(naturalDomain(s), s.restrict) : naturalDomain(s);
}

/** Limit of f at x from one side; x may be ±∞. */
export function limitAt(s: FnSpec, x: number, side: -1 | 1): number {
  return s.a * baseLimit(def(s), x - s.h, side) + s.k;
}

/** Domain pieces split at vertices, so f is monotone on each one. */
function monotonePieces(s: FnSpec): Interval[] {
  const cuts = def(s).breaks.map((b) => b + s.h);
  return domainOf(s).flatMap((piece) => {
    let pieces = [piece];
    for (const c of cuts) {
      pieces = pieces.flatMap((p) =>
        c > p.lo && c < p.hi ? [interval(p.lo, c, p.loClosed, true), interval(c, p.hi, true, p.hiClosed)] : [p],
      );
    }
    return pieces;
  });
}

function pieceImage(s: FnSpec, p: Interval): Interval {
  if (p.lo === p.hi) {
    const v = evaluate(s, p.lo);
    return interval(v, v, true, true);
  }
  const va = limitAt(s, p.lo, 1);
  const vb = limitAt(s, p.hi, -1);
  // f is strictly monotone on the piece: an end value is reached only if the end is included.
  return va <= vb ? interval(va, vb, p.loClosed, p.hiClosed) : interval(vb, va, p.hiClosed, p.loClosed);
}

/** The exact range, worked out from the limits at the ends of each monotone piece. */
export function imageOf(s: FnSpec): IntervalSet {
  if (s.family === "constant") return domainOf(s).length ? point(s.k) : [];
  return normalize(monotonePieces(s).map((p) => pieceImage(s, p)));
}

/** Injective on its (possibly restricted) domain. */
export function isInjective(s: FnSpec): boolean {
  if (s.family === "constant") {
    const d = domainOf(s);
    return d.length === 1 && d[0].lo === d[0].hi;
  }
  const pieces = monotonePieces(s);
  for (let i = 0; i < pieces.length; i++)
    for (let j = i + 1; j < pieces.length; j++) {
      const shared = intersect([pieceImage(s, pieces[i])], [pieceImage(s, pieces[j])]);
      if (!shared.length) continue;
      // Neighbors that share an end x = c only meet at f(c): fine.
      const c = pieces[i].hi;
      const touching = c === pieces[j].lo && shared.length === 1 && shared[0].lo === shared[0].hi && shared[0].lo === evaluate(s, c);
      if (!touching) return false;
    }
  return true;
}

/** Every x in the domain with f(x) = y; null when there are infinitely many (constants). */
export function solve(s: FnSpec, y: number): number[] | null {
  if (s.family === "constant") return y === s.k ? null : [];
  const d = domainOf(s);
  const xs = def(s)
    .solve((y - s.k) / s.a)
    .map((t) => clean(t + s.h))
    .filter((x) => contains(d, x));
  return [...new Set(xs)].sort((p, q) => p - q);
}

/** Round away float noise (1.9999999 → 2) so exact answers stay exact. */
export const clean = (v: number) => (Math.abs(v - Math.round(v)) < 1e-9 ? Math.round(v) + 0 : v);

export function verticalAsymptote(s: FnSpec): number | null {
  return def(s).pole === undefined ? null : def(s).pole! + s.h;
}

export function horizontalAsymptote(s: FnSpec): number | null {
  return def(s).flat === undefined ? null : s.a * def(s).flat! + s.k;
}

/** Ends of the domain with a finite value: drawn as filled (included) or hollow dots. */
export function endpoints(s: FnSpec): { x: number; y: number; closed: boolean }[] {
  const out: { x: number; y: number; closed: boolean }[] = [];
  for (const p of domainOf(s)) {
    if (Number.isFinite(p.lo)) {
      const y = limitAt(s, p.lo, 1);
      if (Number.isFinite(y)) out.push({ x: p.lo, y, closed: p.loClosed });
    }
    if (Number.isFinite(p.hi) && p.hi !== p.lo) {
      const y = limitAt(s, p.hi, -1);
      if (Number.isFinite(y)) out.push({ x: p.hi, y, closed: p.hiClosed });
    }
  }
  return out;
}

export function sameFunction(p: FnSpec, q: FnSpec): boolean {
  if (p.family === "constant" || q.family === "constant") return p.family === q.family && p.k === q.k;
  return p.family === q.family && p.a === q.a && p.h === q.h && p.k === q.k;
}

/** Largest gap between two functions on the window: tells if two graphs look the same. */
export function maxGap(p: FnSpec, q: FnSpec, view = VIEW): number {
  let worst = 0;
  for (let i = 0; i <= 120; i++) {
    const x = view.x[0] + ((view.x[1] - view.x[0]) * i) / 120;
    const a = evaluate(p, x);
    const b = evaluate(q, x);
    const inA = Number.isFinite(a) && a > view.y[0] - 1 && a < view.y[1] + 1;
    const inB = Number.isFinite(b) && b > view.y[0] - 1 && b < view.y[1] + 1;
    if (inA !== inB) worst = Math.max(worst, 3);
    else if (inA) worst = Math.max(worst, Math.abs(a - b));
  }
  return worst;
}

// ------------------------------------------------------------------ TeX

export type NumTex = (v: number) => string;

const HALF: Record<string, string> = { "0.5": "\\tfrac{1}{2}", "-0.5": "-\\tfrac{1}{2}" };

/** Coefficient in front of something: 1 → "", −1 → "−", ½ → "\tfrac12". */
export function coefTex(a: number, num: NumTex): string {
  if (a === 1) return "";
  if (a === -1) return "-";
  return HALF[String(a)] ?? num(a);
}

/** x − h written the way people write it: x, x − 2, x + 3. */
export function shiftTex(h: number, num: NumTex, v = "x"): string {
  return h === 0 ? v : h > 0 ? `${v}-${num(h)}` : `${v}+${num(-h)}`;
}

/** " + k", " − k" or nothing. */
export function plusTex(k: number, num: NumTex): string {
  return k === 0 ? "" : k > 0 ? `+${num(k)}` : `-${num(-k)}`;
}

/** The right-hand side of f(x) = …, in the variable v. */
export function formulaTex(s: FnSpec, num: NumTex, v = "x"): string {
  const { a, h, k } = s;
  const A = coefTex(a, num);
  const u = shiftTex(h, num, v);
  const plus = plusTex(k, num);
  switch (s.family) {
    case "constant":
      return num(k);
    case "linear": {
      const m = a; // h is 0 for lines
      return `${coefTex(m, num)}${v}${plus}`;
    }
    case "quadratic":
      return `${A}${h === 0 ? v : `(${u})`}^2${plus}`;
    case "cubic":
      return `${A}${h === 0 ? v : `(${u})`}^3${plus}`;
    case "sqrt":
      return `${A}\\sqrt{${u}}${plus}`;
    case "abs":
      return `${A}\\lvert ${u}\\rvert${plus}`;
    case "rational": {
      const sign = a < 0 ? "-" : "";
      return `${sign}\\frac{${num(Math.abs(a))}}{${u}}${plus}`;
    }
    case "exponential":
      return `${A}${A && A !== "-" ? "\\cdot " : ""}2^{${u}}${plus}`;
    case "log":
      return `${A}\\ln(${u})${plus}`;
  }
}

// ------------------------------------------------------------- generation

const COEFS: Record<FamilyId, [number[], number[]]> = {
  // [easy, harder]
  constant: [[1], [1]],
  linear: [[1, 2, -1, 3], [1, 2, -1, -2, 0.5, -0.5, 3]],
  quadratic: [[1, -1], [1, -1, 2, -2, 0.5, -0.5]],
  cubic: [[1, -1], [1, -1, 0.5, -0.5]],
  sqrt: [[1, -1], [1, -1, 2, -2]],
  abs: [[1, -1], [1, -1, 2, -2, 0.5, -0.5]],
  rational: [[1, -1], [1, -1, 2, -2]],
  exponential: [[1, -1], [1, -1]],
  log: [[1, -1], [1, -1, 2, -2]],
};

/**
 * A random member of a family that shows its interesting part (vertex,
 * start, asymptotes) well inside the window. Shifts and coefficients are
 * small integers (or ±½), so every answer can be read off the grid.
 */
export function randomSpec(rng: Rng, family: FamilyId, hard = false): FnSpec {
  const a = rng.pick(COEFS[family][hard ? 1 : 0]);
  const span = hard ? 3 : 2;
  const shift = () => rng.int(-span, span);
  switch (family) {
    case "constant":
      return { family, a: 1, h: 0, k: rng.pick([-3, -2, -1, 1, 2, 3, 4]) };
    case "linear":
      return { family, a, h: 0, k: shift() };
    default:
      return { family, a, h: shift(), k: shift() };
  }
}


/** f⁻¹(x) in TeX for the injective families (a·g(x − h) + k undone step by step). */
export function inverseTex(s: FnSpec, num: NumTex): string {
  const { a, h, k } = s;
  const top = shiftTex(k, num); // x − k
  const plusH = plusTex(h, num);
  if (s.family === "linear") {
    // y = a x + k  →  x = (y − k) / a
    if (a === 1) return top;
    if (a === -1) return k === 0 ? "-x" : `-x${plusTex(k, num)}`;
    return `${a < 0 ? "-" : ""}\\frac{${top}}{${num(Math.abs(a))}}`;
  }
  const u = a === 1 ? top : a === -1 ? `-(${top})` : `\\frac{${top}}{${num(a)}}`;
  switch (s.family) {
    case "cubic":
      return `\\sqrt[3]{${u}}${plusH}`;
    case "sqrt":
      return `${a === 1 ? (k === 0 ? "x" : `(${top})`) : `\\left(${u}\\right)`}^2${plusH}`;
    case "rational":
      return `${a < 0 ? "-" : ""}\\frac{${num(Math.abs(a))}}{${top}}${plusH}`;
    case "exponential":
      return `\\log_2\\!\\left(${u}\\right)${plusH}`;
    case "log":
      return `e^{${u}}${plusH}`;
    default:
      return "";
  }
}
