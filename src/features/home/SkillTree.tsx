import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  getLesson,
  isUnlocked,
  lessonSummaryId,
  lessonTitleId,
  recommendedLesson,
  type AreaId,
  type Lesson,
} from "../../content/lessons";
import type { Progress } from "../../progress/model";
import { useI18n } from "../../settings/SettingsContext";
import { RichText } from "../../ui/Math";
import { LessonGlyph } from "./LessonGlyph";
import { ancestorsOf, descendantsOf, distancesFrom, layoutMap, type MapLayout } from "./mapLayout";

type Status = "done" | "open" | "locked";

/** Node size by steps from the focus: the further away, the smaller. */
const SIZES = [76, 54, 38, 18];
const ROW_HEIGHT = 118;
const TOP = 46;

const LAYOUTS = new Map<AreaId, MapLayout>();
const layoutOf = (area: AreaId) => {
  if (!LAYOUTS.has(area)) LAYOUTS.set(area, layoutMap(area));
  return LAYOUTS.get(area)!;
};

/**
 * The whole lesson map of an area at once. Every lesson keeps a fixed place
 * (each branch in its own column), so the map reads like a real map; the focused lesson is big and
 * the others shrink with their distance to it, down to unlabeled dots. Edges
 * on the focus's lineage (what it comes from, what it opens) are
 * highlighted. Details and the start button live in a panel that sticks to
 * the bottom of the screen while the map is visible.
 *
 * The focus lives in the URL (?focus=…), so the back button returns to the
 * previous focus.
 */
