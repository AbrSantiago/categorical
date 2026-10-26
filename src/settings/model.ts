import { detectLocale, LOCALES, type Locale } from "../core/i18n";

export type ThemePreference = "system" | "light" | "dark";
export const THEMES: ThemePreference[] = ["system", "light", "dark"];

export interface Settings {
  locale: Locale;
  theme: ThemePreference;
}

/**
 * Settings are per device on purpose (unlike progress, which will move to a
 * backend), so they stay in localStorage. The key is also read by the small
 * inline script in index.html to apply the theme before React loads.
 */
export const SETTINGS_KEY = "categorical.settings.v1";

export function defaultSettings(languages?: readonly string[]): Settings {
  return { locale: detectLocale(languages), theme: "system" };
}

export function loadSettings(storage: Pick<Storage, "getItem"> | null, languages?: readonly string[]): Settings {
  const fallback = defaultSettings(languages);
  try {
    const raw = storage?.getItem(SETTINGS_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      locale: LOCALES.includes(parsed.locale as Locale) ? (parsed.locale as Locale) : fallback.locale,
      theme: THEMES.includes(parsed.theme as ThemePreference) ? (parsed.theme as ThemePreference) : fallback.theme,
    };
  } catch {
    return fallback;
  }
}

export function saveSettings(storage: Pick<Storage, "setItem"> | null, settings: Settings): void {
  try {
    storage?.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Blocked storage: settings last for this session only.
  }
}

export function resolveTheme(preference: ThemePreference, systemDark: boolean): "light" | "dark" {
  return preference === "system" ? (systemDark ? "dark" : "light") : preference;
}
