import type { ComponentType } from "react";
import type { Catalog, Locale, Msg } from "./i18n";
import type { Rng } from "./random";

export type Difficulty = 1 | 2;

/**
 * Per-step settings from the lesson, e.g. which distributions a shape
 * question may use. Plain data, so lessons stay serializable.
 */
export interface ExerciseConfig {
  /** Distribution ids this step draws from. */
  pool?: string[];
  /** Extra distribution ids allowed as wrong options. */
  distractors?: string[];
}

/**
 * Result of checking an answer. Messages are ids + values, translated by the
 * UI; their text may contain inline math between `$...$` (KaTeX).
 */
export interface Feedback {
  correct: boolean;
  headline: Msg;
  explanation: Msg[];
}

/**
 * The pure half of an exercise: no React, no DOM. It can be unit-tested and,
 * if a backend ever needs to validate answers, moved to the server as is.
 */
export interface ExerciseLogic<P, A> {
  /** Stable id, also used in lesson definitions and saved progress. */
  id: string;
  generate(rng: Rng, difficulty: Difficulty, config?: ExerciseConfig): P;
  /** Starting answer. Slider-style exercises start with a value; choices start empty. */
  initialAnswer(params: P): A | null;
  check(params: P, answer: A): Feedback;
}

export interface ExerciseViewProps<P, A> {
  params: P;
  answer: A | null;
  onAnswer: (answer: A) => void;
  /** Present once the answer has been checked: the view reveals the solution. */
  feedback: Feedback | null;
}

export interface ExerciseType<P, A> extends ExerciseLogic<P, A> {
  /** Instruction shown above the exercise. */
  prompt(params: P): Msg;
  View: ComponentType<ExerciseViewProps<P, A>>;
  /** Every text this exercise shows, per language. */
  messages: Record<Locale, Catalog>;
  /** Whether the answer can be checked yet (default: any non-null answer). */
  ready?(answer: A): boolean;
}

/** One concrete exercise inside a lesson session. */
export interface ExerciseInstance {
  key: string;
  typeId: string;
  difficulty: Difficulty;
  seed: number;
  config?: ExerciseConfig;
}