export function SkillTree({ progress, area }: { progress: Progress | null; area: AreaId }) {
  const { t } = useI18n();
  const [params, setParams] = useSearchParams();
  const done = (id: string) => Boolean(progress?.lessons[id]);
  const statusOf = (l: Lesson): Status => (done(l.id) ? "done" : isUnlocked(l, done) ? "open" : "locked");
  const LAYOUT = layoutOf(area);

  const asked = getLesson(params.get("focus") ?? "");
  const focus = asked?.area === area ? asked : recommendedLesson(done, area);
  const go = (id: string) => setParams({ focus: id }, { preventScrollReset: true });

  const { distance, ancestors, descendants } = useMemo(
    () => ({ distance: distancesFrom(focus.id), ancestors: ancestorsOf(focus.id), descendants: descendantsOf(focus.id) }),
    [focus.id],
  );
  /** Edges on a chain through the focus: where it comes from and what it opens. */
  const onLineage = (from: string, to: string) =>
    (to === focus.id && ancestors.has(from)) ||
    (from === focus.id && descendants.has(to)) ||
    (ancestors.has(from) && ancestors.has(to)) ||
    (descendants.has(from) && descendants.has(to));

  // Width in px, so edges (SVG) and nodes (HTML) share coordinates.
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(360);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const height = TOP + (LAYOUT.rows - 1) * ROW_HEIGHT + 70;
  const pos = new Map(LAYOUT.nodes.map((n) => [n.lesson.id, { x: n.x * width, y: TOP + n.row * ROW_HEIGHT }]));
  const sizeOf = (id: string) => SIZES[Math.min(distance.get(id) ?? 3, 3)];
  const completed = LAYOUT.nodes.filter((n) => done(n.lesson.id)).length;

  return (
    <section className="tree" aria-labelledby="tree-title">
      <div className="tree-head">
        <h2 id="tree-title">{t("home.map")}</h2>
        <p className="tree-count">{t("home.mapCount", { done: completed, total: LAYOUT.nodes.length })}</p>
      </div>

      <div className="map" ref={ref} style={{ height }}>
        <svg className="map-edges" width={width} height={height} aria-hidden="true">
          {LAYOUT.edges.map(([from, to]) => {
            const d = edgePath(LAYOUT, from, to, pos, sizeOf);
            const child = getLesson(to)!;
            return (
              <motion.path
                key={`${from}-${to}`}
                initial={false}
                animate={{ d }}
                transition={{ type: "spring", stiffness: 300, damping: 32 }}
                className={`map-edge${onLineage(from, to) ? " is-lineage" : ""}${statusOf(child) === "locked" ? " is-locked" : ""}`}
              />
            );
          })}
        </svg>

        {LAYOUT.nodes.map(({ lesson, column }) => {
          const p = pos.get(lesson.id)!;
          const dist = Math.min(distance.get(lesson.id) ?? 3, 3);
          const status = statusOf(lesson);
          const slot = column === null ? 150 : Math.min(130, width / LAYOUT.columns);
          return (
            <button
              key={lesson.id}
              type="button"
              className={`map-node dist-${dist} is-${status}${lesson.id === focus.id ? " is-focus" : ""}`}
              style={{ left: p.x, top: p.y, width: slot }}
              aria-current={lesson.id === focus.id ? "true" : undefined}
              aria-label={`${t(lessonTitleId(lesson))}. ${t(`home.status.${status}`)}`}
              title={dist === 3 ? t(lessonTitleId(lesson)) : undefined}
              onClick={() => go(lesson.id)}
            >
              <span className="map-bubble" style={{ width: SIZES[dist], height: SIZES[dist] }} aria-hidden="true">
                {dist < 3 && <LessonGlyph glyph={lesson.glyph} />}
                {status === "done" && dist < 3 && <span className="node-check">✓</span>}
              </span>
              {dist < 3 && (
                <span className="map-label" aria-hidden="true">
                  {t(lessonTitleId(lesson))}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <FocusPanel lesson={focus} status={statusOf(focus)} done={done} />
    </section>
  );
}

type Point = { x: number; y: number };

/**
 * Edge from a lesson to one that requires it. Inside a branch it's a straight
 * vertical line. From the start it fans out with an S-curve, and into the
 * finish it runs straight down its own column until the row above the finish,
 * then curves in, so a shorter branch never cuts across its neighbors.
 */
function edgePath(layout: MapLayout, from: string, to: string, pos: Map<string, Point>, sizeOf: (id: string) => number): string {
  const a = pos.get(from)!;
  const b = pos.get(to)!;
  const start = { x: a.x, y: a.y + sizeOf(from) / 2 };
  const end = { x: b.x, y: b.y - sizeOf(to) / 2 };
  if (Math.abs(a.x - b.x) < 0.5) return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  const rowsApart = layout.nodes.find((n) => n.lesson.id === to)!.row - layout.nodes.find((n) => n.lesson.id === from)!.row;
  // Straight part (only for edges that skip rows), then the curve over one row.
  const bend = rowsApart > 1 ? b.y - ROW_HEIGHT + 10 : start.y;
  const mid = (bend + end.y) / 2;
  const straight = bend > start.y ? ` L ${start.x} ${bend}` : "";
  return `M ${start.x} ${start.y}${straight} C ${start.x} ${mid}, ${end.x} ${mid}, ${end.x} ${end.y}`;
}

function FocusPanel({ lesson, status, done }: { lesson: Lesson; status: Status; done: (id: string) => boolean }) {
  const { t, locale } = useI18n();
  const missing = lesson.requires.map((id) => getLesson(id)!).filter((l) => !done(l.id));
  const list = new Intl.ListFormat(locale, { type: "conjunction" }).format(missing.map((l) => t(lessonTitleId(l))));
  return (
    <div className={`focus-panel is-${status}`} aria-live="polite">
      <span className={`map-bubble is-${status}`} aria-hidden="true">
        <LessonGlyph glyph={lesson.glyph} />
      </span>
      <div className="focus-panel-text">
        <h3>{t(lessonTitleId(lesson))}</h3>
        <p className="focus-panel-summary">
          <RichText text={t(lessonSummaryId(lesson))} />
        </p>
        <p className="focus-panel-meta">
          {status === "locked"
            ? t("home.requires", { list })
            : `${t(`home.status.${status}`)}. ${t("home.lesson.count", { n: lesson.steps.length })}`}
        </p>
      </div>
      {status !== "locked" && (
        <Link to={`/lesson/${lesson.id}`} className="button primary">
          {t(status === "done" ? "home.again" : "home.start")}
        </Link>
      )}
    </div>
  );
}
