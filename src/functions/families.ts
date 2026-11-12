import { interval, REALS, type IntervalSet } from "./intervals";

export type FamilyId =
  | "constant"
  | "linear"
  | "quadratic"
  | "cubic"
  | "sqrt"
  | "abs"
  | "rational"
  | "exponential"
  | "log";

/**
 * A parent function g. Every exercise works with a·g(x − h) + k, so a family
 * only has to describe g itself: its domain, where it splits into monotone
 * pieces, its limits at the edges and how to solve g(t) = u.
 */
export interface FamilyDef {
  id: FamilyId;
  /** g(t); NaN outside the domain. */
  base(t: number): number;
  domain: IntervalSet;
  /** Vertex points: g is monotone between them (poles are already gaps in the domain). */
  breaks: number[];
  /** Vertical asymptote of g, if any. */
  pole?: number;
  /** Horizontal asymptote of g, if any. */
  flat?: number;
  /** Limits of g at −∞ and +∞ (NaN where g isn't defined). */
  atInfinity: [number, number];
  /** Limits of g just left and right of the pole. */
  atPole?: [number, number];
  /** Every t with g(t) = u. */
  solve(u: number): number[];
  injective: boolean;
  /** Families that look alike, used as tempting wrong answers. */
  similar: FamilyId[];
}

const POS = [interval(0, Infinity, true)];
const POS_OPEN = [interval(0, Infinity)];
const NONZERO = [interval(-Infinity, 0), interval(0, Infinity)];

export const FAMILIES: Record<FamilyId, FamilyDef> = {
  constant: {
    id: "constant",
    base: () => 0,
    domain: REALS,
    breaks: [],
    atInfinity: [0, 0],
    solve: () => [],
    injective: false,
    similar: ["linear", "abs", "exponential"],
  },
  linear: {
    id: "linear",
    base: (t) => t,
    domain: REALS,
    breaks: [],
    atInfinity: [-Infinity, Infinity],
    solve: (u) => [u],
    injective: true,
    similar: ["constant", "cubic", "abs"],
  },
  quadratic: {
    id: "quadratic",
    base: (t) => t * t,
    domain: REALS,
    breaks: [0],
    atInfinity: [Infinity, Infinity],
    solve: (u) => (u < 0 ? [] : u === 0 ? [0] : [-Math.sqrt(u), Math.sqrt(u)]),
    injective: false,
    similar: ["abs", "cubic", "exponential"],
  },
  cubic: {
    id: "cubic",
    base: (t) => t * t * t,
    domain: REALS,
    breaks: [],
    atInfinity: [-Infinity, Infinity],
    solve: (u) => [Math.cbrt(u)],
    injective: true,
    similar: ["linear", "quadratic", "log"],
  },
  sqrt: {
    id: "sqrt",
    base: (t) => (t >= 0 ? Math.sqrt(t) : NaN),
    domain: POS,
    breaks: [],
    atInfinity: [NaN, Infinity],
    solve: (u) => (u >= 0 ? [u * u] : []),
    injective: true,
    similar: ["log", "quadratic", "exponential"],
  },
  abs: {
    id: "abs",
    base: (t) => Math.abs(t),
    domain: REALS,
    breaks: [0],
    atInfinity: [Infinity, Infinity],
    solve: (u) => (u < 0 ? [] : u === 0 ? [0] : [-u, u]),
    injective: false,
    similar: ["quadratic", "linear", "sqrt"],
  },
  rational: {
    id: "rational",
    base: (t) => (t === 0 ? NaN : 1 / t),
    domain: NONZERO,
    breaks: [],
    pole: 0,
    flat: 0,
    atInfinity: [0, 0],
    atPole: [-Infinity, Infinity],
    solve: (u) => (u === 0 ? [] : [1 / u]),
    injective: true,
    similar: ["exponential", "log", "cubic"],
  },
  exponential: {
    id: "exponential",
    base: (t) => 2 ** t,
    domain: REALS,
    breaks: [],
    flat: 0,
    atInfinity: [0, Infinity],
    solve: (u) => (u > 0 ? [Math.log2(u)] : []),
    injective: true,
    similar: ["quadratic", "rational", "sqrt"],
  },
  log: {
    id: "log",
    base: (t) => (t > 0 ? Math.log(t) : NaN),
    domain: POS_OPEN,
    breaks: [],
    pole: 0,
    atInfinity: [NaN, Infinity],
    atPole: [NaN, -Infinity],
    solve: (u) => [Math.exp(u)],
    injective: true,
    similar: ["sqrt", "exponential", "rational"],
  },
};

export const FAMILY_IDS = Object.keys(FAMILIES) as FamilyId[];

/** Limit of g at t from one side (side −1: from the left, +1: from the right). */
export function baseLimit(def: FamilyDef, t: number, side: -1 | 1): number {
  if (t === -Infinity) return def.atInfinity[0];
  if (t === Infinity) return def.atInfinity[1];
  if (def.pole !== undefined && t === def.pole && def.atPole) return def.atPole[side < 0 ? 0 : 1];
  return def.base(t);
}
