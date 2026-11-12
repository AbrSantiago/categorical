import { AREAS, type AreaId } from "../../content/lessons";

/** The area someone was last looking at, so "/" opens it again. Per device, best effort. */
const KEY = "categorical.area.v1";

export function loadLastArea(): AreaId {
  try {
    const raw = window.localStorage.getItem(KEY);
    return AREAS.includes(raw as AreaId) ? (raw as AreaId) : "stats";
  } catch {
    return "stats";
  }
}

export function saveLastArea(area: AreaId): void {
  try {
    window.localStorage.setItem(KEY, area);
  } catch {
    // Blocked storage: "/" falls back to statistics.
  }
}

export const isArea = (value: string | undefined): value is AreaId => AREAS.includes(value as AreaId);
