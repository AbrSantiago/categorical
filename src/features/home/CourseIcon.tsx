import type { CourseId } from "../../content/lessons";

/** A course's picture: a histogram for statistics, a curve on axes for functions. */
export function CourseIcon({ course }: { course: CourseId }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="course-icon">
      {course === "stats" ? (
        <>
          <rect x="3" y="11" width="3.2" height="6" rx="0.8" />
          <rect x="8.4" y="5" width="3.2" height="12" rx="0.8" />
          <rect x="13.8" y="8.5" width="3.2" height="8.5" rx="0.8" />
        </>
      ) : (
        <>
          <path className="course-icon-axis" d="M2.5 15.5 H17.5 M5 18 V2.5" />
          <path className="course-icon-curve" d="M3 4 C6 16, 9 16, 11 11 S15 3, 18 3" />
        </>
      )}
    </svg>
  );
}
