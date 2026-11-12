import type { Difficulty, ExerciseConfig } from "../core/exercise";

export interface LessonStep {
  type: string;
  difficulty: Difficulty;
  config?: ExerciseConfig;
}

/** Subjects with their own map. Lessons never require lessons of another course. */
export type CourseId = "stats" | "functions";
export const COURSE_IDS: CourseId[] = ["stats", "functions"];

export type Glyph =
  | "shapes"
  | "bell"
  | "center"
  | "mix"
  | "discrete"
  | "skew"
  | "tails"
  | "params"
  | "sliders"
  | "exam"
  | "families"
  | "graph"
  | "shift"
  | "squash-y"
  | "squash-x"
  | "point"
  | "injective"
  | "inverse"
  | "compose";

/** Titles and summaries live in messages.ts as `lesson.<id>.title` / `.summary`. */
export interface Lesson {
  id: string;
  course: CourseId;
  /** Lessons that must be finished first (derived from the course shape below). */
  requires: string[];
  /** Small shape drawn next to the lesson on the map. */
  glyph: Glyph;
  steps: LessonStep[];
}

type LessonDraft = Omit<Lesson, "course" | "requires">;

/**
 * Every map has the same shape: one starting lesson that opens several
 * themed branches, each branch a straight chain, and every branch ending in
 * the same closing lessons. Branches never touch each other, so the map can
 * draw each one in its own column with no crossing edges.
 */
export interface Course {
  id: CourseId;
  start: string;
  branches: string[][];
  finish: string[];
}

/** More side-by-side branches than this won't fit a phone screen. */
export const MAX_BRANCHES = 4;

function defineCourse(course: CourseId, start: LessonDraft, branches: LessonDraft[][], finish: LessonDraft[]) {
  if (branches.length > MAX_BRANCHES) throw new Error(`${course}: at most ${MAX_BRANCHES} branches`);
  const out: Lesson[] = [{ ...start, course, requires: [] }];
  for (const branch of branches) {
    branch.forEach((l, i) => out.push({ ...l, course, requires: [i === 0 ? start.id : branch[i - 1].id] }));
  }
  finish.forEach((l, i) =>
    out.push({ ...l, course, requires: i === 0 ? branches.map((b) => b[b.length - 1].id) : [finish[i - 1].id] }),
  );
  const shape: Course = {
    id: course,
    start: start.id,
    branches: branches.map((b) => b.map((l) => l.id)),
    finish: finish.map((l) => l.id),
  };
  return { lessons: out, shape };
}

const repeat = (type: string, difficulty: Difficulty, n: number, config?: ExerciseConfig): LessonStep[] =>
  Array.from({ length: n }, () => ({ type, difficulty, config }));

/** Interleave several exercise types so a lesson doesn't feel like a drill. */
const mix = (types: string[], difficulty: Difficulty, config?: ExerciseConfig): LessonStep[] =>
  types.map((type) => ({ type, difficulty, config }));

// ---------------------------------------------------------------- statistics

// Distribution pools, one family per branch.
const SHAPES_1 = ["normal", "uniform", "exponential", "poisson"];
const SHAPES_2 = ["bernoulli", "binomial", "geometric", "discrete-uniform", "poisson", "hypergeometric", "negative-binomial"];
const SHAPES_3 = ["gamma", "beta", "lognormal", "chi-square", "weibull", "pareto", "rayleigh", "f"];
const SHAPES_4 = ["student-t", "cauchy", "laplace", "logistic", "triangular", "gumbel"];
const ALL_SHAPES = [...SHAPES_1, ...SHAPES_2, ...SHAPES_3, ...SHAPES_4];
const PARAMS_BASIC = ["normal", "uniform", "exponential", "poisson"];
const FIT_DISCRETE = ["poisson", "binomial", "geometric", "negative-binomial"];
const FIT_SKEWED = ["gamma", "beta", "weibull", "lognormal", "chi-square", "rayleigh"];

