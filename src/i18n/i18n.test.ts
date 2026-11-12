import { describe, expect, it } from "vitest";
import { createFmt, detectLocale, LOCALES, translate, type Msg } from "../core/i18n";
import { Rng } from "../core/random";
import { lessons, lessonSummaryId, lessonTitleId } from "../content/lessons";
import { exerciseTypes } from "../exercises/registry";
import { DISTRIBUTIONS } from "../distributions";
import { loadSettings, resolveTheme } from "../settings/model";
import { buildCatalogs } from "./catalog";

const catalogs = buildCatalogs();

describe("catalogs", () => {
  it("have the same keys in every language", () => {
    expect(Object.keys(catalogs.en).sort()).toEqual(Object.keys(catalogs.es).sort());
  });

  it("translate every message every lesson step can produce", () => {
    const seen: Msg[] = [];
    const steps = lessons.flatMap((l) => l.steps);
    const unique = [...new Map(steps.map((st) => [JSON.stringify(st), st])).values()];
    for (const step of unique) {
      const type = exerciseTypes[step.type];
      const answersFor = SAMPLE_ANSWERS[step.type];
      expect(answersFor, `no sample answers for ${step.type}`).toBeDefined();
      for (let seed = 1; seed < 25; seed++) {
        const p = type.generate(new Rng(seed * 7919), step.difficulty, step.config);
        seen.push(type.prompt(p));
        for (const a of answersFor(p)) seen.push(...feedbackMsgs(type.check(p, a)));
      }
    }
    for (const lesson of lessons) seen.push({ id: lessonTitleId(lesson) }, { id: lessonSummaryId(lesson) });
    for (const locale of LOCALES) {
      for (const m of seen) {
        const text = translate(catalogs, locale, m);
        expect(text, `${locale}: ${m.id}`).not.toBe(m.id);
        expect(text, `${locale}: ${m.id}`).not.toMatch(/undefined|NaN/);
      }
    }
  });

  it("has every library text the views look up", () => {
    for (const locale of LOCALES) {
      for (const d of DISTRIBUTIONS) {
        for (const id of [`dist.${d.id}.name`, ...d.params.map((p) => `dist.${d.id}.param.${p.key}.role`)]) {
          expect(catalogs[locale][id], id).toBeDefined();
        }
      }
    }
  });
});

// oxlint-disable-next-line typescript/no-explicit-any
const SAMPLE_ANSWERS: Record<string, (p: any) => unknown[]> = {
  "fit-normal": (p) => [p.target, { mu: 0, sigma: 1 }, { mu: p.target.mu, sigma: 3 }],
  "guess-distribution": (p) => p.options,
  "drag-mean": (p) => [p.stats.mean, p.stats.median, p.domain[0]],
  "fit-params": (p) => [p.target, p.start],
  "pick-curve": () => [0, 1, 2, 3],
  "match-pairs": (p) => [p.items.map((_: unknown, i: number) => p.right.indexOf(i)), [0, 1, 2, 3], [3, 2, 1, 0]],
  "param-quiz": (p) => p.options,
  "true-false": () => ["true", "false"],
  "classify-function": (p) => p.options,
  "pick-graph": () => [0, 1, 2, 3],
  "fit-transform": (p) => [
    { a: p.target.a, h: p.target.h, k: p.target.k },
    { a: 1, h: 0, k: 0 },
    { a: 0, h: 0, k: 0 },
    { a: -p.target.a, h: p.target.h + 1, k: p.target.k - 1 },
    { a: p.target.a * 2, h: p.target.h, k: p.target.k },
  ],
  "squash-range": () => LINES,
  "squash-domain": () => LINES,
  "interval-quiz": () => [0, 1, 2, 3],
  "evaluate-graph": (p) =>
    p.variant === "value"
      ? [
          { point: { x: p.x0, y: p.c }, xs: [], none: false },
          { point: { x: p.x0 + 1, y: p.c }, xs: [], none: false },
          { point: { x: p.x0, y: p.c + 1 }, xs: [], none: false },
        ]
      : [
          { point: null, xs: p.solutions, none: false },
          { point: null, xs: [5], none: false },
          { point: null, xs: [], none: true },
        ],
  injectivity: () => ["bijective", "injective", "surjective", "neither"],
  inverse: () => [0, 1, 2, 3],
  composition: () => [0, 1, 2, 3],
};

const LINES = [
  { lo: -1, hi: 2, loClosed: true, hiClosed: true, hole: null },
  { lo: -Infinity, hi: Infinity, loClosed: false, hiClosed: false, hole: 0 },
  { lo: 2, hi: 2, loClosed: true, hiClosed: true, hole: null },
];

function feedbackMsgs(f: { headline: Msg; explanation: Msg[] }): Msg[] {
  return [f.headline, ...f.explanation];
}

describe("formatting", () => {
  it("uses a decimal comma in Spanish and a point in English", () => {
    expect(createFmt("es").num(1.25, 2)).toBe("1,25");
    expect(createFmt("en").num(1.25, 2)).toBe("1.25");
    expect(createFmt("es").tex(0.5)).toBe("0{,}5");
    expect(createFmt("en").num(-0.01)).toBe("0.0");
  });
});

describe("settings", () => {
  it("detects the language and falls back to Spanish", () => {
    expect(detectLocale(["en-US", "es"])).toBe("en");
    expect(detectLocale(["es-AR"])).toBe("es");
    expect(detectLocale(["fr-FR"])).toBe("es");
  });

  it("ignores invalid saved values", () => {
    const storage = { getItem: () => JSON.stringify({ locale: "de", theme: "neon" }) };
    expect(loadSettings(storage, ["en-GB"])).toEqual({ locale: "en", theme: "system" });
  });

  it("resolves the system theme", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("light", true)).toBe("light");
  });
});
