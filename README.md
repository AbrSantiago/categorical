# categorical

Interactive Duolingo-style web app to learn math through play, with instant feedback. Two subjects so far:

- **Statistics**: guess distributions from histograms, drag means, tweak parameters with sliders.
- **Functions** (first-year calculus): recognize families, pick graphs, squash a graph onto an axis to see its domain and range, mirror it across y = x to get the inverse, chain functions as machines. Tapping and dragging instead of algebra.

The UI is in Spanish and English (switch in the settings menu, with light/dark/system theme); code and docs are in English.

## Run it

Requires **Node 22.22+** (Node 24 LTS recommended).

```bash
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

| Script | What it does |
| --- | --- |
| `npm test` | Vitest in watch mode |
| `npm run test:run` | Run the tests once |
| `npm run lint` | oxlint |
| `npm run build` | Type-check and build to `dist/` |
| `npm run check` | Type-check, lint and test (what CI runs, minus the build) |

## What's in it

Each subject has its own map (`/stats`, `/functions`; `/` opens the last one). A map always has the same shape: one starting lesson that opens several themed branches, each branch a straight chain, and every branch ending in the same closing lessons. The shape is data (`course(...)` in `src/content/lessons.ts`) and `requires` is derived from it, so branches can't cross; a test fails if a lesson in the middle ever gets a second parent or child. The home screen draws the map with each branch in its own column (`src/features/home/mapLayout.ts`), node sizes that shrink with the distance to the lesson in focus, and the focus's lineage highlighted. The focused lesson's details and start button sit in a panel that sticks to the bottom of the screen. The focus lives in the URL (`?focus=…`).

**Statistics** (14 lessons): Shapes → four branches (the normal; discrete; skewed; tails and peaks) → Shapes exam → Mixed review.

- **Shapes 1–4 and the exam**: name the distribution behind a histogram. 24 distributions, from the normal to the Gumbel. Wrong options never come from the same look-alike group as the answer.
- **The normal** and **The center**: fit μ and σ with sliders; drag a line to the mean or median.
- **Parameters**: who uses λ, α, σ…, what each one means and what each distribution's mean is. Multiple choice, true/false and tap-to-match pairs.
- **Fitting**: move one slider per parameter until your curve covers the target, and pick the right curve out of four where each wrong one changes a single parameter.

**Functions** (10 lessons): Families → three branches → Functions exam.

- **Families**: constant, linear, quadratic, cubic, square root, absolute value, rational, exponential, logarithmic, from the graph or the formula. Wrong options are look-alikes.
- **Graphs → Shifts**: pick the graph of a formula out of four, where the wrong ones are the classic slips (x − 2 moved left, sign of a, horizontal and vertical shifts swapped); then move a·g(x − h) + k with sliders until it covers a target.
- **Range → Domain → Injective and surjective → Inverse**: a slider squashes the plane onto an axis with the matrix [[1 − t, 0], [0, 1]]; what stays painted is the range (or domain), with open ends and holes where they belong. Mark the set on a number line (drag the ends, tap to include or exclude, ∞ past the last tick, an optional hole), or pick it in interval notation. For f: A → B, a draggable horizontal line counts hits, squashing paints darker where several x land, and the codomain is a band that shows what's left uncovered. The inverse is the mirror image across y = x, animated with the matrix between the identity and [[0, 1], [1, 0]]; a non-injective function fails the vertical line test once mirrored.
- **Reading the graph → Composition**: tap (2, f(2)) or every x with f(x) = c; then f ∘ g as two machines in a row.

Missed exercises come back at the end of the lesson as fresh variants. Progress (XP, daily streak, best score per lesson) is stored in `localStorage`.

## How it's built

React + TypeScript + Vite, `motion` for animation, KaTeX for formulas, hand-rolled SVG charts.

```
src/
  core/          seeded RNG, statistics, special functions, the exercise contract (pure TS)
  distributions/ the distribution library: sampler, density, parameters (role, effect,
                 concept), facts, mean formula and texts for each of the 24 distributions
  functions/     the function library: families a·g(x − h) + k with exact domain, range,
                 injectivity, inverse and solutions, on interval sets with open/closed ends
  exercises/     one folder per exercise type + registry.ts
    fit-normal/
      logic.ts       generate(rng, difficulty) and check(params, answer): pure, tested
      messages.ts    every text it shows, in Spanish and English
      FitNormalView.tsx
      index.ts       logic + prompt + view = an ExerciseType
  content/       lessons as data (which exercise types, at which difficulty)
  features/      screens: home (subject tabs and map) and lesson (player, session state machine, summary)
  i18n/          app texts + the catalog that merges every messages.ts
  progress/      progress model + ProgressRepository interface (localStorage today)
  settings/      language and theme (per device, localStorage)
  ui/            charts, function plots (squash and mirror matrices, number line), mascot, sliders, KaTeX
```

Design decisions that keep the door open for a backend:

- **Exercises are procedural and seeded.** An exercise is `{ typeId, difficulty, seed }`; the same seed always produces the same exercise. Tests rely on it, and a future server (or a challenge between friends) only needs to share the seed.
- **Exercise logic has no React in it.** `logic.ts` files can be unit-tested and, if a backend is ever written in TypeScript, run on the server to validate answers.
- **Progress goes through `ProgressRepository`.** Swap `createLocalProgressRepository()` in `main.tsx` for an API-backed implementation; nothing else changes. The update rules (`applyLessonResult`, streaks, XP) live in `progress/model.ts` as pure functions.
- **One library, many exercises.** Every distribution is defined once in `src/distributions/`, every function family once in `src/functions/`. Tests check that each density integrates to 1, that samplers match their densities, that every mean formula agrees with simulation, and that each function's exact domain and range agree with sampled values.
- **Logic returns message ids, not text.** `check()` returns `{ id, values }` objects that the UI translates, so feedback switches language and a backend could return the same ids. `defineMessages(es, en)` makes TypeScript complain if the English catalog misses a key, and a test translates every message the exercises can produce.
- **The lesson flow is a reducer** (`features/lesson/session.ts`), independent of the UI.

### Adding an exercise type

1. Create `src/exercises/<name>/` with `logic.ts` (implements `ExerciseLogic`), `messages.ts`, a view component and `index.ts`.
2. Register it in `src/exercises/registry.ts`.
3. Use its id in a lesson in `src/content/lessons.ts`.
4. Add tests next to the others (`src/exercises/exercises.test.ts`, `src/exercises/functions.test.ts`) and sample answers in `src/i18n/i18n.test.ts`.

## License

GPL-3.0. See [LICENSE](LICENSE).
