# categorical

Interactive Duolingo-style web app to learn statistics through play: guess distributions, drag means, tweak parameters with sliders and get instant feedback.

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

A path of 13 lessons, each unlocking the next:

- **Shapes 1–4 and the shapes exam**: name the distribution behind a histogram. 24 distributions, from the normal to the Gumbel. Wrong options never come from the same look-alike group as the answer (a gamma and a chi-square can't be told apart by eye), so every question is fair.
- **The normal** and **The center**: fit μ and σ with sliders; drag a line to the mean or median.
- **Parameters 1–3**: who uses λ, α, σ…, what each one means and what each distribution's mean is. Multiple choice, true/false and tap-to-match pairs.
- **Fitting 1–2**: move one slider per parameter until your curve covers the target (graded by how much area the curves share), and pick the right curve out of four where each wrong one changes a single parameter.
- **Mixed review**.

Missed exercises come back at the end of the lesson as fresh variants. Progress (XP, daily streak, best score per lesson) is stored in `localStorage`.

## How it's built

React + TypeScript + Vite, `motion` for animation, KaTeX for formulas, hand-rolled SVG charts.

```
src/
  core/          seeded RNG, statistics, special functions, the exercise contract (pure TS)
  distributions/ the distribution library: sampler, density, parameters (role, effect,
                 concept), facts, mean formula and texts for each of the 24 distributions
  exercises/     one folder per exercise type + registry.ts
    fit-normal/
      logic.ts       generate(rng, difficulty) and check(params, answer): pure, tested
      messages.ts    every text it shows, in Spanish and English
      FitNormalView.tsx
      index.ts       logic + prompt + view = an ExerciseType
  content/       lessons as data (which exercise types, at which difficulty)
  features/      screens: home (lesson path) and lesson (player, session state machine, summary)
  i18n/          app texts + the catalog that merges every messages.ts
  progress/      progress model + ProgressRepository interface (localStorage today)
  settings/      language and theme (per device, localStorage)
  ui/            charts, mascot, sliders, KaTeX helpers
```

Design decisions that keep the door open for a backend:

- **Exercises are procedural and seeded.** An exercise is `{ typeId, difficulty, seed }`; the same seed always produces the same exercise. Tests rely on it, and a future server (or a challenge between friends) only needs to share the seed.
- **Exercise logic has no React in it.** `logic.ts` files can be unit-tested and, if a backend is ever written in TypeScript, run on the server to validate answers.
- **Progress goes through `ProgressRepository`.** Swap `createLocalProgressRepository()` in `main.tsx` for an API-backed implementation; nothing else changes. The update rules (`applyLessonResult`, streaks, XP) live in `progress/model.ts` as pure functions.
- **One library, many exercises.** Every distribution is defined once in `src/distributions/`; shape, parameter, fitting and true/false exercises all read from it. Tests check that each density integrates to 1, that samplers match their densities, and that every mean formula shown to the player agrees with simulation.
- **Logic returns message ids, not text.** `check()` returns `{ id, values }` objects that the UI translates, so feedback switches language and a backend could return the same ids. `defineMessages(es, en)` makes TypeScript complain if the English catalog misses a key, and a test translates every message the exercises can produce.
- **The lesson flow is a reducer** (`features/lesson/session.ts`), independent of the UI.

### Adding an exercise type

1. Create `src/exercises/<name>/` with `logic.ts` (implements `ExerciseLogic`), `messages.ts`, a view component and `index.ts`.
2. Register it in `src/exercises/registry.ts`.
3. Use its id in a lesson in `src/content/lessons.ts`.
4. Add tests next to the others in `src/exercises/exercises.test.ts`.

## License

GPL-3.0. See [LICENSE](LICENSE).
