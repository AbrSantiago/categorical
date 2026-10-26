/**
 * Minimal i18n, no library.
 *
 * Pure code (exercise logic) never produces display text: it returns
 * `Msg` objects — an id plus raw values. The UI turns them into text in the
 * current language. That keeps logic testable and language-agnostic, and a
 * future backend can return the same ids.
 */
export type Locale = "es" | "en";
export const LOCALES: Locale[] = ["es", "en"];

export type MsgValue = string | number;
export interface Msg {
  id: string;
  values?: Record<string, MsgValue>;
}

export function msg(id: string, values?: Record<string, MsgValue>): Msg {
  return values ? { id, values } : { id };
}

/** Locale-aware number formatting handed to message templates. */
export interface Fmt {
  locale: Locale;
  /** 1.5 → "1,5" in Spanish, "1.5" in English. */
  num(value: number, decimals?: number): string;
  /** Same, safe inside TeX (`$...$`). */
  tex(value: number, decimals?: number): string;
}

// oxlint-disable-next-line typescript/no-explicit-any
export type Template = string | ((values: any, fmt: Fmt) => string);
export type Catalog = Record<string, Template>;

/** A catalog per locale; the English one must have exactly the Spanish keys. */
export function defineMessages<T extends Catalog>(es: T, en: { [K in keyof T]: Template }) {
  return { es, en: en as Catalog } satisfies Record<Locale, Catalog>;
}

export function createFmt(locale: Locale): Fmt {
  const num = (value: number, decimals = 1) => {
    const fixed = value.toFixed(decimals);
    const clean = Number(fixed) === 0 ? (0).toFixed(decimals) : fixed; // avoid "-0.0"
    return locale === "es" ? clean.replace(".", ",") : clean;
  };
  return {
    locale,
    num,
    tex: (value, decimals) => num(value, decimals).replace(",", "{,}"),
  };
}

export function translate(catalogs: Record<Locale, Catalog>, locale: Locale, message: Msg | string): string {
  const m = typeof message === "string" ? { id: message } : message;
  const template = catalogs[locale][m.id] ?? catalogs.es[m.id];
  if (template === undefined) return m.id;
  return typeof template === "function" ? template(m.values ?? {}, createFmt(locale)) : template;
}

export function detectLocale(languages: readonly string[] | undefined): Locale {
  for (const lang of languages ?? []) {
    if (lang.toLowerCase().startsWith("es")) return "es";
    if (lang.toLowerCase().startsWith("en")) return "en";
  }
  return "es";
}
