import { applyLessonResult, emptyProgress, type LessonResult, type Progress } from "./model";

/**
 * Where progress lives. The app only talks to this interface, so moving from
 * localStorage to a backend means writing one new implementation
 * (e.g. `createApiProgressRepository(baseUrl, token)`) and swapping it in
 * `main.tsx` — no component changes.
 */
export interface ProgressRepository {
  load(): Promise<Progress>;
  recordLessonResult(result: LessonResult): Promise<Progress>;
  reset(): Promise<Progress>;
}

const STORAGE_KEY = "categorical.progress.v1";

export function createLocalProgressRepository(
  storage: Pick<Storage, "getItem" | "setItem" | "removeItem"> | null = safeLocalStorage(),
  clock: () => Date = () => new Date(),
): ProgressRepository {
  let memory = emptyProgress(); // fallback when storage is unavailable (private mode, tests)

  function read(): Progress {
    if (!storage) return memory;
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) return emptyProgress();
      const parsed = JSON.parse(raw) as Progress;
      return parsed.version === 1 ? parsed : emptyProgress();
    } catch {
      return emptyProgress();
    }
  }

  function write(progress: Progress): void {
    memory = progress;
    if (!storage) return;
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Storage full or blocked: keep the in-memory copy for this session.
    }
  }

  return {
    async load() {
      return read();
    },
    async recordLessonResult(result) {
      const next = applyLessonResult(read(), result, clock());
      write(next);
      return next;
    },
    async reset() {
      const fresh = emptyProgress();
      write(fresh);
      return fresh;
    },
  };
}

function safeLocalStorage(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}
