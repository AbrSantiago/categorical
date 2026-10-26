import type { Catalog, Locale } from "../core/i18n";
import { LOCALES } from "../core/i18n";
import { lessonMessages } from "../content/messages";
import { distributionMessages } from "../distributions/messages";
import { exerciseTypes } from "../exercises/registry";
import { appMessages } from "./appMessages";

/** Every message the app can show, merged per locale. */
export function buildCatalogs(): Record<Locale, Catalog> {
  const sources = [appMessages, lessonMessages, distributionMessages, ...Object.values(exerciseTypes).map((type) => type.messages)];
  const out = {} as Record<Locale, Catalog>;
  for (const locale of LOCALES) {
    out[locale] = Object.assign({}, ...sources.map((s) => s[locale]));
  }
  return out;
}
