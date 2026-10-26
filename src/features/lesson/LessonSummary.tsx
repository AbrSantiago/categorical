import { Link } from "react-router";
import { lessonTitleId, type Lesson } from "../../content/lessons";
import { xpFor, type LessonResult } from "../../progress/model";
import { Confetti } from "../../ui/Confetti";
import { useI18n } from "../../settings/SettingsContext";
import { Mascot } from "../../ui/Mascot";

interface Props {
  lesson: Lesson;
  result: LessonResult;
  streak: number;
  onRestart?: () => void;
}

export function LessonSummary({ lesson, result, streak, onRestart }: Props) {
  const { t } = useI18n();
  const score = result.total ? result.firstTryCorrect / result.total : 0;
  const perfect = result.firstTryCorrect === result.total;
  const message = perfect
    ? t("summary.perfect")
    : score >= 0.6
      ? t("summary.good")
      : t("summary.hard");

  return (
    <main className="summary">
      {score >= 0.6 && <Confetti />}
      <Mascot mood={score >= 0.6 ? "happy" : "thinking"} size={132} />
      <h1>{t("summary.title", { lesson: t(lessonTitleId(lesson)) })}</h1>
      <p className="summary-message">{message}</p>
      <dl className="summary-stats">
        <div>
          <dt>{t("summary.firstTry")}</dt>
          <dd>
            {result.firstTryCorrect}/{result.total}
          </dd>
        </div>
        <div>
          <dt>{t("summary.xp")}</dt>
          <dd>+{xpFor(result)} XP</dd>
        </div>
        <div>
          <dt>{t("summary.streak")}</dt>
          <dd>{t("home.streak", { n: streak })}</dd>
        </div>
      </dl>
      <div className="summary-actions">
        <Link to="/" className="button primary">
          {t("summary.home")}
        </Link>
        {onRestart && (
          <button type="button" className="button ghost" onClick={onRestart}>
            {t("summary.again")}
          </button>
        )}
      </div>
    </main>
  );
}
