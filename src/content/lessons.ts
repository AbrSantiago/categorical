import type { Difficulty, ExerciseConfig } from "../core/exercise";

export interface LessonStep {
  type: string;
  difficulty: Difficulty;
  config?: ExerciseConfig;
}

/** Titles and summaries live in messages.ts as `lesson.<id>.title` / `.summary`. */
export interface Lesson {
  id: string;
  /**
   * Lessons that must be finished first. They make a graph, not a line:
   * several branches open up after the first lesson, and some lessons
   * join two branches (the shapes exam needs Shapes 2 and Shapes 4).
   */
  requires: string[];
  /** Small shape drawn next to the lesson on the path. */
  glyph: "shapes" | "bell" | "center" | "mix" | "discrete" | "skew" | "tails" | "params" | "sliders" | "exam";
  steps: LessonStep[];
}

const repeat = (type: string, difficulty: Difficulty, n: number, config?: ExerciseConfig): LessonStep[] =>
  Array.from({ length: n }, () => ({ type, difficulty, config }));

/** Interleave several exercise types so a lesson doesn't feel like a drill. */
const mix = (types: string[], difficulty: Difficulty, config: ExerciseConfig): LessonStep[] =>
  types.map((type) => ({ type, difficulty, config }));

// Distribution pools per lesson.
const SHAPES_1 = ["normal", "uniform", "exponential", "poisson"];
const SHAPES_2 = ["bernoulli", "binomial", "geometric", "discrete-uniform", "poisson", "hypergeometric", "negative-binomial"];
const SHAPES_3 = ["gamma", "beta", "lognormal", "chi-square", "weibull", "pareto", "rayleigh", "f"];
const SHAPES_4 = ["student-t", "cauchy", "laplace", "logistic", "triangular", "gumbel"];
const PARAMS_1 = ["normal", "uniform", "exponential", "poisson", "binomial", "bernoulli", "geometric"];
const PARAMS_2 = ["gamma", "beta", "chi-square", "student-t", "lognormal", "weibull", "pareto", "f"];
const PARAMS_3 = ["cauchy", "laplace", "logistic", "triangular", "gumbel", "rayleigh", "negative-binomial", "hypergeometric", "discrete-uniform"];
const FIT_1 = ["exponential", "poisson", "binomial", "uniform", "geometric"];
const FIT_2 = ["gamma", "beta", "weibull", "lognormal", "chi-square", "rayleigh", "laplace", "negative-binomial"];
const ALL_SHAPES = [...SHAPES_1, ...SHAPES_2, ...SHAPES_3, ...SHAPES_4];

/**
 * Lessons are data: today a static list, later something a backend can serve.
 * Steps name an exercise type, a difficulty and (optionally) which
 * distributions it may use; the exercise itself is generated fresh every time.
 */
