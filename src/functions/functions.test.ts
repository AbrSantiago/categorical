import { describe, expect, it } from "vitest";
import { Rng } from "../core/random";
import {
  affine,
  contains,
  domainOf,
  equalSets,
  evaluate,
  FAMILY_IDS,
  formulaTex,
  imageOf,
  interval,
  intersect,
  isInjective,
  normalize,
  point,
  randomSpec,
  REALS,
  setTex,
  solve,
  without,
  type FnSpec,
} from ".";

const num = (v: number) => String(v);

describe("interval sets", () => {
  it("merge pieces that overlap or touch", () => {
    expect(normalize([interval(0, 2, true, false), interval(2, 5, true, true)])).toEqual([interval(0, 5, true, true)]);
    expect(normalize([interval(0, 2), interval(2, 5)])).toHaveLength(2); // the 2 is missing
    expect(normalize([interval(1, 3), interval(0, 4, true, true)])).toEqual([interval(0, 4, true, true)]);
    expect(normalize([interval(3, 1)])).toEqual([]);
  });

  it("intersect, remove points and transform", () => {
    expect(intersect(REALS, [interval(0, Infinity, true)])).toEqual([interval(0, Infinity, true)]);
    expect(without(REALS, 2)).toEqual([interval(-Infinity, 2), interval(2, Infinity)]);
    expect(affine([interval(0, Infinity, true)], -2, 3)).toEqual([interval(-Infinity, 3, false, true)]);
    expect(contains(without(REALS, 0), 0)).toBe(false);
  });

  it("write the notation used in class", () => {
    expect(setTex(REALS, num)).toBe("\\mathbb{R}");
    expect(setTex(without(REALS, 2), num)).toBe("\\mathbb{R}-\\{2\\}");
    expect(setTex(point(3), num)).toBe("\\{3\\}");
    expect(setTex([interval(-1, Infinity, true)], num)).toBe("[-1,\\,+\\infty)");
    expect(setTex([interval(-Infinity, 0, false, true)], num)).toBe("(-\\infty,\\,0]");
  });
});

describe("function library", () => {
  it("knows the classic domains and ranges", () => {
    const f = (family: FnSpec["family"], a = 1, h = 0, k = 0): FnSpec => ({ family, a, h, k });
    expect(setTex(domainOf(f("sqrt", 1, 2, 1)), num)).toBe("[2,\\,+\\infty)");
    expect(setTex(imageOf(f("sqrt", -1, 2, 1)), num)).toBe("(-\\infty,\\,1]");
    expect(setTex(domainOf(f("rational", 1, -1, 0)), num)).toBe("\\mathbb{R}-\\{-1\\}");
    expect(setTex(imageOf(f("rational", 2, -1, 3)), num)).toBe("\\mathbb{R}-\\{3\\}");
    expect(setTex(imageOf(f("exponential", 1, 0, -2)), num)).toBe("(-2,\\,+\\infty)");
    expect(setTex(domainOf(f("log", 1, 3, 0)), num)).toBe("(3,\\,+\\infty)");
    expect(setTex(imageOf(f("log", 1, 3, 0)), num)).toBe("\\mathbb{R}");
    expect(setTex(imageOf(f("quadratic", -2, 1, 4)), num)).toBe("(-\\infty,\\,4]");
    expect(setTex(imageOf(f("constant", 1, 0, 3)), num)).toBe("\\{3\\}");
    expect(setTex(imageOf({ ...f("quadratic"), restrict: [interval(-1, 2, true, false)] }), num)).toBe("[0,\\,4)");
  });

  it("matches sampled values for random members of every family", () => {
    const rng = new Rng(42);
    for (const family of FAMILY_IDS)
      for (let n = 0; n < 25; n++) {
        const s = randomSpec(rng, family, n % 2 === 1);
        const dom = domainOf(s);
        const img = imageOf(s);
        for (let i = 0; i <= 2000; i++) {
          const x = -10 + i * 0.01 + (i % 7 === 0 ? 0 : 1e-7);
          const y = evaluate(s, x);
          expect(Number.isFinite(y), `${family} ${JSON.stringify(s)} at ${x}`).toBe(contains(dom, x));
          if (Number.isFinite(y)) expect(contains(img, y) || Math.abs(y - Math.round(y)) < 1e-9, `${family} y=${y}`).toBe(true);
        }
        // Every value inside the range (within reach) has a preimage that maps back to it.
        for (let y = -6; y <= 6; y += 0.5) {
          const xs = solve(s, y);
          if (xs === null) continue;
          expect(xs.length > 0, `${family} ${JSON.stringify(s)} y=${y}`).toBe(contains(img, y));
          for (const x of xs) expect(evaluate(s, x)).toBeCloseTo(y, 9);
        }
      }
  });

  it("decides injectivity, including on restricted domains", () => {
    const sq: FnSpec = { family: "quadratic", a: 1, h: 1, k: 0 };
    expect(isInjective(sq)).toBe(false);
    expect(isInjective({ ...sq, restrict: [interval(1, Infinity, true)] })).toBe(true);
    expect(isInjective({ ...sq, restrict: [interval(0, Infinity, true)] })).toBe(false);
    expect(isInjective({ family: "rational", a: 1, h: 0, k: 0 })).toBe(true);
    expect(isInjective({ family: "abs", a: 2, h: 0, k: 0 })).toBe(false);
    expect(isInjective({ family: "constant", a: 1, h: 0, k: 2 })).toBe(false);
    expect(equalSets(imageOf({ ...sq, restrict: [interval(1, Infinity, true)] }), [interval(0, Infinity, true)])).toBe(true);
  });

  it("writes formulas the way they're written in class", () => {
    expect(formulaTex({ family: "quadratic", a: 1, h: 2, k: -1 }, num)).toBe("(x-2)^2-1");
    expect(formulaTex({ family: "quadratic", a: -1, h: 0, k: 3 }, num)).toBe("-x^2+3");
    expect(formulaTex({ family: "sqrt", a: 2, h: -3, k: 0 }, num)).toBe("2\\sqrt{x+3}");
    expect(formulaTex({ family: "rational", a: -2, h: 1, k: 0 }, num)).toBe("-\\frac{2}{x-1}");
    expect(formulaTex({ family: "linear", a: 0.5, h: 0, k: -2 }, num)).toBe("\\tfrac{1}{2}x-2");
    expect(formulaTex({ family: "exponential", a: 1, h: 1, k: 2 }, num)).toBe("2^{x-1}+2");
    expect(formulaTex({ family: "log", a: -1, h: 0, k: 0 }, num)).toBe("-\\ln(x)");
  });
});
