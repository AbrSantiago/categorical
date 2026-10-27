import { describe, expect, it } from "vitest";
import { lessons, rootLesson } from "../../content/lessons";
import { ancestorsOf, descendantsOf, distancesFrom, layoutMap } from "./mapLayout";

describe("lesson map layout", () => {
  const layout = layoutMap();

  it("places every lesson exactly once, inside the map", () => {
    expect(layout.nodes.map((n) => n.lesson.id).sort()).toEqual(lessons.map((l) => l.id).sort());
    for (const n of layout.nodes) {
      expect(n.x).toBeGreaterThan(0);
      expect(n.x).toBeLessThan(1);
    }
  });

  it("puts every lesson below everything it requires", () => {
    const row = new Map(layout.nodes.map((n) => [n.lesson.id, n.row]));
    for (const [from, to] of layout.edges) expect(row.get(to)!).toBeGreaterThan(row.get(from)!);
    expect(row.get(rootLesson.id)).toBe(0);
  });

  it("keeps rows narrow enough for a phone", () => {
    for (let r = 0; r < layout.rows; r++) expect(layout.nodes.filter((n) => n.row === r).length).toBeLessThanOrEqual(5);
  });

  it("measures distance in steps, both ways", () => {
    const d = distancesFrom("formas-3");
    expect(d.get("formas-3")).toBe(0);
    expect(d.get("formas")).toBe(1);
    expect(d.get("formas-4")).toBe(1);
    expect(d.get("la-normal")).toBe(2);
    expect(d.size).toBe(lessons.length);
  });

  it("finds ancestors and descendants", () => {
    expect([...ancestorsOf("examen-formas")].sort()).toEqual(["formas", "formas-2", "formas-3", "formas-4"]);
    expect(descendantsOf("repaso").size).toBe(0);
    expect(descendantsOf(rootLesson.id).size).toBe(lessons.length - 1);
  });
});
