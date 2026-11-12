/**
 * Sets of real numbers as sorted, disjoint intervals with open or closed
 * ends: enough to write any domain or range met in a first calculus course,
 * like [0, +∞), ℝ − {2} or {3}. Infinite ends are always open.
 */
export interface Interval {
  lo: number;
  hi: number;
  loClosed: boolean;
  hiClosed: boolean;
}

export type IntervalSet = Interval[];

export function interval(lo: number, hi: number, loClosed = false, hiClosed = false): Interval {
  return { lo, hi, loClosed: loClosed && Number.isFinite(lo), hiClosed: hiClosed && Number.isFinite(hi) };
}

export const REALS: IntervalSet = [interval(-Infinity, Infinity)];
export const EMPTY: IntervalSet = [];
export const point = (v: number): IntervalSet => [interval(v, v, true, true)];

const isEmpty = (i: Interval) => i.lo > i.hi || (i.lo === i.hi && !(i.loClosed && i.hiClosed));

/** Sort, drop empty pieces and merge pieces that overlap or touch. */
export function normalize(set: IntervalSet): IntervalSet {
  const sorted = set
    .filter((i) => !isEmpty(i))
    .map((i) => interval(i.lo, i.hi, i.loClosed, i.hiClosed))
    .sort((a, b) => a.lo - b.lo || Number(b.loClosed) - Number(a.loClosed));
  const out: Interval[] = [];
  for (const i of sorted) {
    const last = out[out.length - 1];
    const touches = last && (i.lo < last.hi || (i.lo === last.hi && (i.loClosed || last.hiClosed)));
    if (!touches) {
      out.push({ ...i });
      continue;
    }
    if (i.hi > last.hi) {
      last.hi = i.hi;
      last.hiClosed = i.hiClosed;
    } else if (i.hi === last.hi) last.hiClosed ||= i.hiClosed;
    if (i.lo === last.lo) last.loClosed ||= i.loClosed;
  }
  return out;
}

export function contains(set: IntervalSet, x: number): boolean {
  return set.some(
    (i) => (x > i.lo || (x === i.lo && i.loClosed)) && (x < i.hi || (x === i.hi && i.hiClosed)),
  );
}

export function equalSets(a: IntervalSet, b: IntervalSet): boolean {
  const na = normalize(a);
  const nb = normalize(b);
  return (
    na.length === nb.length &&
    na.every((i, k) => {
      const j = nb[k];
      return i.lo === j.lo && i.hi === j.hi && i.loClosed === j.loClosed && i.hiClosed === j.hiClosed;
    })
  );
}

export function intersect(a: IntervalSet, b: IntervalSet): IntervalSet {
  const out: Interval[] = [];
  for (const i of a)
    for (const j of b) {
      const lo = Math.max(i.lo, j.lo);
      const hi = Math.min(i.hi, j.hi);
      const loClosed = (i.lo === lo ? i.loClosed : true) && (j.lo === lo ? j.loClosed : true);
      const hiClosed = (i.hi === hi ? i.hiClosed : true) && (j.hi === hi ? j.hiClosed : true);
      out.push(interval(lo, hi, loClosed, hiClosed));
    }
  return normalize(out);
}

/** Remove one point: [0, 4] − {2} = [0, 2) ∪ (2, 4]. */
export function without(set: IntervalSet, v: number): IntervalSet {
  return normalize(
    set.flatMap((i) =>
      contains([i], v) ? [interval(i.lo, v, i.loClosed, false), interval(v, i.hi, false, i.hiClosed)] : [i],
    ),
  );
}

/** {s·y + t : y ∈ set}. A negative s flips the pieces. */
export function affine(set: IntervalSet, s: number, t: number): IntervalSet {
  if (s === 0) return set.length ? point(t) : EMPTY;
  return normalize(
    set.map((i) => {
      const a = s * i.lo + t;
      const b = s * i.hi + t;
      return s > 0 ? interval(a, b, i.loClosed, i.hiClosed) : interval(b, a, i.hiClosed, i.loClosed);
    }),
  );
}

/** Points the set skips inside its span, like the 0 in ℝ − {0}. */
export function holes(set: IntervalSet): number[] {
  const n = normalize(set);
  const out: number[] = [];
  for (let k = 1; k < n.length; k++) if (n[k - 1].hi === n[k].lo) out.push(n[k].lo);
  return out;
}

/** Finite ends of the pieces, with whether each one is included. */
export function ends(set: IntervalSet): { at: number; closed: boolean }[] {
  const out = new Map<number, boolean>();
  for (const i of normalize(set)) {
    if (Number.isFinite(i.lo)) out.set(i.lo, (out.get(i.lo) ?? false) || i.loClosed);
    if (Number.isFinite(i.hi)) out.set(i.hi, (out.get(i.hi) ?? false) || i.hiClosed);
  }
  return [...out].map(([at, closed]) => ({ at, closed }));
}

type NumTex = (v: number) => string;

const endTex = (v: number, num: NumTex) => (v === Infinity ? "+\\infty" : v === -Infinity ? "-\\infty" : num(v));

/**
 * TeX in the notation used in class: ℝ, ℝ − {2}, {3}, [0, +∞), (−∞, 1) ∪ (1, +∞).
 * With a decimal comma the separator becomes a semicolon, so [0,5; 2] stays readable.
 */
export function setTex(set: IntervalSet, num: NumTex): string {
  const n = normalize(set);
  if (!n.length) return "\\varnothing";
  const gaps = holes(n);
  if (n[0].lo === -Infinity && n[n.length - 1].hi === Infinity && gaps.length === n.length - 1) {
    return gaps.length ? `\\mathbb{R}-\\{${gaps.map(num).join(";\\,")}\\}` : "\\mathbb{R}";
  }
  const sep = n.some((i) => num(i.lo).includes("{,}") || num(i.hi).includes("{,}")) ? ";\\," : ",\\,";
  return n
    .map((i) =>
      i.lo === i.hi
        ? `\\{${num(i.lo)}\\}`
        : `${i.loClosed ? "[" : "("}${endTex(i.lo, num)}${sep}${endTex(i.hi, num)}${i.hiClosed ? "]" : ")"}`,
    )
    .join("\\cup ");
}

/** Everything in `a` that isn't in `b`. */
export function minus(a: IntervalSet, b: IntervalSet): IntervalSet {
  const nb = normalize(b);
  const complement: Interval[] = [];
  let lo = -Infinity;
  let loClosed = false;
  for (const i of nb) {
    complement.push(interval(lo, i.lo, loClosed, !i.loClosed));
    lo = i.hi;
    loClosed = !i.hiClosed;
  }
  complement.push(interval(lo, Infinity, loClosed, false));
  return intersect(a, normalize(complement));
}

/** Compact text form, so a set fits in a message value: "[0;inf)|(-inf;-2)". */
export function encodeSet(set: IntervalSet): string {
  const n = (v: number) => (v === Infinity ? "inf" : v === -Infinity ? "-inf" : String(v));
  return normalize(set)
    .map((i) => `${i.loClosed ? "[" : "("}${n(i.lo)};${n(i.hi)}${i.hiClosed ? "]" : ")"}`)
    .join("|");
}

export function decodeSet(text: string): IntervalSet {
  if (!text) return [];
  const n = (v: string) => (v === "inf" ? Infinity : v === "-inf" ? -Infinity : Number(v));
  return text.split("|").map((part) => {
    const [lo, hi] = part.slice(1, -1).split(";");
    return interval(n(lo), n(hi), part[0] === "[", part[part.length - 1] === "]");
  });
}
