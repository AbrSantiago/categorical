import type { Catalog, Fmt, Locale } from "../core/i18n";
import { LOCALES } from "../core/i18n";
import { DISTRIBUTIONS, getDist } from "./index";
import type { Params } from "./types";

/** Number for TeX with as few decimals as it needs (2 → "2", 0.5 → "0{,}5"). */
function texNum(f: Fmt, value: number): string {
  for (const d of [0, 1, 2]) {
    if (Math.abs(value - Number(value.toFixed(d))) < 1e-9) return f.tex(value, d);
  }
  return f.tex(value, 2);
}

/** "\text{Gamma}(\alpha = 2,\ \beta = 1)" in the current language. */
export function texCall(locale: Locale, f: Fmt, id: string, params?: Params): string {
  const def = getDist(id);
  const name = `\\text{${def.name[locale]}}`;
  const args = def.params.map((p) => (params ? `${p.tex} = ${texNum(f, params[p.key])}` : p.tex)).join(",\\ ");
  return `${name}(${args})`;
}

/** Message ids derived from the distribution library, so texts live in one place. */
export const distIds = {
  name: (id: string) => `dist.${id}.name`,
  article: (id: string) => `dist.${id}.article`,
  trait: (id: string) => `dist.${id}.trait`,
  use: (id: string) => `dist.${id}.use`,
  role: (id: string, key: string) => `dist.${id}.param.${key}.role`,
  effect: (id: string, key: string) => `dist.${id}.param.${key}.effect`,
  fact: (id: string, i: number) => `dist.${id}.fact.${i}`,
  factWhy: (id: string, i: number) => `dist.${id}.fact.${i}.why`,
};

function build(locale: Locale): Catalog {
  const c: Catalog = {};
  for (const d of DISTRIBUTIONS) {
    c[distIds.name(d.id)] = d.name[locale];
    c[distIds.article(d.id)] = d.article[locale];
    c[distIds.trait(d.id)] = d.trait[locale];
    c[distIds.use(d.id)] = d.use[locale];
    for (const p of d.params) {
      c[distIds.role(d.id, p.key)] = p.role[locale];
      c[distIds.effect(d.id, p.key)] = p.effect[locale];
    }
    d.facts.forEach((fact, i) => {
      c[distIds.fact(d.id, i)] = fact.text[locale];
      c[distIds.factWhy(d.id, i)] = fact.why[locale];
    });
  }
  // "Gamma(α = 2, β = 1)" as inline TeX; params arrive as extra values.
  c["dist.call"] = (v: { id: string } & Params, f: Fmt) => {
    const { id, ...params } = v;
    return `$${texCall(locale, f, id, Object.keys(params).length ? params : undefined)}$`;
  };
  return c;
}

export const distributionMessages = Object.fromEntries(LOCALES.map((l) => [l, build(l)])) as Record<Locale, Catalog>;
