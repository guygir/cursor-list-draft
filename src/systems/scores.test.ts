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
  it("maps cohesion to 0–100 and demand against the largest toy hill", () => {
    expect(DEMAND_SCALE).toBe(38);
    const meters = listMeters(list("player", ["ben-gvir", "smotrich"]), [
      list("player", ["ben-gvir", "smotrich"]),
    ]);
    expect(meters.cohesionPct).toBeGreaterThan(80);
    expect(meters.cohesionPct).toBeLessThanOrEqual(100);
    expect(meters.demandPct).toBe(Math.round((14 / 38) * 100));
  });

  it("moves both meters when the ticket changes", () => {
    const clean = listMeters(list("player", ["bennett", "lapid"]), [
      list("player", ["bennett", "lapid"]),
    ]);
    const war = listMeters(list("player", ["bennett", "deri"]), [
      list("player", ["bennett", "deri"]),
    ]);
    expect(war.cohesionPct).toBeLessThan(clean.cohesionPct);
    expect(war.demandPct).not.toBe(clean.demandPct);
  });
});
