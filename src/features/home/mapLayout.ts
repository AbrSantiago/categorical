import { childrenOf, courses, getLesson, type AreaId, type Lesson } from "../../content/lessons";

/**
 * Layout of an area's lesson map, independent of the focus, so nodes never
 * jump around: only their size changes with the distance to the focus.
 *
 * Courses have a fixed shape (start → parallel branches → shared finish), so
 * the layout is fixed too: the start on top, each branch in its own column,
 * the finish at the bottom. Edges only run inside a column or fan out from
 * the start and back into the finish, so they can't cross.
 */
export interface MapNode {
  lesson: Lesson;
  row: number;
  /** Horizontal position, 0..1 of the map width. */
  x: number;
  /** Branch index, or null for the start and finish lessons (centered). */
  column: number | null;
}

export interface MapLayout {
  nodes: MapNode[];
  rows: number;
  columns: number;
  /** [from, to]: `to` requires `from`. */
  edges: [string, string][];
}

export function layoutMap(area: AreaId): MapLayout {
  const { start, branches, finish } = courses[area];
  const columns = branches.length;
  const longest = Math.max(...branches.map((b) => b.length));
  const node = (id: string, row: number, column: number | null): MapNode => ({
    lesson: getLesson(id)!,
    row,
    column,
    x: column === null ? 0.5 : (column + 0.5) / columns,
  });
  const nodes: MapNode[] = [
    node(start, 0, null),
    ...branches.flatMap((branch, c) => branch.map((id, i) => node(id, 1 + i, c))),
    ...finish.map((id, i) => node(id, 1 + longest + i, null)),
  ];
  const edges: [string, string][] = nodes.flatMap((n) => n.lesson.requires.map((r) => [r, n.lesson.id] as [string, string]));
  return { nodes, rows: 1 + longest + finish.length, columns, edges };
}

/** Steps between `from` and every connected lesson, ignoring edge direction. */
export function distancesFrom(from: string): Map<string, number> {
  const neighbors = (id: string) => [...(getLesson(id)?.requires ?? []), ...childrenOf(id).map((c) => c.id)];
  const dist = new Map([[from, 0]]);
  const queue = [from];
  while (queue.length) {
    const current = queue.shift()!;
    for (const n of neighbors(current)) {
      if (!dist.has(n)) {
        dist.set(n, dist.get(current)! + 1);
        queue.push(n);
      }
    }
  }
  return dist;
}

/** Every lesson `id` depends on, directly or not. */
export function ancestorsOf(id: string): Set<string> {
  const out = new Set<string>();
  const visit = (current: string) => {
    for (const r of getLesson(current)?.requires ?? []) {
      if (!out.has(r)) {
        out.add(r);
        visit(r);
      }
    }
  };
  visit(id);
  return out;
}

/** Every lesson that depends on `id`, directly or not. */
export function descendantsOf(id: string): Set<string> {
  const out = new Set<string>();
  const visit = (current: string) => {
    for (const c of childrenOf(current)) {
      if (!out.has(c.id)) {
        out.add(c.id);
        visit(c.id);
      }
    }
  };
  visit(id);
  return out;
}
