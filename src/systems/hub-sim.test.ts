import { describe, expect, it } from "vitest";
import { KNESSET_SEATS } from "./seats";
import { createDraft } from "./draft";
import { resolveElection } from "./resolve";
import { playAllGreedy, runHubCell } from "./hub-sim";

describe("greedy hub grid", () => {
  it("fills lists and keeps 120 seats for a locked hub", () => {
    const finished = playAllGreedy(createDraft(1, 1, "open", "netanyahu"));
    const player = finished.lists.find((list) => list.isPlayer);
    expect(player?.picks[0]).toBe("netanyahu");
    expect(player?.picks).toHaveLength(10);
    expect(finished.lists.every((list) => list.picks.length === 10)).toBe(true);
    const result = resolveElection(finished.lists);
    expect(result.lists.reduce((sum, row) => sum + row.seats, 0)).toBe(KNESSET_SEATS);
  });

  it("is deterministic for the same hub and settings", () => {
    const a = runHubCell("bennett", 2, "three", 1);
    const b = runHubCell("bennett", 2, "three", 99);
    expect(a.playerSeats).toBe(b.playerSeats);
    expect(a.neighborhoodHe).toBe(b.neighborhoodHe);
  });
});
