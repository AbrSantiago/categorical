import { Link, Navigate, useParams } from "react-router";
import { COURSE_IDS, lastOf, lessonsOf, lessonTitleId, recommendedLesson, type CourseId } from "../../content/lessons";
import { useProgress } from "../../progress/ProgressContext";
import { useI18n } from "../../settings/SettingsContext";
import { HeroCat } from "./HeroCat";
import { SkillTree } from "./SkillTree";
import { TopBar } from "./TopBar";

const isCourse = (value: string | undefined): value is CourseId => COURSE_IDS.includes(value as CourseId);

/** One course: its pitch, a button to the next lesson and the lesson map. */
export function CoursePage() {
  const { courseId } = useParams();
  if (!isCourse(courseId)) return <Navigate to="/" replace />;
  return <Course course={courseId} />;
}

function Course({ course }: { course: CourseId }) {
  const { progress } = useProgress();
  const { t } = useI18n();
  const own = lessonsOf(course);
  const completed = own.filter((l) => progress?.lessons[l.id]).length;
  const allDone = completed >= own.length;
  const next = recommendedLesson((id) => Boolean(progress?.lessons[id]), course);
  const nextTitle = t(lessonTitleId(next));
  const cta = allDone
    ? t("home.cta.review")
    : completed === 0
      ? t("home.cta.start", { lesson: nextTitle })
      : t("home.cta.continue", { lesson: nextTitle });

  return (
    <div className="home">
      <TopBar back />
      <section className="hero">
        <HeroCat key={course} course={course} />
        <div className="hero-copy">
          <p className="hero-kicker">{t(`course.${course}.title`)}</p>
          <h1>{t(`course.${course}.headline`)}</h1>
          <p>{t(`course.${course}.body`)}</p>
          <Link to={`/lesson/${allDone ? lastOf(course).id : next.id}`} className="button primary">
            {cta}
          </Link>
        </div>
      </section>
      <SkillTree progress={progress} course={course} />
    </div>
  );
}
