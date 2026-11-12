import { describe, expect, it } from "vitest";
import type { Difficulty } from "../core/exercise";
import { createFmt } from "../core/i18n";
import { Rng } from "../core/random";
import { lessons } from "../content/lessons";
import { decodeSet, equalSets, FAMILY_IDS, formulaTex, inverseTex, maxGap, normalize, type IntervalSet } from "../functions";
import { texNum } from "../functions/messages";
import type { LineAnswer } from "../ui/plot/lineAnswer";
import { classifyLogic } from "./classify-function/logic";
import { compositionLogic } from "./composition/logic";
import { applyTex, productTex, X } from "./composition/ops";
import { evaluateLogic } from "./evaluate-graph/logic";
import { fitTransformLogic } from "./fit-transform/logic";
import { injectivityLogic, KINDS, kindOf } from "./injectivity/logic";
import { intervalQuizLogic } from "./interval-quiz/logic";
import { inverseLogic } from "./inverse/logic";
import { pickGraphLogic } from "./pick-graph/logic";
import { exactSet, squashDomainLogic, squashRangeLogic } from "./squash/logic";

const SEEDS = Array.from({ length: 80 }, (_, i) => i * 7919 + 3);
const DIFFICULTIES: Difficulty[] = [1, 2];
const num = texNum(createFmt("en"));

/** Every pool a function lesson uses for a given exercise type (plus no pool at all). */
function poolsFor(type: string): (string[] | undefined)[] {
  const pools = lessons.flatMap((l) => l.steps.filter((s) => s.type === type).map((s) => s.config?.pool));
  return [undefined, ...pools];
}

/** The number-line answer for a set, if the number line can express it. */
function lineFor(set: IntervalSet): LineAnswer | null {
  const n = normalize(set);
  if (n.length === 1) return { lo: n[0].lo, hi: n[0].hi, loClosed: n[0].loClosed, hiClosed: n[0].hiClosed, hole: null };
  if (n.length === 2 && n[0].hi === n[1].lo) return { lo: n[0].lo, hi: n[1].hi, loClosed: n[0].loClosed, hiClosed: n[1].hiClosed, hole: n[0].hi };
  return null;
}

describe("classify-function", () => {
  it("offers 4 distinct families including the right one", () => {
    for (const pool of poolsFor("classify-function"))
      for (const seed of SEEDS)
        for (const d of DIFFICULTIES) {
          const p = classifyLogic.generate(new Rng(seed), d, { pool });
          expect(new Set(p.options).size).toBe(4);
          expect(p.options).toContain(p.spec.family);
          expect(classifyLogic.check(p, p.spec.family).correct).toBe(true);
          expect(classifyLogic.check(p, p.options.find((o) => o !== p.spec.family)!).correct).toBe(false);
        }
  });
});

describe("pick-graph", () => {
  it("shows four graphs that look different, one of them right", () => {
    for (const pool of poolsFor("pick-graph"))
      for (const seed of SEEDS)
        for (const d of DIFFICULTIES) {
          const p = pickGraphLogic.generate(new Rng(seed), d, { pool });
          expect(p.options).toHaveLength(4);
          for (let i = 0; i < 4; i++)
            for (let j = i + 1; j < 4; j++) expect(maxGap(p.options[i], p.options[j]), JSON.stringify(p)).toBeGreaterThan(0.9);
          expect(pickGraphLogic.check(p, p.answer).correct).toBe(true);
          expect(pickGraphLogic.check(p, (p.answer + 1) % 4).correct).toBe(false);
        }
  });

  it("includes the wrong-way shift whenever there is a shift", () => {
    for (const seed of SEEDS) {
      const p = pickGraphLogic.generate(new Rng(seed), 1, { pool: ["quadratic", "abs", "sqrt"] });
      expect(p.slips).toContain("h-sign");
    }
  });
});

describe("fit-transform", () => {
  it("accepts the target and rejects the starting curve", () => {
    for (const pool of poolsFor("fit-transform"))
      for (const seed of SEEDS)
        for (const d of DIFFICULTIES) {
          const p = fitTransformLogic.generate(new Rng(seed), d, { pool });
          const { a, h, k } = p.target;
          expect(fitTransformLogic.check(p, { a, h, k }).correct).toBe(true);
          expect(fitTransformLogic.check(p, fitTransformLogic.initialAnswer(p)!).correct).toBe(false);
          expect(Math.abs(h)).toBeLessThanOrEqual(4);
          expect(Math.abs(k)).toBeLessThanOrEqual(4);
        }
  });

  it("says which way to move", () => {
    const p = { family: "quadratic" as const, target: { family: "quadratic" as const, a: 1, h: 2, k: 0 }, free: ["h", "k"] as ("h" | "k")[] };
    const fb = fitTransformLogic.check(p, { a: 1, h: -2, k: 0 });
    expect(fb.explanation[0]).toEqual({ id: "fitFn.h", values: { dir: "right", by: 4 } });
  });
});

describe("squash", () => {
  it("asks for sets the number line can express, and grades them", () => {
    for (const logic of [squashRangeLogic, squashDomainLogic])
      for (const pool of [...poolsFor("squash-range"), ...poolsFor("squash-domain")])
        for (const seed of SEEDS)
          for (const d of DIFFICULTIES) {
            const p = logic.generate(new Rng(seed), d, { pool });
            const line = lineFor(exactSet(p));
            expect(line, `${logic.id} ${JSON.stringify(p.spec)}`).not.toBeNull();
            for (const end of [line!.lo, line!.hi, line!.hole ?? 0]) if (Number.isFinite(end)) expect(Math.abs(end)).toBeLessThanOrEqual(6);
            expect(logic.check(p, line!).correct).toBe(true);
            expect(logic.check(p, logic.initialAnswer(p)!).correct).toBe(false);
          }
  });

  it("tells open from closed ends", () => {
    const p = { spec: { family: "exponential" as const, a: 1, h: 0, k: -2 }, axis: "y" as const, markers: true };
    expect(squashRangeLogic.check(p, { lo: -2, hi: Infinity, loClosed: false, hiClosed: false, hole: null }).correct).toBe(true);
    expect(squashRangeLogic.check(p, { lo: -2, hi: Infinity, loClosed: true, hiClosed: false, hole: null }).correct).toBe(false);
  });
});

