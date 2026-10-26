import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { LessonResult, Progress } from "./model";
import type { ProgressRepository } from "./repository";

interface ProgressContextValue {
  /** null while loading. */
  progress: Progress | null;
  recordLessonResult(result: LessonResult): Promise<Progress>;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ repository, children }: { repository: ProgressRepository; children: ReactNode }) {
  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect(() => {
    let cancelled = false;
    repository.load().then((p) => {
      if (!cancelled) setProgress(p);
    });
    return () => {
      cancelled = true;
    };
  }, [repository]);

  const recordLessonResult = useCallback(
    async (result: LessonResult) => {
      const next = await repository.recordLessonResult(result);
      setProgress(next);
      return next;
    },
    [repository],
  );

  const value = useMemo(() => ({ progress, recordLessonResult }), [progress, recordLessonResult]);
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

// oxlint-disable-next-line react/only-export-components
export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used inside <ProgressProvider>");
  return ctx;
}
