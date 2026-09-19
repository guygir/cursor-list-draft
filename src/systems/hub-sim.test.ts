import { describe, expect, it } from "vitest";
import { KNESSET_SEATS } from "./seats";
import { createDraft } from "./draft";
import { resolveElection } from "./resolve";
import { playAllNoisy, runHubCell } from "./hub-sim";

describe("noisy hub grid", () => {
  it("fills lists and keeps 120 seats for a locked hub", () => {
    const finished = playAllNoisy(createDraft(1, 1, "open", "netanyahu"));
    const player = finished.lists.find((list) => list.isPlayer);
    expect(player?.picks[0]).toBe("netanyahu");
    expect(player?.picks).toHaveLength(10);
    expect(finished.lists.every((list) => list.picks.length === 10)).toBe(true);
    const result = resolveElection(finished.lists);
    expect(result.lists.reduce((sum, row) => sum + row.seats, 0)).toBe(KNESSET_SEATS);
  });

  it("is deterministic for the same seed and can differ across seeds", () => {
    const a = runHubCell("bennett", 2, "three", 1);
    const again = runHubCell("bennett", 2, "three", 1);
    expect(a.playerSeats).toBe(again.playerSeats);
    const seats = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((seed) => runHubCell("bennett", 2, "three", seed).playerSeats);
    expect(new Set(seats).size).toBeGreaterThan(1);
  });
});
