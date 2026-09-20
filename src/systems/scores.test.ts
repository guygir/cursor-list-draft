import { describe, expect, it } from "vitest";
import type { DraftList } from "../data/types";
import { DEMAND_SCALE, listMeters } from "./scores";

function list(id: string, picks: DraftList["picks"]): DraftList {
  return {
    id,
    labelHe: id,
    labelEn: id,
    picks,
    isPlayer: id === "player",
    draftOrder: 0,
  };
}

describe("score meters", () => {
  it("starts empty at 0/0 and a lone hub is full credibility", () => {
    const empty = listMeters(list("player", []), [list("player", [])]);
    expect(empty.cohesionPct).toBe(0);
    expect(empty.demandPct).toBe(0);
    const solo = listMeters(list("player", ["netanyahu"]), [list("player", ["netanyahu"])]);
    expect(solo.cohesionPct).toBe(100);
    expect(solo.demandPct).toBe(100);
  });

  it("maps cohesion to 0–100 and demand against the largest toy hill", () => {
    expect(DEMAND_SCALE).toBe(38);
    const meters = listMeters(list("player", ["ben-gvir", "smotrich"]), [
      list("player", ["ben-gvir", "smotrich"]),
    ]);
    expect(meters.cohesionPct).toBeGreaterThan(80);
    expect(meters.cohesionPct).toBeLessThanOrEqual(100);
    expect(meters.demandPct).toBe(Math.round((14 / 38) * 100));
  });

  it("moves the credibility meter when the ticket goes to war", () => {
    const clean = listMeters(list("player", ["bennett", "lapid"]), [
      list("player", ["bennett", "lapid"]),
    ]);
    const war = listMeters(list("player", ["bennett", "deri"]), [
      list("player", ["bennett", "deri"]),
    ]);
    const niche = listMeters(list("player", ["ben-gvir", "smotrich"]), [
      list("player", ["ben-gvir", "smotrich"]),
    ]);
    expect(war.cohesionPct).toBeLessThan(clean.cohesionPct);
    expect(niche.demandPct).toBeLessThan(clean.demandPct);
  });
});
