import { describe, expect, it } from "vitest";
import { hintFor, polygonLayout, polygonPoints } from "./tree";

describe("constellation polygons", () => {
  it("puts three nodes on a triangle and ten on one decagon", () => {
    expect(polygonLayout(3).count).toBe(3);
    expect(polygonPoints(3, 120)).toHaveLength(3);
    const ten = polygonPoints(10, 150);
    expect(ten).toHaveLength(10);
    const xs = new Set(ten.map((p) => p.x.toFixed(1)));
    expect(xs.size).toBeGreaterThan(2);
  });

  it("keeps a single hub at the center", () => {
    const one = polygonPoints(1, 0);
    expect(one).toEqual([{ x: 210, y: 200 }]);
  });

  it("labels the hover concat so the four bits are readable", () => {
    expect(hintFor("sukkot", ["liberman"])).toMatch(/מול הרשימה:/);
    expect(hintFor("sukkot", ["liberman"])).toMatch(/בולט:/);
    expect(hintFor("sukkot", ["liberman"])).toMatch(/גבעה:/);
    expect(hintFor("netanyahu", ["netanyahu"])).toMatch(/בולט:/);
  });
});
