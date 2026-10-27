import { describe, expect, it } from "vitest";
import { exerciseTypes } from "../exercises/registry";
import { childrenOf, descendantCount, getLesson, isUnlocked, lessons, rootLesson, trailTo } from "./lessons";

describe("lesson graph", () => {
  it("only requires lessons that exist", () => {
    for (const l of lessons) for (const r of l.requires) expect(getLesson(r), `${l.id} → ${r}`).toBeDefined();
  });

  it("has exactly one starting lesson", () => {
    expect(lessons.filter((l) => l.requires.length === 0).map((l) => l.id)).toEqual([rootLesson.id]);
  });

  it("has no cycles and reaches every lesson from the start", () => {
    const reached = new Set([rootLesson.id]);
    const stack = [rootLesson.id];
    while (stack.length) {
      for (const child of childrenOf(stack.pop()!)) {
        if (!reached.has(child.id)) {
          reached.add(child.id);
          stack.push(child.id);
        }
      }
    }
    expect(reached.size).toBe(lessons.length);
    // Trails terminate at the root (a cycle would loop forever or miss it).
    for (const l of lessons) expect(trailTo(l.id)[0].id).toBe(rootLesson.id);
  });

  it("unlocks only when every requirement is done", () => {
    const exam = getLesson("examen-formas")!;
    expect(isUnlocked(exam, (id) => id === "formas-2")).toBe(false);
    expect(isUnlocked(exam, (id) => id === "formas-2" || id === "formas-4")).toBe(true);
  });

  it("counts what lies ahead", () => {
    expect(descendantCount(rootLesson.id)).toBe(lessons.length - 1);
    expect(descendantCount("repaso")).toBe(0);
  });

  it("only uses exercise types that exist", () => {
    for (const l of lessons) for (const s of l.steps) expect(exerciseTypes[s.type], `${l.id}: ${s.type}`).toBeDefined();
  });
});
