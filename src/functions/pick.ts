import type { Rng } from "../core/random";
import { FAMILIES, FAMILY_IDS, type FamilyId } from "./families";

/** The lesson's families, or all of them. */
export function familyPool(pool: string[] | undefined, fallback: FamilyId[] = FAMILY_IDS): FamilyId[] {
  const valid = (pool ?? []).filter((id): id is FamilyId => id in FAMILIES);
  return valid.length ? valid : fallback;
}

/** n wrong families, look-alikes first. */
export function pickFamilyDistractors(rng: Rng, truth: FamilyId, n: number, pool: FamilyId[]): FamilyId[] {
  const similar = rng.shuffle(FAMILIES[truth].similar);
  const rest = rng.shuffle([...pool, ...FAMILY_IDS].filter((id) => !similar.includes(id)));
  return [...new Set([...similar, ...rest])].filter((id) => id !== truth).slice(0, n);
}
