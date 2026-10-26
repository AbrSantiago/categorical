/**
 * Player progress and the rules that update it. Pure functions, so the same
 * rules can run locally today and be ported to (or replaced by) a backend.
 */

export interface LessonRecord {
  bestScore: number; // 0..1, share of exercises right on the first try
  timesCompleted: number;
  lastCompletedAt: string; // ISO timestamp
}

export interface Progress {
  version: 1;
  xp: number;
  streak: {
    count: number;
    /** Local calendar day (YYYY-MM-DD) of the last finished lesson. */
    lastActiveDay: string | null;
  };
  lessons: Record<string, LessonRecord>;
}

export interface LessonResult {
  lessonId: string;
  total: number;
  firstTryCorrect: number;
  fixedInReview: number;
}

export const XP_PER_FIRST_TRY = 10;
export const XP_PER_REVIEW_FIX = 5;
export const XP_LESSON_BONUS = 10;

export function emptyProgress(): Progress {
  return { version: 1, xp: 0, streak: { count: 0, lastActiveDay: null }, lessons: {} };
}

export function xpFor(result: LessonResult): number {
  return (
    result.firstTryCorrect * XP_PER_FIRST_TRY +
    result.fixedInReview * XP_PER_REVIEW_FIX +
    XP_LESSON_BONUS
  );
}

/** YYYY-MM-DD in the player's local time zone. */
export function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function daysBetween(fromDay: string, toDay: string): number {
  const a = Date.UTC(...splitDay(fromDay));
  const b = Date.UTC(...splitDay(toDay));
  return Math.round((b - a) / 86_400_000);
}

function splitDay(day: string): [number, number, number] {
  const [y, m, d] = day.split("-").map(Number);
  return [y, m - 1, d];
}

/** Streak to show today: it is lost once a whole day goes by without practice. */
export function currentStreak(progress: Progress, today: string): number {
  const { lastActiveDay, count } = progress.streak;
  if (!lastActiveDay) return 0;
  return daysBetween(lastActiveDay, today) <= 1 ? count : 0;
}

export function applyLessonResult(progress: Progress, result: LessonResult, now: Date): Progress {
  const today = dayKey(now);
  const { lastActiveDay } = progress.streak;
  let count: number;
  if (!lastActiveDay) count = 1;
  else {
    const gap = daysBetween(lastActiveDay, today);
    count = gap === 0 ? progress.streak.count : gap === 1 ? progress.streak.count + 1 : 1;
  }

  const score = result.total === 0 ? 0 : result.firstTryCorrect / result.total;
  const previous = progress.lessons[result.lessonId];

  return {
    ...progress,
    xp: progress.xp + xpFor(result),
    streak: { count, lastActiveDay: today },
    lessons: {
      ...progress.lessons,
      [result.lessonId]: {
        bestScore: Math.max(score, previous?.bestScore ?? 0),
        timesCompleted: (previous?.timesCompleted ?? 0) + 1,
        lastCompletedAt: now.toISOString(),
      },
    },
  };
}
