import { useState } from "react";
import { Link } from "react-router";
import { currentStreak, dayKey } from "../../progress/model";
import { useProgress } from "../../progress/ProgressContext";
import { useI18n } from "../../settings/SettingsContext";
import { SettingsMenu } from "../../settings/SettingsMenu";

/** Brand (or a way back to the course list), streak, XP and settings. */
export function TopBar({ back = false }: { back?: boolean }) {
  const { progress } = useProgress();
  const { t } = useI18n();
  const [today] = useState(() => dayKey(new Date()));
  const streak = progress ? currentStreak(progress, today) : 0;
  return (
    <header className="topbar">
      {back ? (
        <Link to="/" className="back-link">
          <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
            <path d="M12.5 4 L6.5 10 L12.5 16" />
          </svg>
          {t("course.back")}
        </Link>
      ) : (
        <span className="brand">Categorical</span>
      )}
      <div className="topbar-end">
        <div className="stats" aria-label={t("home.progress")}>
          <span className="stat" title={t("home.streak.title")}>
            <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" className="stat-icon streak">
              <path d="M10 2 C11 6 15 7 15 12 A5 5 0 0 1 5 12 C5 9 7 8 7 5 C8 7 9 7 10 2 Z" />
            </svg>
            <span className="stat-full">{t("home.streak", { n: streak })}</span>
            <span className="stat-short" aria-hidden="true">
              {streak}
            </span>
          </span>
          <span className="stat" title={t("home.xp.title")}>
            <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" className="stat-icon xp">
              <path d="M10 2 L12.4 7.2 L18 7.8 L13.8 11.6 L15 17.2 L10 14.4 L5 17.2 L6.2 11.6 L2 7.8 L7.6 7.2 Z" />
            </svg>
            <span className="stat-full">{progress?.xp ?? 0} XP</span>
            <span className="stat-short" aria-hidden="true">
              {progress?.xp ?? 0}
            </span>
          </span>
        </div>
        <SettingsMenu />
      </div>
    </header>
  );
}
