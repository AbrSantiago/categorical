import type { ThemePreference } from "./model";

/** Line icons for the theme options; they take the label's text color. */
export function ThemeIcon({ theme }: { theme: ThemePreference }) {
  return (
    <svg className="option-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      {theme === "light" && (
        <>
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
        </>
      )}
      {theme === "dark" && <path d="M20 14.6A8.3 8.3 0 0 1 9.4 4a8.3 8.3 0 1 0 10.6 10.6Z" />}
      {theme === "system" && (
        <>
          <rect x="3" y="4.5" width="18" height="12" rx="2" />
          <path d="M8.5 20h7M12 16.5V20" />
          {/* half-filled screen: follows light or dark */}
          <path className="option-icon-fill" d="M12 6.5h7v8h-7Z" />
        </>
      )}
    </svg>
  );
}
