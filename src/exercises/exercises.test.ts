import { describe, expect, it } from "vitest";
import type { Difficulty } from "../core/exercise";
import { Rng } from "../core/random";
import { dragMeanLogic } from "./drag-mean/logic";
import { fitNormalLogic } from "./fit-normal/logic";
import { guessDistributionLogic } from "./guess-distribution/logic";
import { conceptOf, FITTABLE_IDS, getDist } from "../distributions";
import { fitParamsLogic } from "./fit-params/logic";
import { matchPairsLogic } from "./match-pairs/logic";
import { paramQuizLogic } from "./param-quiz/logic";
import { pickCurveLogic } from "./pick-curve/logic";
import { trueFalseLogic } from "./true-false/logic";

const SEEDS = Array.from({ length: 60 }, (_, i) => i * 7919 + 1);
const DIFFICULTIES: Difficulty[] = [1, 2];

describe("fit-normal", () => {
  it("accepts the true parameters and rejects the starting curve", () => {
    for (const seed of SEEDS)
      for (const d of DIFFICULTIES) {
        const p = fitNormalLogic.generate(new Rng(seed), d);
        expect(fitNormalLogic.check(p, p.target).correct).toBe(true);
        expect(fitNormalLogic.check(p, fitNormalLogic.initialAnswer(p)!).correct).toBe(false);
      }
  });

  it("says which parameter is off", () => {
    const p = fitNormalLogic.generate(new Rng(5), 1);
    const fb = fitNormalLogic.check(p, { mu: p.target.mu + 2, sigma: p.target.sigma });
    expect(fb.correct).toBe(false);
    expect(fb.explanation[0]).toEqual({ id: "fitNormal.wrong.mu", values: { side: "right", mu: p.target.mu + 2 } });
  });

  it("only includes a sample in sample mode", () => {
    expect(fitNormalLogic.generate(new Rng(1), 1).sample).toHaveLength(0);
    expect(fitNormalLogic.generate(new Rng(1), 2).sample).toHaveLength(400);
  });
});

describe("guess-distribution", () => {
  it("offers 4 distinct options including the right one", () => {
    for (const seed of SEEDS)
      for (const d of DIFFICULTIES) {
        const p = guessDistributionLogic.generate(new Rng(seed), d);
        expect(new Set(p.options).size).toBe(4);
        expect(p.options).toContain(p.dist);
        expect(guessDistributionLogic.check(p, p.dist).correct).toBe(true);
        const wrong = p.options.find((k) => k !== p.dist)!;
        expect(guessDistributionLogic.check(p, wrong).correct).toBe(false);
      }
  });

  it("only uses the log-normal at difficulty 2", () => {
    const kinds = SEEDS.map((s) => guessDistributionLogic.generate(new Rng(s), 1).dist);
    expect(kinds).not.toContain("lognormal");
  });

  it("is reproducible from its seed", () => {
    expect(guessDistributionLogic.generate(new Rng(9), 2)).toEqual(guessDistributionLogic.generate(new Rng(9), 2));
  });

  it("only draws answers from the lesson's pool", () => {
    const pool = ["gamma", "beta", "pareto"];
    for (const seed of SEEDS) {
      const p = guessDistributionLogic.generate(new Rng(seed), 1, { pool });
      expect(pool).toContain(p.dist);
      expect(new Set(p.options).size).toBe(4);
    }
  });
});

describe("drag-mean", () => {
  it("accepts the true statistic and rejects a far guess", () => {
    for (const seed of SEEDS)
      for (const d of DIFFICULTIES) {
        const p = dragMeanLogic.generate(new Rng(seed), d);
        const truth = p.target === "mean" ? p.stats.mean : p.stats.median;
        expect(dragMeanLogic.check(p, truth).correct).toBe(true);
        expect(dragMeanLogic.check(p, truth + 3 * p.tolerance).correct).toBe(false);
        expect(truth).toBeGreaterThan(p.domain[0]);
        expect(truth).toBeLessThan(p.domain[1]);
      }
  });

  it("pulls the mean toward the long tail", () => {
    for (const seed of SEEDS) {
      const p = dragMeanLogic.generate(new Rng(seed), 1);
      if (p.shape === "right-skew") expect(p.stats.mean).toBeGreaterThan(p.stats.median);
      if (p.shape === "left-skew") expect(p.stats.mean).toBeLessThan(p.stats.median);
    }
  });
});

