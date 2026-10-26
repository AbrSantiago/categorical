import { describe, expect, it } from "vitest";
import { applyLessonResult, currentStreak, emptyProgress, type LessonResult } from "./model";
import { createLocalProgressRepository } from "./repository";

const result: LessonResult = { lessonId: "formas", total: 6, firstTryCorrect: 4, fixedInReview: 1 };
const at = (iso: string) => new Date(`${iso}T12:00:00`);

describe("progress rules", () => {
  it("adds XP and records the lesson", () => {
    const p = applyLessonResult(emptyProgress(), result, at("2026-10-25"));
    expect(p.xp).toBe(4 * 10 + 5 + 10);
    expect(p.lessons.formas.bestScore).toBeCloseTo(4 / 6);
  });

  it("grows the streak on consecutive days and resets after a gap", () => {
    let p = applyLessonResult(emptyProgress(), result, at("2026-10-25"));
    p = applyLessonResult(p, result, at("2026-10-25"));
    expect(p.streak.count).toBe(1);
    p = applyLessonResult(p, result, at("2026-10-26"));
    expect(p.streak.count).toBe(2);
    expect(currentStreak(p, "2026-10-27")).toBe(2);
    expect(currentStreak(p, "2026-10-28")).toBe(0);
    p = applyLessonResult(p, result, at("2026-10-29"));
    expect(p.streak.count).toBe(1);
  });

  it("keeps the best score", () => {
    let p = applyLessonResult(emptyProgress(), { ...result, firstTryCorrect: 6 }, at("2026-10-25"));
    p = applyLessonResult(p, { ...result, firstTryCorrect: 2 }, at("2026-10-25"));
    expect(p.lessons.formas.bestScore).toBe(1);
    expect(p.lessons.formas.timesCompleted).toBe(2);
  });
});

describe("local repository", () => {
  it("persists through storage and survives corrupt data", async () => {
    const data = new Map<string, string>();
    const storage = {
      getItem: (k: string) => data.get(k) ?? null,
      setItem: (k: string, v: string) => void data.set(k, v),
      removeItem: (k: string) => void data.delete(k),
    };
    const repo = createLocalProgressRepository(storage, () => at("2026-10-25"));
    await repo.recordLessonResult(result);
    expect((await createLocalProgressRepository(storage).load()).xp).toBe(55);

    data.set([...data.keys()][0], "{not json");
    expect((await repo.load()).xp).toBe(0);
  });
});
