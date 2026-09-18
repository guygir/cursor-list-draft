import { describe, expect, it } from "vitest";
import type { DraftList } from "../data/types";
import { chooseCpuCandidate, greedyCpuPick, type CpuCandidate } from "./cpu";
import { createDraft } from "./draft";

function list(id: string, picks: string[]): DraftList {
  return {
    id,
    labelHe: id,
    labelEn: id,
    picks,
    isPlayer: false,
    draftOrder: 1,
  };
}

describe("CPU pick", () => {
  it("always takes the greedy max", () => {
    const ranked: CpuCandidate[] = [
      { id: "a", score: 10, draw: 1 },
      { id: "b", score: 9.6, draw: 0.7 },
      { id: "c", score: 3, draw: 0.4 },
    ];
    expect(chooseCpuCandidate(ranked)).toBe("a");
  });

  it("still returns a remaining name for a live list", () => {
    const draft = createDraft(1, 1);
    const cpu = list("cpu-1", []);
    const pick = greedyCpuPick(cpu, [cpu], draft.remaining);
    expect(draft.remaining).toContain(pick);
  });

  it("will not crack a Bibi ticket for a high-draw change-camp star", () => {
    const cpu = list("cpu-1", ["netanyahu", "ohana"]);
    const pick = greedyCpuPick(cpu, [cpu], ["bennett", "ben-gvir", "golan", "deri", "smotrich"]);
    expect(["ben-gvir", "smotrich", "deri"]).toContain(pick);
    expect(pick).not.toBe("bennett");
    expect(pick).not.toBe("golan");
  });
});
