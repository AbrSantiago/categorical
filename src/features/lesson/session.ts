import type { ExerciseInstance, Feedback } from "../../core/exercise";

/**
 * State machine for one lesson, kept free of React so it can be tested alone.
 *
 * answering → checked → (next exercise) … → review-intro → answering … → done
 *
 * Exercises missed in the main round come back once, as fresh variants
 * of the same type, in a review round at the end.
 */
export type Phase = "answering" | "checked" | "review-intro" | "done";

export interface SessionState {
  queue: ExerciseInstance[];
  index: number;
  phase: Phase;
  inReview: boolean;
  answer: unknown;
  feedback: Feedback | null;
  total: number;
  firstTryCorrect: number;
  fixedInReview: number;
  missed: ExerciseInstance[];
}

export type SessionAction =
  | { type: "answer"; answer: unknown }
  | { type: "checked"; feedback: Feedback }
  | { type: "continue"; initialAnswer: (item: ExerciseInstance) => unknown; reseed: () => number }
  | { type: "startReview"; initialAnswer: (item: ExerciseInstance) => unknown };

export function createSession(
  items: ExerciseInstance[],
  initialAnswer: (item: ExerciseInstance) => unknown,
): SessionState {
  return {
    queue: items,
    index: 0,
    phase: "answering",
    inReview: false,
    answer: items.length ? initialAnswer(items[0]) : null,
    feedback: null,
    total: items.length,
    firstTryCorrect: 0,
    fixedInReview: 0,
    missed: [],
  };
}

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case "answer":
      return state.phase === "answering" ? { ...state, answer: action.answer } : state;

    case "checked": {
      if (state.phase !== "answering") return state;
      const item = state.queue[state.index];
      const { correct } = action.feedback;
      return {
        ...state,
        phase: "checked",
        feedback: action.feedback,
        firstTryCorrect: state.firstTryCorrect + (!state.inReview && correct ? 1 : 0),
        fixedInReview: state.fixedInReview + (state.inReview && correct ? 1 : 0),
        missed: !state.inReview && !correct ? [...state.missed, item] : state.missed,
      };
    }

    case "continue": {
      if (state.phase !== "checked") return state;
      const nextIndex = state.index + 1;
      if (nextIndex < state.queue.length) {
        return {
          ...state,
          index: nextIndex,
          phase: "answering",
          feedback: null,
          answer: action.initialAnswer(state.queue[nextIndex]),
        };
      }
      if (!state.inReview && state.missed.length > 0) {
        const review = state.missed.map((item, i) => ({
          ...item,
          key: `${item.key}-review-${i}`,
          seed: action.reseed(),
        }));
        return { ...state, phase: "review-intro", queue: review, index: 0, feedback: null };
      }
      return { ...state, phase: "done", feedback: null };
    }

    case "startReview":
      if (state.phase !== "review-intro") return state;
      return {
        ...state,
        phase: "answering",
        inReview: true,
        answer: action.initialAnswer(state.queue[0]),
      };
  }
}

/** 0..1 for the progress bar: the review round counts as extra steps. */
export function sessionProgress(state: SessionState): number {
  const steps = state.total + state.missed.length;
  if (state.phase === "done") return 1;
  const finishedMain = state.inReview || state.phase === "review-intro" ? state.total : state.index;
  const finishedReview = state.inReview ? state.index : 0;
  const currentDone = state.phase === "checked" ? 1 : 0;
  return Math.min(1, (finishedMain + finishedReview + currentDone) / Math.max(1, steps));
}