export const lessons: Lesson[] = [
  {
    id: "formas",
    requires: [],
    glyph: "shapes",
    steps: repeat("guess-distribution", 1, 6, { pool: SHAPES_1 }),
  },
  {
    id: "la-normal",
    requires: ["formas"],
    glyph: "bell",
    steps: [...repeat("fit-normal", 1, 3), ...repeat("fit-normal", 2, 2)],
  },
  {
    id: "el-centro",
    requires: ["la-normal"],
    glyph: "center",
    steps: [...repeat("drag-mean", 1, 3), ...repeat("drag-mean", 2, 3)],
  },
  {
    id: "formas-2",
    requires: ["formas"],
    glyph: "discrete",
    steps: repeat("guess-distribution", 1, 7, { pool: SHAPES_2 }),
  },
  {
    id: "parametros-1",
    requires: ["formas"],
    glyph: "params",
    steps: mix(["match-pairs", "param-quiz", "true-false", "param-quiz", "true-false", "match-pairs", "param-quiz"], 1, {
      pool: PARAMS_1,
    }),
  },
  {
    id: "ajuste-1",
    requires: ["parametros-1"],
    glyph: "sliders",
    steps: mix(["fit-params", "pick-curve", "fit-params", "pick-curve", "fit-params", "fit-params"], 1, { pool: FIT_1 }),
  },
  {
    id: "formas-3",
    requires: ["formas"],
    glyph: "skew",
    steps: repeat("guess-distribution", 1, 7, { pool: SHAPES_3, distractors: SHAPES_1 }),
  },
  {
    id: "parametros-2",
    requires: ["formas-3"],
    glyph: "params",
    steps: mix(["param-quiz", "match-pairs", "true-false", "param-quiz", "true-false", "param-quiz", "match-pairs"], 1, {
      pool: PARAMS_2,
    }),
  },
  {
    id: "ajuste-2",
    requires: ["ajuste-1", "parametros-2"],
    glyph: "sliders",
    steps: mix(["fit-params", "pick-curve", "fit-params", "pick-curve", "fit-params", "pick-curve"], 1, { pool: FIT_2 }),
  },
  {
    id: "formas-4",
    requires: ["formas-3"],
    glyph: "tails",
    steps: repeat("guess-distribution", 1, 7, { pool: SHAPES_4, distractors: [...SHAPES_1, ...SHAPES_3] }),
  },
  {
    id: "parametros-3",
    requires: ["formas-2", "formas-4"],
    glyph: "params",
    steps: mix(["param-quiz", "true-false", "match-pairs", "param-quiz", "true-false", "param-quiz", "match-pairs"], 1, {
      pool: PARAMS_3,
    }),
  },
  {
    id: "examen-formas",
    requires: ["formas-2", "formas-4"],
    glyph: "exam",
    steps: repeat("guess-distribution", 2, 12, { pool: ALL_SHAPES, distractors: ALL_SHAPES }),
  },
  {
    id: "repaso",
    requires: ["el-centro", "ajuste-2", "examen-formas"],
    glyph: "mix",
    steps: [
      { type: "guess-distribution", difficulty: 2 },
      { type: "fit-normal", difficulty: 2 },
      { type: "drag-mean", difficulty: 2 },
      { type: "pick-curve", difficulty: 2 },
      { type: "param-quiz", difficulty: 2 },
      { type: "guess-distribution", difficulty: 2, config: { pool: ALL_SHAPES } },
      { type: "drag-mean", difficulty: 2 },
      { type: "true-false", difficulty: 2 },
      { type: "fit-params", difficulty: 2 },
    ],
  },
];

export function getLesson(id: string): Lesson | undefined {
  return lessons.find((l) => l.id === id);
}

/** A lesson unlocks when every lesson it requires has been completed. */
export function isUnlocked(lesson: Lesson, completed: (id: string) => boolean): boolean {
  return lesson.requires.every(completed);
}

/** Lessons that list `id` as a requirement: what it leads to. */
export function childrenOf(id: string): Lesson[] {
  return lessons.filter((l) => l.requires.includes(id));
}

export function parentsOf(id: string): Lesson[] {
  return getLesson(id)?.requires.map((r) => getLesson(r)!) ?? [];
}

/** The starting lesson: the one that requires nothing. */
export const rootLesson: Lesson = lessons.find((l) => l.requires.length === 0)!;

/** First lesson (in list order) that is available and not done yet. */
export function recommendedLesson(completed: (id: string) => boolean): Lesson {
  return lessons.find((l) => !completed(l.id) && isUnlocked(l, completed)) ?? rootLesson;
}

/** How many distinct lessons lie somewhere beyond `id`. */
export function descendantCount(id: string): number {
  const seen = new Set<string>();
  const visit = (current: string) => {
    for (const child of childrenOf(current)) {
      if (seen.has(child.id)) continue;
      seen.add(child.id);
      visit(child.id);
    }
  };
  visit(id);
  return seen.size;
}

/** Root → … → id, always following the first requirement (for breadcrumbs). */
export function trailTo(id: string): Lesson[] {
  const out: Lesson[] = [];
  let current = getLesson(id);
  while (current) {
    out.unshift(current);
    current = current.requires.length ? getLesson(current.requires[0]) : undefined;
  }
  return out;
}

export const lessonTitleId = (lesson: Lesson) => `lesson.${lesson.id}.title`;
export const lessonSummaryId = (lesson: Lesson) => `lesson.${lesson.id}.summary`;