const stats = defineCourse(
  "stats",
  { id: "formas", glyph: "shapes", steps: repeat("guess-distribution", 1, 6, { pool: SHAPES_1 }) },
  [
    // The normal and friends.
    [
      { id: "la-normal", glyph: "bell", steps: [...repeat("fit-normal", 1, 3), ...repeat("fit-normal", 2, 2)] },
      { id: "el-centro", glyph: "center", steps: [...repeat("drag-mean", 1, 3), ...repeat("drag-mean", 2, 3)] },
      {
        id: "parametros-1",
        glyph: "params",
        steps: mix(["match-pairs", "param-quiz", "true-false", "param-quiz", "true-false", "param-quiz"], 1, {
          pool: PARAMS_BASIC,
        }),
      },
    ],
    // Discrete.
    [
      { id: "formas-2", glyph: "discrete", steps: repeat("guess-distribution", 1, 7, { pool: SHAPES_2 }) },
      {
        id: "parametros-discretas",
        glyph: "params",
        steps: mix(["param-quiz", "match-pairs", "true-false", "param-quiz", "true-false", "param-quiz", "match-pairs"], 1, {
          pool: SHAPES_2,
        }),
      },
      {
        id: "ajuste-1",
        glyph: "sliders",
        steps: mix(["fit-params", "pick-curve", "fit-params", "pick-curve", "fit-params", "fit-params"], 1, {
          pool: FIT_DISCRETE,
        }),
      },
    ],
    // Skewed.
    [
      {
        id: "formas-3",
        glyph: "skew",
        steps: repeat("guess-distribution", 1, 7, { pool: SHAPES_3, distractors: SHAPES_1 }),
      },
      {
        id: "parametros-2",
        glyph: "params",
        steps: mix(["param-quiz", "match-pairs", "true-false", "param-quiz", "true-false", "param-quiz", "match-pairs"], 1, {
          pool: SHAPES_3,
        }),
      },
      {
        id: "ajuste-2",
        glyph: "sliders",
        steps: mix(["fit-params", "pick-curve", "fit-params", "pick-curve", "fit-params", "pick-curve"], 1, {
          pool: FIT_SKEWED,
        }),
      },
    ],
    // Tails and peaks.
    [
      {
        id: "formas-4",
        glyph: "tails",
        steps: repeat("guess-distribution", 1, 7, { pool: SHAPES_4, distractors: [...SHAPES_1, ...SHAPES_3] }),
      },
      {
        id: "parametros-3",
        glyph: "params",
        steps: mix(["param-quiz", "true-false", "match-pairs", "param-quiz", "true-false", "param-quiz", "match-pairs"], 1, {
          pool: SHAPES_4,
        }),
      },
    ],
  ],
  [
    {
      id: "examen-formas",
      glyph: "exam",
      steps: repeat("guess-distribution", 2, 12, { pool: ALL_SHAPES, distractors: ALL_SHAPES }),
    },
    {
      id: "repaso",
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
  ],
);

// ----------------------------------------------------------------- functions

// Function families per lesson (see src/functions/families.ts).
const FAM_BASIC = ["constant", "linear", "quadratic", "cubic", "sqrt", "abs"];
const FAM_ALL = ["constant", "linear", "quadratic", "cubic", "sqrt", "abs", "rational", "exponential", "log"];
const FAM_SHIFT = ["quadratic", "abs", "sqrt", "cubic", "rational", "exponential", "log"];
const FAM_RANGE = ["constant", "quadratic", "abs", "sqrt", "rational", "exponential", "cubic", "linear"];
const FAM_DOMAIN = ["sqrt", "log", "rational", "quadratic", "exponential", "abs", "linear"];

const functions = defineCourse(
  "functions",
  {
    id: "familias",
    glyph: "families",
    steps: [...repeat("classify-function", 1, 4, { pool: FAM_BASIC }), ...repeat("classify-function", 2, 4, { pool: FAM_ALL })],
  },
  [
    // Graphs and how a·f(x−h)+k moves them.
    [
      { id: "graficos", glyph: "graph", steps: repeat("pick-graph", 1, 6, { pool: FAM_BASIC }) },
      {
        id: "corrimientos",
        glyph: "shift",
        steps: [
          ...mix(["fit-transform", "pick-graph", "fit-transform"], 1, { pool: FAM_SHIFT }),
          ...mix(["pick-graph", "fit-transform", "fit-transform"], 2, { pool: FAM_SHIFT }),
        ],
      },
    ],
    // Image and domain, then what they say about injective, surjective and inverses.
    [
      {
        id: "imagen",
        glyph: "squash-y",
        steps: mix(["squash-range", "squash-range", "interval-quiz", "squash-range", "interval-quiz", "squash-range"], 1, {
          pool: FAM_RANGE,
        }),
      },
      {
        id: "dominio",
        glyph: "squash-x",
        steps: mix(["squash-domain", "interval-quiz", "squash-domain", "interval-quiz", "squash-domain", "interval-quiz"], 2, {
          pool: FAM_DOMAIN,
        }),
      },
      { id: "inyectiva", glyph: "injective", steps: repeat("injectivity", 1, 6) },
      { id: "inversa", glyph: "inverse", steps: [...repeat("inverse", 1, 4), ...repeat("inverse", 2, 2)] },
    ],
    // Reading values off a graph, then chaining functions.
    [
      { id: "evaluar", glyph: "point", steps: [...repeat("evaluate-graph", 1, 3), ...repeat("evaluate-graph", 2, 3)] },
      { id: "composicion", glyph: "compose", steps: [...repeat("composition", 1, 3), ...repeat("composition", 2, 3)] },
    ],
  ],
  [
    {
      id: "examen-funciones",
      glyph: "exam",
      steps: [
        { type: "classify-function", difficulty: 2, config: { pool: FAM_ALL } },
        { type: "pick-graph", difficulty: 2, config: { pool: FAM_ALL } },
        { type: "squash-range", difficulty: 1, config: { pool: FAM_ALL } },
        { type: "interval-quiz", difficulty: 2, config: { pool: FAM_ALL } },
        { type: "fit-transform", difficulty: 2, config: { pool: FAM_SHIFT } },
        { type: "injectivity", difficulty: 2 },
        { type: "evaluate-graph", difficulty: 2 },
        { type: "inverse", difficulty: 2 },
        { type: "composition", difficulty: 2 },
        { type: "squash-domain", difficulty: 2, config: { pool: FAM_ALL } },
      ],
    },
  ],
);

/**
 * Lessons are data: today a static list, later something a backend can serve.
 * Steps name an exercise type, a difficulty and (optionally) what it may use;
 * the exercise itself is generated fresh every time.
 */
export const lessons: Lesson[] = [...stats.lessons, ...functions.lessons];
export const courses: Record<CourseId, Course> = { stats: stats.shape, functions: functions.shape };

export function getLesson(id: string): Lesson | undefined {
  return lessons.find((l) => l.id === id);
}

export function lessonsOf(course: CourseId): Lesson[] {
  return lessons.filter((l) => l.course === course);
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

/** The starting lesson of a course: the one that requires nothing. */
export function rootOf(course: CourseId): Lesson {
  return getLesson(courses[course].start)!;
}

/** The last lesson of a course (its final review or exam). */
export function lastOf(course: CourseId): Lesson {
  const finish = courses[course].finish;
  return getLesson(finish[finish.length - 1])!;
}

/** First lesson (in list order) of the course that is available and not done yet. */
export function recommendedLesson(completed: (id: string) => boolean, course: CourseId): Lesson {
  return lessonsOf(course).find((l) => !completed(l.id) && isUnlocked(l, completed)) ?? rootOf(course);
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
