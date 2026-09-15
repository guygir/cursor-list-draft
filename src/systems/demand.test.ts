import { describe, expect, it } from "vitest";
import type { DraftList } from "../data/types";
import { listCentroid, placeList, splitNeighborhoodMass } from "./demand";

function list(id: string, picks: DraftList["picks"]): DraftList {
  return {
    id,
    labelHe: id,
    labelEn: id,
    picks,
    isPlayer: id === "player",
    draftOrder: id === "player" ? 0 : 1,
  };
}

describe("demand", () => {
  it("uses a rank-weighted centroid", () => {
    const c = listCentroid(["bennett", "deri"]);
    const equal = {
      x: (0.35 + 0.9) / 2,
      y: (0.25 + 0.75) / 2,
    };
    expect(c.x).not.toBeCloseTo(equal.x, 2);
    expect(c.x).toBeLessThan(equal.x);
  });

  it("lands Ben-Gvir + Smotrich on the small hard-right hill", () => {
    const place = placeList(list("a", ["ben-gvir", "smotrich"]));
    expect(place.neighborhood.id).toBe("hard-right");
    expect(place.massRaw).toBe(14);
  });

  it("splits a shared neighborhood equally", () => {
    const a = placeList(list("player", ["bennett", "lapid"]));
    const b = placeList(list("cpu-1", ["eisenkot", "gantz"]));
    expect(a.neighborhood.id).toBe("change-camp");
    expect(b.neighborhood.id).toBe("change-camp");
    const split = splitNeighborhoodMass([a, b]);
    expect(split[0]?.massAfterSplit).toBeCloseTo(16);
    expect(split[1]?.massAfterSplit).toBeCloseTo(16);
    expect(split[0]?.splitWith).toContain("cpu-1");
  });

  it("does not split lists on different hills", () => {
    const a = placeList(list("player", ["ben-gvir", "smotrich"]));
    const b = placeList(list("cpu-1", ["abbas"]));
    const split = splitNeighborhoodMass([a, b]);
    expect(split.find((s) => s.listId === "player")?.massAfterSplit).toBe(14);
    expect(split.find((s) => s.listId === "cpu-1")?.massAfterSplit).toBe(10);
  });
});
