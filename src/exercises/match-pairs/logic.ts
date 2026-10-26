import type { ExerciseLogic } from "../../core/exercise";
import { msg, type Msg } from "../../core/i18n";
import { ALL_IDS, conceptOf, getDist } from "../../distributions";

/**
 * "Uní cada parámetro con su significado": four parameters on the left,
 * four meanings on the right, tap to pair them. Sometimes the same letter
 * shows up in different distributions (λ in a Poisson vs in a Weibull) to
 * make the point that a symbol means nothing without its distribution.
 */
export interface PairItem {
  dist: string;
  key: string;
}

export interface MatchPairsParams {
  items: PairItem[];
  /** Display order of the meanings: right[j] = index into `items`. */
  right: number[];
}

/** answer[i] = which right slot (0..3) the left item i is paired with, or -1. */
export type MatchAnswer = number[];

const SIZE = 4;

export const matchPairsLogic: ExerciseLogic<MatchPairsParams, MatchAnswer> = {
  id: "match-pairs",

  generate(rng, _difficulty, config) {
    const pool = config?.pool ?? ALL_IDS;
    const candidates: PairItem[] = pool.flatMap((dist) => getDist(dist).params.map((p) => ({ dist, key: p.key })));
    const roleOf = (it: PairItem) => getDist(it.dist).params.find((p) => p.key === it.key)!.role.es;
    const texOf = (it: PairItem) => getDist(it.dist).params.find((p) => p.key === it.key)!.tex;

    const chosen: PairItem[] = [];
    const add = (list: PairItem[]) => {
      for (const it of list) {
        if (chosen.length >= SIZE) return;
        const clash = chosen.some(
          (c) =>
            conceptOf(c.dist, c.key) === conceptOf(it.dist, it.key) ||
            roleOf(c) === roleOf(it) ||
            (texOf(c) === texOf(it) && c.dist === it.dist),
        );
        if (!clash) chosen.push(it);
      }
    };

    // Half of the time, seed with one letter shared by several distributions.
    const bySymbol = new Map<string, PairItem[]>();
    for (const it of candidates) bySymbol.set(texOf(it), [...(bySymbol.get(texOf(it)) ?? []), it]);
    // Only letters whose meanings really differ (λ: rate in a Poisson, scale in a Weibull).
    const shared = [...bySymbol.values()]
      .map((list) => [...new Map(list.map((it) => [conceptOf(it.dist, it.key), it])).values()])
      .filter((list) => list.length >= 2);
    if (shared.length && rng.next() < 0.5) add(rng.shuffle(rng.pick(shared)).slice(0, 2));
    add(rng.shuffle(candidates));

    const items = rng.shuffle(chosen);
    return { items, right: rng.shuffle(items.map((_, i) => i)) };
  },

  initialAnswer(params) {
    return params.items.map(() => -1);
  },

  check(params, answer) {
    const wrong = params.items.filter((_, i) => params.right[answer[i]] !== i);
    const explanation: Msg[] = wrong.length
      ? wrong.map((it) => msg("match.fix", { dist: it.dist, key: it.key }))
      : [msg("match.right.why")];
    return {
      correct: wrong.length === 0,
      headline: wrong.length === 0 ? msg("match.headline.right") : msg("match.headline.wrong", { n: wrong.length }),
      explanation,
    };
  },
};

export function isComplete(answer: MatchAnswer | null): boolean {
  return !!answer && answer.every((j) => j >= 0);
}
