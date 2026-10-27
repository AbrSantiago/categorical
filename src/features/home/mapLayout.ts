import { childrenOf, lessons, type Lesson } from "../../content/lessons";

/**
 * Layout of the whole lesson map, independent of the focus, so nodes never
 * jump around: only their size changes with the distance to the focus.
 *
 * Rows are depths (longest chain of requirements from the start), and inside
 * each row nodes are ordered by the average position of what they require,
 * which keeps most edges short and uncrossed.
 */
export interface MapNode {
  lesson: Lesson;
  row: number;
  /** Horizontal position, 0..1 of the map width. */
  x: number;
}

export interface MapLayout {
  nodes: MapNode[];
  rows: number;
  /** [from, to]: `to` requires `from`. */
  edges: [string, string][];
}

export function layoutMap(all: Lesson[] = lessons): MapLayout {
  const byId = new Map(all.map((l) => [l.id, l]));
  const depth = new Map<string, number>();
  const depthOf = (id: string): number => {
    const cached = depth.get(id);
    if (cached !== undefined) return cached;
    const lesson = byId.get(id)!;
    const d = lesson.requires.length ? 1 + Math.max(...lesson.requires.map(depthOf)) : 0;
    depth.set(id, d);
    return d;
  };
  all.forEach((l) => depthOf(l.id));

  const rows = Math.max(...depth.values()) + 1;
  const rowsOf = Array.from({ length: rows }, (_, r) => all.filter((l) => depth.get(l.id) === r));
  const widest = Math.max(...rowsOf.map((r) => r.length));
  const gap = 1 / widest;
  const x = new Map<string, number>();
  const kids = (id: string) => all.filter((l) => l.requires.includes(id)).map((l) => l.id);
  const avg = (ids: string[], fallback: number) =>
    ids.length ? ids.reduce((acc, id) => acc + (x.get(id) ?? fallback), 0) / ids.length : fallback;

  /** Sort a row by a key, then place it as close to its ideal spots as the minimum gap allows. */
  const place = (row: Lesson[], ideal: (l: Lesson) => number) => {
    // Ties keep the current left-to-right order, so one sweep doesn't undo the previous one.
    const ordered = row
      .map((l) => ({ l, c: ideal(l), now: x.get(l.id)! }))
      .sort((a, b) => a.c - b.c || a.now - b.now);
    const xs = ordered.map((e) => e.c);
    for (let i = 1; i < xs.length; i++) xs[i] = Math.max(xs[i], xs[i - 1] + gap);
    xs[xs.length - 1] = Math.min(xs[xs.length - 1], 1 - gap / 2);
    for (let i = xs.length - 2; i >= 0; i--) xs[i] = Math.min(xs[i], xs[i + 1] - gap);
    xs[0] = Math.max(xs[0], gap / 2);
    for (let i = 1; i < xs.length; i++) xs[i] = Math.max(xs[i], xs[i - 1] + gap);
    ordered.forEach((e, i) => x.set(e.l.id, xs[i]));
    return ordered.map((e) => e.l);
  };

  // Start evenly spread in list order, then sweep down (follow parents) and up (follow children).
  rowsOf.forEach((row) => row.forEach((l, i) => x.set(l.id, (i + 0.5) / row.length)));
  for (let pass = 0; pass < 3; pass++) {
    for (let r = 1; r < rows; r++) place(rowsOf[r], (l) => avg(l.requires, 0.5));
    for (let r = rows - 2; r >= 0; r--) place(rowsOf[r], (l) => avg(kids(l.id), x.get(l.id)!));
  }
  for (let r = 1; r < rows; r++) place(rowsOf[r], (l) => avg(l.requires, 0.5));
  const nodes: MapNode[] = rowsOf.flatMap((row, r) => row.map((l) => ({ lesson: l, row: r, x: x.get(l.id)! })));

  const edges: [string, string][] = all.flatMap((l) => l.requires.map((r) => [r, l.id] as [string, string]));
  return { nodes, rows, edges };
}

/** Steps between `from` and every lesson, ignoring edge direction. */
export function distancesFrom(from: string, all: Lesson[] = lessons): Map<string, number> {
  const neighbors = (id: string) => [
    ...(all.find((l) => l.id === id)?.requires ?? []),
    ...childrenOf(id).map((c) => c.id),
  ];
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
export function ancestorsOf(id: string, all: Lesson[] = lessons): Set<string> {
  const out = new Set<string>();
  const visit = (current: string) => {
    for (const r of all.find((l) => l.id === current)?.requires ?? []) {
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
