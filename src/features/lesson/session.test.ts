import { describe, expect, it } from "vitest";
import type { ExerciseInstance, Feedback } from "../../core/exercise";
import { msg } from "../../core/i18n";
import { createSession, sessionProgress, sessionReducer, type SessionAction, type SessionState } from "./session";

const items: ExerciseInstance[] = [0, 1, 2].map((i) => ({ key: `k${i}`, typeId: "t", difficulty: 1, seed: i }));
const ok: Feedback = { correct: true, headline: msg("x"), explanation: [] };
const ko: Feedback = { correct: false, headline: msg("x"), explanation: [] };
const cont: SessionAction = { type: "continue", initialAnswer: () => null, reseed: () => 99 };

function run(state: SessionState, ...actions: SessionAction[]) {
  return actions.reduce(sessionReducer, state);
}

describe("lesson session", () => {
  it("finishes directly when everything is right", () => {
    const s = run(
      createSession(items, () => null),
      { type: "checked", feedback: ok }, cont,
      { type: "checked", feedback: ok }, cont,
      { type: "checked", feedback: ok }, cont,
    );
    expect(s.phase).toBe("done");
    expect(s.firstTryCorrect).toBe(3);
    expect(sessionProgress(s)).toBe(1);
  });

  it("brings missed exercises back as new variants in a review round", () => {
    let s = run(
      createSession(items, () => null),
      { type: "checked", feedback: ko }, cont,
      { type: "checked", feedback: ok }, cont,
      { type: "checked", feedback: ko }, cont,
    );
    expect(s.phase).toBe("review-intro");
    expect(s.queue.map((i) => i.typeId)).toEqual(["t", "t"]);
    expect(s.queue.every((i) => i.seed === 99)).toBe(true);

    s = run(s, { type: "startReview", initialAnswer: () => null }, { type: "checked", feedback: ok }, cont, { type: "checked", feedback: ko }, cont);
    expect(s.phase).toBe("done");
    expect(s.firstTryCorrect).toBe(1);
    expect(s.fixedInReview).toBe(1);
  });

  it("ignores answers after checking", () => {
    const s = run(createSession(items, () => 1), { type: "checked", feedback: ok }, { type: "answer", answer: 5 });
    expect(s.answer).toBe(1);
  });
});
