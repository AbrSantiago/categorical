import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import type { Catalog, Locale } from "./core/i18n";
import { HomePage } from "./features/home/HomePage";
import { LessonPage } from "./features/lesson/LessonPage";
import { ProgressProvider } from "./progress/ProgressContext";
import type { ProgressRepository } from "./progress/repository";
import { SettingsProvider } from "./settings/SettingsContext";

interface AppProps {
  progressRepository: ProgressRepository;
  catalogs: Record<Locale, Catalog>;
}

export function App({ progressRepository, catalogs }: AppProps) {
  return (
    <SettingsProvider catalogs={catalogs}>
      <ProgressProvider repository={progressRepository}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/lesson/:lessonId" element={<LessonPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ProgressProvider>
    </SettingsProvider>
  );
}
