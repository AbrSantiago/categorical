import { interval, normalize, without, type IntervalSet } from "../../functions";

/**
 * An interval answer marked on a number line: two ends (±∞ past the last
 * tick), each included or not, and an optional hole for sets like ℝ − {2}.
 */
export interface LineAnswer {
  lo: number;
  hi: number;
  loClosed: boolean;
  hiClosed: boolean;
  hole: number | null;
}

export const LINE_MIN = -6;
export const LINE_MAX = 6;

export function lineToSet(a: LineAnswer): IntervalSet {
  const base = normalize([interval(a.lo, a.hi, a.loClosed, a.hiClosed)]);
  return a.hole !== null && a.hole > a.lo && a.hole < a.hi ? without(base, a.hole) : base;
}

export const INITIAL_LINE: LineAnswer = { lo: -1, hi: 2, loClosed: true, hiClosed: true, hole: null };