describe("interval-quiz", () => {
  it("offers 4 different sets, one right", () => {
    for (const pool of poolsFor("interval-quiz"))
      for (const seed of SEEDS)
        for (const d of DIFFICULTIES) {
          const p = intervalQuizLogic.generate(new Rng(seed), d, { pool });
          const sets = p.options.map(decodeSet);
          for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) expect(equalSets(sets[i], sets[j])).toBe(false);
          expect(intervalQuizLogic.check(p, p.answer).correct).toBe(true);
          expect(intervalQuizLogic.check(p, (p.answer + 1) % 4).correct).toBe(false);
        }
  });
});

describe("evaluate-graph", () => {
  it("uses integer points inside the window", () => {
    for (const seed of SEEDS)
      for (const d of DIFFICULTIES) {
        const p = evaluateLogic.generate(new Rng(seed), d);
        if (p.variant === "value") {
          expect(evaluateLogic.check(p, { point: { x: p.x0, y: p.c }, xs: [], none: false }).correct).toBe(true);
          expect(evaluateLogic.check(p, { point: { x: p.x0, y: p.c + 1 }, xs: [], none: false }).correct).toBe(false);
        } else {
          for (const x of p.solutions) expect(Number.isInteger(x) && Math.abs(x) <= 5).toBe(true);
          const right = p.solutions.length ? { point: null, xs: p.solutions, none: false } : { point: null, xs: [], none: true };
          expect(evaluateLogic.check(p, right).correct).toBe(true);
          expect(evaluateLogic.check(p, right.none ? { point: null, xs: [1], none: false } : { point: null, xs: [], none: true }).correct).toBe(false);
        }
      }
  });
});

describe("injectivity", () => {
  it("builds every kind, and the kind matches the function", () => {
    const seen = new Set<string>();
    for (const seed of SEEDS)
      for (const d of DIFFICULTIES) {
        const p = injectivityLogic.generate(new Rng(seed), d);
        expect(kindOf(p.spec, decodeSet(p.codomain))).toBe(p.kind);
        seen.add(p.kind);
        expect(injectivityLogic.check(p, p.kind).correct).toBe(true);
        expect(injectivityLogic.check(p, KINDS.find((k) => k !== p.kind)!).correct).toBe(false);
      }
    expect(seen.size).toBe(4);
  });
});

describe("inverse", () => {
  it("has one right option and distinct formulas", () => {
    for (const seed of SEEDS)
      for (const d of DIFFICULTIES) {
        const p = inverseLogic.generate(new Rng(seed), d);
        const right =
          p.variant === "graph" ? p.options.indexOf("diagonal") : p.variant === "formula" ? p.options.indexOf("inverse") : p.options.indexOf("domain");
        expect(right).toBeGreaterThanOrEqual(0);
        expect(inverseLogic.check(p, right).correct).toBe(true);
        expect(inverseLogic.check(p, (right + 1) % 4).correct).toBe(false);
        if (p.variant === "formula") {
          const s = p.spec;
          const texts = [
            inverseTex(s, num),
            inverseTex({ ...s, h: -s.h, k: -s.k }, num),
            `\\frac{1}{${formulaTex(s, num)}}`,
            formulaTex({ ...s, a: -s.a, k: -s.k }, num),
          ];
          expect(new Set(texts).size, texts.join(" | ")).toBe(4);
        }
      }
  });

  it("writes inverses that undo f", () => {
    expect(inverseTex({ family: "linear", a: 2, h: 0, k: 3 }, num)).toBe("\\frac{x-3}{2}");
    expect(inverseTex({ family: "exponential", a: 1, h: 1, k: -2 }, num)).toBe("\\log_2\\!\\left(x+2\\right)+1");
    expect(inverseTex({ family: "sqrt", a: 1, h: -1, k: 2 }, num)).toBe("(x-2)^2-1");
  });
});

describe("composition", () => {
  it("offers four different formulas or numbers", () => {
    for (const seed of SEEDS)
      for (const d of DIFFICULTIES) {
        const p = compositionLogic.generate(new Rng(seed), d);
        const right = p.options.indexOf("fg");
        expect(compositionLogic.check(p, right).correct).toBe(true);
        expect(compositionLogic.check(p, (right + 1) % 4).correct).toBe(false);
        if (p.variant === "value") expect(new Set(p.values).size).toBe(4);
        else {
          const f = applyTex(p.f, X, num);
          const g = applyTex(p.g, X, num);
          const texts = [applyTex(p.f, g, num).tex, applyTex(p.g, f, num).tex, productTex(f, g), `${f.tex}+${g.tex}`];
          expect(new Set(texts).size, texts.join(" | ")).toBe(4);
        }
      }
  });
});

describe("families", () => {
  it("are all used somewhere", () => {
    const used = new Set(lessons.flatMap((l) => l.steps.flatMap((s) => s.config?.pool ?? [])));
    for (const f of FAMILY_IDS) expect(used.has(f), f).toBe(true);
  });
});
