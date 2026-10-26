import type { ExerciseLogic } from "../../core/exercise";
import { msg, type Msg } from "../../core/i18n";
import type { Rng } from "../../core/random";
import { ALL_IDS, conceptOf, getDist } from "../../distributions";

/**
 * Multiple choice about parameters, in four flavors:
 * - params-of: which parameters define this distribution?
 * - who-has:   which of these distributions has a parameter λ?
 * - meaning:   what does λ represent in this distribution?
 * - mean:      what is the mean of this distribution?
 */
export type QuizVariant = "params-of" | "who-has" | "meaning" | "mean";

export interface ParamQuizParams {
  variant: QuizVariant;
  dist: string;
  /** For "who-has" and "meaning": the parameter asked about. */
  key?: string;
  /** Option values; how to display them depends on the variant. */
  options: string[];
  answer: string;
}

const signature = (id: string) => getDist(id).params.map((p) => p.tex).join(",");

function paramsOf(rng: Rng, pool: string[]): ParamQuizParams | null {
  const dist = rng.pick(pool);
  const others = rng.shuffle(ALL_IDS.filter((id) => signature(id) !== signature(dist)));
  const seen = new Set([signature(dist)]);
  const wrong: string[] = [];
  for (const id of others) {
    if (wrong.length === 3) break;
    if (seen.has(signature(id))) continue;
    seen.add(signature(id));
    wrong.push(id);
  }
  // Options are distribution ids; the view shows their parameter list.
  return { variant: "params-of", dist, options: rng.shuffle([dist, ...wrong]), answer: dist };
}

function whoHas(rng: Rng, pool: string[]): ParamQuizParams | null {
  const dist = rng.pick(pool);
  const param = rng.pick(getDist(dist).params);
  const has = (id: string) => getDist(id).params.some((p) => p.tex === param.tex);
  const wrong = rng.shuffle(ALL_IDS.filter((id) => !has(id))).slice(0, 3);
  if (wrong.length < 3) return null;
  return { variant: "who-has", dist, key: param.key, options: rng.shuffle([dist, ...wrong]), answer: dist };
}

function meaning(rng: Rng, pool: string[]): ParamQuizParams | null {
  const dist = rng.pick(pool);
  const param = rng.pick(getDist(dist).params);
  const right = `${dist}|${param.key}`;
  const roleOf = (v: string) => {
    const [d, k] = v.split("|");
    return getDist(d).params.find((p) => p.key === k)!.role.es;
  };
  // Prefer meanings of the same letter elsewhere: the most instructive mistakes.
  const all = ALL_IDS.flatMap((d) => getDist(d).params.map((p) => `${d}|${p.key}`)).filter((v) => v !== right);
  const sameLetter = all.filter((v) => getDist(v.split("|")[0]).params.find((p) => p.key === v.split("|")[1])!.tex === param.tex);
  // Wrong options must mean something different, not just be worded differently.
  const conceptOfValue = (v: string) => conceptOf(v.split("|")[0], v.split("|")[1]);
  const wrong: string[] = [];
  const used = new Set([roleOf(right)]);
  const usedConcepts = new Set([conceptOfValue(right)]);
  for (const v of [...rng.shuffle(sameLetter), ...rng.shuffle(all)]) {
    if (wrong.length === 3) break;
    if (used.has(roleOf(v)) || usedConcepts.has(conceptOfValue(v))) continue;
    used.add(roleOf(v));
    usedConcepts.add(conceptOfValue(v));
    wrong.push(v);
  }
  return { variant: "meaning", dist, key: param.key, options: rng.shuffle([right, ...wrong]), answer: right };
}

function mean(rng: Rng, pool: string[]): ParamQuizParams | null {
  const candidates = pool.filter((id) => getDist(id).mean);
  if (!candidates.length) return null;
  const dist = rng.pick(candidates);
  const { right, wrong } = getDist(dist).mean!;
  return { variant: "mean", dist, options: rng.shuffle([right, ...wrong.slice(0, 3)]), answer: right };
}

const MAKERS: Record<QuizVariant, (rng: Rng, pool: string[]) => ParamQuizParams | null> = {
  "params-of": paramsOf,
  "who-has": whoHas,
  meaning,
  mean,
};

export const paramQuizLogic: ExerciseLogic<ParamQuizParams, string> = {
  id: "param-quiz",

  generate(rng, _difficulty, config) {
    const pool = config?.pool ?? ALL_IDS;
    for (let tries = 0; tries < 20; tries++) {
      const variant = rng.pick(Object.keys(MAKERS) as QuizVariant[]);
      const params = MAKERS[variant](rng, pool);
      if (params) return params;
    }
    return paramsOf(rng, pool)!;
  },

  initialAnswer() {
    return null;
  },

  check(params, answer) {
    const correct = answer === params.answer;
    const { dist, key } = params;
    const explanation: Msg[] = [];
    switch (params.variant) {
      case "params-of":
        explanation.push(msg("quiz.explain.params", { dist }));
        if (!correct) explanation.push(msg("quiz.explain.params", { dist: answer }));
        break;
      case "who-has":
        explanation.push(msg("quiz.explain.who", { dist, key: key! }));
        if (!correct) explanation.push(msg("quiz.explain.params", { dist: answer }));
        break;
      case "meaning":
        explanation.push(msg("quiz.explain.meaning", { dist, key: key! }));
        if (!correct) {
          const [d, k] = answer.split("|");
          explanation.push(msg("quiz.explain.other", { dist: d, key: k }));
        }
        break;
      case "mean":
        explanation.push(msg("quiz.explain.mean", { dist }));
        break;
    }
    return { correct, headline: msg(correct ? "quiz.right" : "quiz.wrong"), explanation };
  },
};
