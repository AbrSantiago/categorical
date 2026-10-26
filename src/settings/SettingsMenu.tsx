import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { LOCALES, type Locale } from "../core/i18n";
import { Flag } from "./Flag";
import { THEMES, type ThemePreference } from "./model";
import { ThemeIcon } from "./ThemeIcon";
import { useSettings } from "./SettingsContext";

const LOCALE_NAMES: Record<Locale, string> = { es: "Español", en: "English" };

/** Gear button that opens a small panel with language and theme. */
export function SettingsMenu() {
  const { settings, setLocale, setTheme, t } = useSettings();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div className="settings" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="icon-button settings-button"
        aria-label={t("settings.open")}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <circle cx="12" cy="12" r="3.2" />
          <path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            className="settings-panel"
            role="group"
            aria-label={t("settings.title")}
            initial={reduced ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            <Segmented
              legend={t("settings.language")}
              name="locale"
              options={LOCALES.map((l) => ({ value: l, label: LOCALE_NAMES[l], lang: l, icon: <Flag locale={l} /> }))}
              value={settings.locale}
              onChange={(v) => setLocale(v as Locale)}
            />
            <Segmented
              legend={t("settings.theme")}
              name="theme"
              options={THEMES.map((th) => ({ value: th, label: t(`settings.theme.${th}`), icon: <ThemeIcon theme={th} /> }))}
              value={settings.theme}
              onChange={(v) => setTheme(v as ThemePreference)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface SegmentedProps {
  legend: string;
  name: string;
  options: { value: string; label: string; lang?: string; icon?: ReactNode }[];
  value: string;
  onChange: (value: string) => void;
}

function Segmented({ legend, name, options, value, onChange }: SegmentedProps) {
  const reduced = useReducedMotion();
  return (
    <fieldset className="segmented">
      <legend>{legend}</legend>
      <div className="segmented-options">
        {options.map((o) => {
          const checked = o.value === value;
          return (
            <label key={o.value} className={checked ? "is-checked" : undefined} lang={o.lang}>
              {/* One thumb per group; motion slides it to whichever option is checked. */}
              {checked && (
                <motion.span
                  layoutId={`segmented-thumb-${name}`}
                  className="segmented-thumb"
                  transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 38 }}
                />
              )}
              <input type="radio" name={name} value={o.value} checked={checked} onChange={() => onChange(o.value)} />
              <span className="segmented-content">
                {o.icon}
                {o.label}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
