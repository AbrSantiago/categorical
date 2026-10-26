import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { createFmt, translate, type Catalog, type Fmt, type Locale, type Msg } from "../core/i18n";
import { loadSettings, resolveTheme, saveSettings, type Settings, type ThemePreference } from "./model";

interface SettingsContextValue {
  settings: Settings;
  setLocale(locale: Locale): void;
  setTheme(theme: ThemePreference): void;
  t(message: Msg | string, values?: Msg["values"]): string;
  fmt: Fmt;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function safeStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

const darkQuery = () => window.matchMedia?.("(prefers-color-scheme: dark)");

/**
 * Run a state change inside a View Transition so the whole page cross-fades
 * (new colors, new language) instead of snapping. Browsers without the API,
 * or users who prefer reduced motion, get the plain update.
 */
function withViewTransition(update: () => void) {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (!doc.startViewTransition || reduce) {
    update();
    return;
  }
  doc.startViewTransition(() => flushSync(update));
}

export function SettingsProvider({ catalogs, children }: { catalogs: Record<Locale, Catalog>; children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => loadSettings(safeStorage(), navigator.languages));
  const [systemDark, setSystemDark] = useState(() => darkQuery()?.matches ?? false);

  useEffect(() => {
    const query = darkQuery();
    if (!query) return;
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const theme = resolveTheme(settings.theme, systemDark);
  // Layout effect: the attribute must change in the same commit as the
  // render, so the view transition captures the new colors.
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.lang = settings.locale;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#131B2C" : "#F6F8FC");
  }, [theme, settings.locale]);

  const update = useCallback((patch: Partial<Settings>) => {
    withViewTransition(() =>
      setSettings((prev) => {
        const next = { ...prev, ...patch };
        saveSettings(safeStorage(), next);
        return next;
      }),
    );
  }, []);

  const value = useMemo<SettingsContextValue>(() => {
    const { locale } = settings;
    return {
      settings,
      setLocale: (l) => update({ locale: l }),
      setTheme: (th) => update({ theme: th }),
      t: (message, values) =>
        translate(catalogs, locale, typeof message === "string" ? { id: message, values } : message),
      fmt: createFmt(locale),
    };
  }, [settings, update, catalogs]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

// oxlint-disable-next-line react/only-export-components
export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside <SettingsProvider>");
  return ctx;
}

/** Shortcut for components that only need text. */
// oxlint-disable-next-line react/only-export-components
export function useI18n() {
  const { t, fmt, settings } = useSettings();
  return { t, fmt, locale: settings.locale };
}
