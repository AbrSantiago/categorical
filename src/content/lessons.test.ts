import { describe, expect, it } from "vitest";
import { exerciseTypes } from "../exercises/registry";
import {
  AREAS,
  childrenOf,
  courses,
  descendantCount,
  getLesson,
  isUnlocked,
  lastOf,
  lessons,
  lessonsOf,
  parentsOf,
  rootOf,
  trailTo,
} from "./lessons";

describe("lesson graph", () => {
  it("has unique ids and only requires lessons of the same area", () => {
    expect(new Set(lessons.map((l) => l.id)).size).toBe(lessons.length);
    for (const l of lessons)
      for (const r of l.requires) {
        expect(getLesson(r), `${l.id} → ${r}`).toBeDefined();
        expect(getLesson(r)!.area, `${l.id} → ${r}`).toBe(l.area);
      }
  });

  for (const area of AREAS) {
    describe(area, () => {
      const own = lessonsOf(area);
      const root = rootOf(area);
      const join = getLesson(courses[area].finish[0])!;

      it("has exactly one starting lesson", () => {
        expect(own.filter((l) => l.requires.length === 0).map((l) => l.id)).toEqual([root.id]);
      });

      it("has no cycles and reaches every lesson from the start", () => {
        const reached = new Set([root.id]);
        const stack = [root.id];
        while (stack.length) {
          for (const child of childrenOf(stack.pop()!)) {
            if (!reached.has(child.id)) {
              reached.add(child.id);
              stack.push(child.id);
            }
          }
        }
        expect(reached.size).toBe(own.length);
        for (const l of own) expect(trailTo(l.id)[0].id).toBe(root.id);
        expect(descendantCount(root.id)).toBe(own.length - 1);
        expect(descendantCount(lastOf(area).id)).toBe(0);
      });

      // The map stays readable only if branches never meet in the middle:
      // they split at the start and join once, at the finish.
      it("only splits at the start and only joins at the finish", () => {
        for (const l of own) {
          if (l.id === root.id) {
            expect(childrenOf(l.id).length, l.id).toBeGreaterThan(1);
            continue;
          }
          if (l.id !== join.id) expect(parentsOf(l.id).length, `${l.id} parents`).toBe(1);
          if (l.id !== lastOf(area).id) expect(childrenOf(l.id).length, `${l.id} children`).toBe(1);
        }
        expect(parentsOf(join.id).length).toBe(courses[area].branches.length);
      });
    });
  }

  it("unlocks only when every requirement is done", () => {
    const exam = getLesson("examen-formas")!;
    const ends = exam.requires;
    expect(isUnlocked(exam, (id) => id === ends[0])).toBe(false);
    expect(isUnlocked(exam, (id) => ends.includes(id))).toBe(true);
  });

  it("only uses exercise types that exist", () => {
    for (const l of lessons) for (const s of l.steps) expect(exerciseTypes[s.type], `${l.id}: ${s.type}`).toBeDefined();
  });
});
