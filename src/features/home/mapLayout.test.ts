import { describe, expect, it } from "vitest";
import { COURSE_IDS, lessonsOf, MAX_BRANCHES, rootOf } from "../../content/lessons";
import { ancestorsOf, descendantsOf, layoutMap } from "./mapLayout";

type P = { x: number; y: number };

/** Proper crossing of two segments (touching at a shared end doesn't count). */
function crosses(a: P, b: P, c: P, d: P): boolean {
  const cross = (o: P, p: P, q: P) => (p.x - o.x) * (q.y - o.y) - (p.y - o.y) * (q.x - o.x);
  const d1 = cross(c, d, a);
  const d2 = cross(c, d, b);
  const d3 = cross(a, b, c);
  const d4 = cross(a, b, d);
  return d1 * d2 < 0 && d3 * d4 < 0;
}

describe.each(COURSE_IDS)("lesson map layout (%s)", (course) => {
  const layout = layoutMap(course);
  const pos = new Map(layout.nodes.map((n) => [n.lesson.id, { x: n.x, y: n.row }]));

  it("places every lesson of the course exactly once, inside the map", () => {
    expect(layout.nodes.map((n) => n.lesson.id).sort()).toEqual(lessonsOf(course).map((l) => l.id).sort());
    for (const n of layout.nodes) {
      expect(n.x).toBeGreaterThan(0);
      expect(n.x).toBeLessThan(1);
    }
    const spots = layout.nodes.map((n) => `${n.row}:${n.x}`);
    expect(new Set(spots).size).toBe(spots.length);
  });

  it("puts every lesson below everything it requires", () => {
    for (const [from, to] of layout.edges) expect(pos.get(to)!.y).toBeGreaterThan(pos.get(from)!.y);
    expect(pos.get(rootOf(course).id)!.y).toBe(0);
  });

  it("keeps each branch in one column", () => {
    for (const [from, to] of layout.edges) {
      const a = layout.nodes.find((n) => n.lesson.id === from)!;
      const b = layout.nodes.find((n) => n.lesson.id === to)!;
      if (a.column !== null && b.column !== null) expect(a.column).toBe(b.column);
    }
    expect(layout.columns).toBeLessThanOrEqual(MAX_BRANCHES);
  });

  it("has no crossing edges", () => {
    const segs = layout.edges.map(([f, t]) => [pos.get(f)!, pos.get(t)!] as const);
    for (let i = 0; i < segs.length; i++)
      for (let j = i + 1; j < segs.length; j++)
        expect(crosses(segs[i][0], segs[i][1], segs[j][0], segs[j][1]), `${layout.edges[i]} × ${layout.edges[j]}`).toBe(false);
  });
});

describe("map lineage", () => {
  it("finds ancestors and descendants", () => {
    expect([...ancestorsOf("ajuste-2")].sort()).toEqual(["formas", "formas-3", "parametros-2"]);
    expect(descendantsOf("repaso").size).toBe(0);
    expect(descendantsOf("formas").size).toBe(lessonsOf("stats").length - 1);
  });
});
