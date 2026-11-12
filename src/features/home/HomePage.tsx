import { Link } from "react-router";
import { COURSE_IDS, lessonsOf, lessonTitleId, recommendedLesson, type CourseId } from "../../content/lessons";
import { useProgress } from "../../progress/ProgressContext";
import { useI18n } from "../../settings/SettingsContext";
import { CourseIcon } from "./CourseIcon";
import { TopBar } from "./TopBar";

/**
 * The main menu: every course, with how far along you are. Courses are a
 * list that can keep growing; each one opens its own lesson map.
 */
export function HomePage() {
  const { t } = useI18n();
  return (
    <div className="home">
      <TopBar />
      <section className="menu-head">
        <h1>{t("menu.title")}</h1>
        <p>{t("menu.lead")}</p>
      </section>
      <ul className="course-list">
        {COURSE_IDS.map((id) => (
          <li key={id}>
            <CourseCard course={id} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function CourseCard({ course }: { course: CourseId }) {
  const { t } = useI18n();
  const { progress } = useProgress();
  const done = (id: string) => Boolean(progress?.lessons[id]);
  const own = lessonsOf(course);
  const completed = own.filter((l) => done(l.id)).length;
  const status =
    completed === 0
      ? t("menu.new")
      : completed === own.length
        ? t("menu.finished")
        : t("menu.next", { lesson: t(lessonTitleId(recommendedLesson(done, course))) });
  return (
    <Link to={`/course/${course}`} className={`course-card is-${course}`}>
      <span className="course-art">
        <CourseIcon course={course} />
      </span>
      <span className="course-text">
        <span className="course-title">{t(`course.${course}.title`)}</span>
        <span className="course-tagline">{t(`course.${course}.tagline`)}</span>
        <span className="course-progress">
          <span className="course-bar" aria-hidden="true">
            <span style={{ width: `${(100 * completed) / own.length}%` }} />
          </span>
          <span>{t("menu.progress", { done: completed, total: own.length })}</span>
        </span>
        <span className="course-status">{status}</span>
      </span>
      <svg className="course-go" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
        <path d="M7.5 4 L13.5 10 L7.5 16" />
      </svg>
    </Link>
  );
}
