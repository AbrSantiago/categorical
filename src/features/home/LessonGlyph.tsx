import type { Lesson } from "../../content/lessons";

/** Tiny pictogram for each lesson on the path. */
export function LessonGlyph({ glyph }: { glyph: Lesson["glyph"] }) {
  return (
    <svg viewBox="0 0 40 40" width="40" height="40" className="glyph">
      {glyph === "shapes" && (
        <>
          <rect x="7" y="22" width="6" height="11" rx="1.5" />
          <rect x="17" y="12" width="6" height="21" rx="1.5" />
          <rect x="27" y="18" width="6" height="15" rx="1.5" />
        </>
      )}
      {glyph === "bell" && <path className="glyph-line" d="M4 32 C12 32 14 9 20 9 C26 9 28 32 36 32" />}
      {glyph === "center" && (
        <>
          <path className="glyph-line" d="M5 32 C9 32 10 12 15 12 C21 12 26 30 36 32" />
          <path className="glyph-line accent" d="M18 6 V34" />
        </>
      )}
      {glyph === "discrete" && (
        <>
          <path className="glyph-line thin" d="M8 33 V22 M15 33 V12 M22 33 V17 M29 33 V26" />
          <circle cx="8" cy="22" r="2.8" />
          <circle cx="15" cy="12" r="2.8" />
          <circle cx="22" cy="17" r="2.8" />
          <circle cx="29" cy="26" r="2.8" />
        </>
      )}
      {glyph === "skew" && <path className="glyph-line" d="M4 32 C7 32 9 10 13 10 C18 10 22 28 36 31" />}
      {glyph === "tails" && (
        <>
          <path className="glyph-line" d="M3 31 C12 30 16 27 18 18 L20 7 L22 18 C24 27 28 30 37 31" />
        </>
      )}
      {glyph === "params" && (
        <text x="20" y="27" textAnchor="middle" className="glyph-text">
          λσ
        </text>
      )}
      {glyph === "sliders" && (
        <>
          <path className="glyph-line thin" d="M6 13 H34 M6 27 H34" />
          <circle cx="14" cy="13" r="4" className="glyph-knob" />
          <circle cx="26" cy="27" r="4" className="glyph-knob" />
        </>
      )}
      {glyph === "exam" && (
        <>
          <rect x="9" y="6" width="22" height="28" rx="4" className="glyph-outline" />
          <path className="glyph-line thin accent" d="M14 20 L18 24 L26 15" />
        </>
      )}
      {glyph === "mix" && (
        <>
          <rect x="7" y="7" width="26" height="26" rx="6" className="glyph-outline" />
          <circle cx="14" cy="14" r="2.6" />
          <circle cx="20" cy="20" r="2.6" />
          <circle cx="26" cy="26" r="2.6" />
        </>
      )}
    </svg>
  );
}