describe("fit-params", () => {
  it("accepts the target and rejects the starting curve, for every family", () => {
    for (const dist of FITTABLE_IDS) {
      for (const seed of SEEDS.slice(0, 15)) {
        const p = fitParamsLogic.generate(new Rng(seed), 1, { pool: [dist] });
        expect(fitParamsLogic.check(p, p.target).correct, dist).toBe(true);
        expect(fitParamsLogic.check(p, p.start).correct, dist).toBe(false);
      }
    }
  });

  it("explains invalid parameters instead of crashing", () => {
    const p = fitParamsLogic.generate(new Rng(1), 1, { pool: ["uniform"] });
    const fb = fitParamsLogic.check(p, { a: 8, b: 2 });
    expect(fb.correct).toBe(false);
    expect(fb.headline.id).toBe("fit.headline.invalid");
  });
});

describe("pick-curve", () => {
  it("has four distinct options and exactly one is the target", () => {
    for (const dist of FITTABLE_IDS) {
      for (const seed of SEEDS.slice(0, 10)) {
        const p = pickCurveLogic.generate(new Rng(seed), 1, { pool: [dist] });
        expect(p.options, dist).toHaveLength(4);
        const keys = p.options.map((o) => JSON.stringify(o));
        expect(new Set(keys).size, dist).toBe(4);
        expect(keys.filter((k) => k === JSON.stringify(p.target))).toHaveLength(1);
        expect(pickCurveLogic.check(p, p.answer).correct).toBe(true);
        expect(pickCurveLogic.check(p, (p.answer + 1) % 4).correct).toBe(false);
      }
    }
  });
});

describe("match-pairs", () => {
  it("pairs four parameters with four different meanings", () => {
    for (const seed of SEEDS) {
      const p = matchPairsLogic.generate(new Rng(seed), 1);
      expect(p.items).toHaveLength(4);
      const roles = p.items.map((it) => getDist(it.dist).params.find((q) => q.key === it.key)!.role.es);
      expect(new Set(roles).size).toBe(4);
      // No two parameters that mean the same thing (p in a binomial vs p in a geometric).
      expect(new Set(p.items.map((it) => conceptOf(it.dist, it.key))).size).toBe(4);
      const perfect = p.items.map((_, i) => p.right.indexOf(i));
      expect(matchPairsLogic.check(p, perfect).correct).toBe(true);
      const swapped = [...perfect];
      [swapped[0], swapped[1]] = [swapped[1], swapped[0]];
      const fb = matchPairsLogic.check(p, swapped);
      expect(fb.correct).toBe(false);
      expect(fb.explanation).toHaveLength(2);
    }
  });
});

describe("param-quiz", () => {
  it("always has four distinct options including the answer", () => {
    for (const seed of SEEDS) {
      const p = paramQuizLogic.generate(new Rng(seed), 1);
      expect(new Set(p.options).size).toBe(4);
      expect(p.options).toContain(p.answer);
      expect(paramQuizLogic.check(p, p.answer).correct).toBe(true);
      if (p.variant === "who-has") {
        const tex = getDist(p.dist).params.find((q) => q.key === p.key)!.tex;
        const holders = p.options.filter((id) => getDist(id).params.some((q) => q.tex === tex));
        expect(holders).toEqual([p.answer]);
      }
      if (p.variant === "meaning") {
        const concepts = p.options.map((v) => conceptOf(v.split("|")[0], v.split("|")[1]));
        expect(new Set(concepts).size).toBe(4);
      }
      if (p.variant === "params-of") {
        const sig = (id: string) => getDist(id).params.map((q) => q.tex).join();
        expect(new Set(p.options.map(sig)).size).toBe(4);
      }
    }
  });
});

describe("true-false", () => {
  it("grades by the statement's truth", () => {
    for (const seed of SEEDS) {
      const p = trueFalseLogic.generate(new Rng(seed), 1);
      expect(trueFalseLogic.check(p, p.truth ? "true" : "false").correct).toBe(true);
      expect(trueFalseLogic.check(p, p.truth ? "false" : "true").correct).toBe(false);
    }
  });
});
