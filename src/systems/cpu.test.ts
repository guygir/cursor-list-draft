import { describe, expect, it } from "vitest";
import type { DraftList } from "../data/types";
import { chooseCpuCandidate, GREEDY_RATE, greedyCpuPick, type CpuCandidate } from "./cpu";
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
  it("takes the greedy max on the main path", () => {
    const ranked: CpuCandidate[] = [
      { id: "a", score: 10, draw: 1 },
      { id: "b", score: 8, draw: 0.7 },
      { id: "c", score: 3, draw: 0.4 },
    ];
    expect(chooseCpuCandidate(ranked, 0)).toBe("a");
    expect(chooseCpuCandidate(ranked, GREEDY_RATE - 0.001)).toBe("a");
  });

  it("only randomizes among near-ties", () => {
    const ranked: CpuCandidate[] = [
      { id: "a", score: 10, draw: 1 },
      { id: "b", score: 9.6, draw: 0.7 },
      { id: "c", score: 3, draw: 0.4 },
    ];
    const noisy = [0.92, 0.96, 0.999].map((rand) => chooseCpuCandidate(ranked, rand));
    expect(noisy.every((id) => id === "a" || id === "b")).toBe(true);
    expect(noisy).not.toContain("c");
  });

  it("still returns a remaining name for a live list", () => {
    const draft = createDraft(1, 1);
    const cpu = list("cpu-1", []);
    const pick = greedyCpuPick(cpu, [cpu], draft.remaining, 0);
    expect(draft.remaining).toContain(pick);
  });

  it("will not crack a Bibi ticket for a high-draw change-camp star", () => {
    const cpu = list("cpu-1", ["netanyahu", "ohana"]);
    const pick = greedyCpuPick(cpu, [cpu], ["bennett", "ben-gvir", "golan", "deri", "smotrich"], 0);
    expect(["ben-gvir", "smotrich", "deri"]).toContain(pick);
    expect(pick).not.toBe("bennett");
    expect(pick).not.toBe("golan");
  });
});
