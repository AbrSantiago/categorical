import type { AreaId } from "../../content/lessons";

/** Small icon per subject: a histogram for statistics, a curve on axes for functions. */
export function AreaIcon({ area }: { area: AreaId }) {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" className="area-icon">
      {area === "stats" ? (
        <>
          <rect x="3" y="11" width="3.2" height="6" rx="0.8" />
          <rect x="8.4" y="5" width="3.2" height="12" rx="0.8" />
          <rect x="13.8" y="8.5" width="3.2" height="8.5" rx="0.8" />
        </>
      ) : (
        <>
          <path className="area-icon-axis" d="M2.5 15.5 H17.5 M5 18 V2.5" />
          <path className="area-icon-curve" d="M3 4 C6 16, 9 16, 11 11 S15 3, 18 3" />
        </>
      )}
    </svg>
  );
}
