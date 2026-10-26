import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useReducer, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router";
import { getLesson, type Lesson } from "../../content/lessons";
import type { ExerciseInstance } from "../../core/exercise";
import { randomSeed, Rng } from "../../core/random";
import { getExerciseType } from "../../exercises/registry";
import type { LessonResult } from "../../progress/model";
import { useProgress } from "../../progress/ProgressContext";
import { useI18n } from "../../settings/SettingsContext";
import { Mascot } from "../../ui/Mascot";
import { RichText } from "../../ui/Math";
import { ProgressBar } from "../../ui/ProgressBar";
import { createSession, sessionProgress, sessionReducer } from "./session";
import { LessonSummary } from "./LessonSummary";

export function LessonPage() {
  const { lessonId = "" } = useParams();
  const lesson = getLesson(lessonId);
  const [run, setRun] = useState(0);
  if (!lesson) return <Navigate to="/" replace />;
  // A new key remounts the player, so a restart gets fresh exercises.
  return <LessonPlayer key={`${lesson.id}-${run}`} lesson={lesson} onRestart={() => setRun((r) => r + 1)} />;
}

function useParamsCache() {
  const [cache] = useState(() => new Map<string, unknown>());
  return (item: ExerciseInstance) => {
    if (!cache.has(item.key)) {
      cache.set(item.key, getExerciseType(item.typeId).generate(new Rng(item.seed), item.difficulty, item.config));
    }
    return cache.get(item.key);
  };
}

export function LessonPlayer({ lesson, onRestart }: { lesson: Lesson; onRestart?: () => void }) {
  const paramsFor = useParamsCache();
  const initialAnswer = (item: ExerciseInstance) => getExerciseType(item.typeId).initialAnswer(paramsFor(item));
  const [state, dispatch] = useReducer(sessionReducer, lesson, (l) =>
    createSession(
      l.steps.map((step, i) => ({
        key: `${l.id}-${i}`,
        typeId: step.type,
        difficulty: step.difficulty,
        config: step.config,
        seed: randomSeed(),
      })),
      initialAnswer,
    ),
  );
  const { recordLessonResult } = useProgress();
  const [saved, setSaved] = useState<{ result: LessonResult; streak: number } | null>(null);
  const savingRef = useRef(false);
  const reduced = useReducedMotion();
  const { t } = useI18n();

  useEffect(() => {
    if (state.phase !== "done" || savingRef.current) return;
    savingRef.current = true;
    const result: LessonResult = {
      lessonId: lesson.id,
      total: state.total,
      firstTryCorrect: state.firstTryCorrect,
      fixedInReview: state.fixedInReview,
    };
    recordLessonResult(result).then((p) => setSaved({ result, streak: p.streak.count }));
  }, [state.phase, state.total, state.firstTryCorrect, state.fixedInReview, lesson.id, recordLessonResult]);

  if (state.phase === "done") {
    return saved ? <LessonSummary lesson={lesson} result={saved.result} streak={saved.streak} onRestart={onRestart} /> : null;
  }

  const item = state.queue[state.index];
  const type = getExerciseType(item.typeId);
  const params = paramsFor(item);
  const { View } = type;

  return (
    <div className="lesson">
      <header className="lesson-top">
        <Link to="/" className="icon-button" aria-label={t("lesson.exit")}>
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path d="M6 6 L18 18 M18 6 L6 18" />
          </svg>
        </Link>
        <ProgressBar value={sessionProgress(state)} label={t("lesson.progress")} />
      </header>

      {state.phase === "review-intro" ? (
        <main className="review-intro">
          <Mascot mood="thinking" size={120} />
          <h1>{t("lesson.review.title")}</h1>
          <p>{t("lesson.review.body", { n: state.queue.length })}</p>
          <button type="button" className="button primary" autoFocus onClick={() => dispatch({ type: "startReview", initialAnswer })}>
            {t("lesson.review.start")}
          </button>
        </main>
      ) : (
        <>
          <main className="lesson-body">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={item.key}
                initial={reduced ? false : { opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduced ? undefined : { opacity: 0, x: -24 }}
                transition={{ duration: 0.2 }}
              >
                {state.inReview && <p className="review-tag">{t("lesson.reviewTag")}</p>}
                <h1 className="prompt">
                  <RichText text={t(type.prompt(params))} />
                </h1>
                <View
                  params={params}
                  answer={state.answer}
                  feedback={state.feedback}
                  onAnswer={(answer: unknown) => dispatch({ type: "answer", answer })}
                />
              </motion.div>
            </AnimatePresence>
          </main>

          <footer className={`lesson-footer ${state.feedback ? (state.feedback.correct ? "is-right" : "is-wrong") : ""}`}>
            <AnimatePresence initial={false}>
              {state.feedback && (
                <motion.section
                  className="feedback"
                  aria-live="polite"
                  initial={reduced ? false : { y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 24 }}
                >
                  <Mascot mood={state.feedback.correct ? "happy" : "sad"} size={64} />
                  <div className="feedback-text">
                    <h2>{t(state.feedback.headline)}</h2>
                    {state.feedback.explanation.map((line, i) => (
                      <p key={i}>
                        <RichText text={t(line)} />
                      </p>
                    ))}
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
            <div className="footer-actions">
              {state.phase === "answering" ? (
                <button
                  type="button"
                  className="button primary"
                  disabled={state.answer === null || (type.ready ? !type.ready(state.answer) : false)}
                  onClick={() => dispatch({ type: "checked", feedback: type.check(params, state.answer) })}
                >
                  {t("lesson.check")}
                </button>
              ) : (
                <button
                  type="button"
                  className="button primary"
                  autoFocus
                  onClick={() => dispatch({ type: "continue", initialAnswer, reseed: randomSeed })}
                >
                  {t("lesson.continue")}
                </button>
              )}
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
