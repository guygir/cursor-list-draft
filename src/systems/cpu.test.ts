import { describe, expect, it } from "vitest";
import type { DraftList } from "../data/types";
import { chooseCpuCandidate, chooseNoisyCandidate, greedyCpuPick, mulberry32, type CpuCandidate } from "./cpu";
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

  it("rolls 35/25/15/25 over the ranked list", () => {
    const ranked: CpuCandidate[] = [
      { id: "a", score: 10, draw: 1 },
      { id: "b", score: 9, draw: 0.7 },
      { id: "c", score: 8, draw: 0.4 },
      { id: "d", score: 1, draw: 0.2 },
    ];
    const counts = { a: 0, b: 0, c: 0, d: 0 };
    const rand = mulberry32(7);
    for (let i = 0; i < 8000; i++) {
      const id = chooseNoisyCandidate(ranked, rand);
      counts[id as keyof typeof counts] += 1;
    }
    expect(counts.a / 8000).toBeGreaterThan(0.38);
    expect(counts.a / 8000).toBeLessThan(0.62);
    expect(counts.b / 8000).toBeGreaterThan(0.18);
    expect(counts.b / 8000).toBeLessThan(0.38);
    expect(counts.c / 8000).toBeGreaterThan(0.1);
    expect(counts.d / 8000).toBeGreaterThan(0.03);
  });

  it("will not crack a Bibi ticket for a high-draw change-camp star", () => {
    const cpu = list("cpu-1", ["netanyahu", "ohana"]);
    const pick = greedyCpuPick(cpu, [cpu], ["bennett", "ben-gvir", "golan", "deri", "smotrich"]);
    expect(["ben-gvir", "smotrich", "deri"]).toContain(pick);
    expect(pick).not.toBe("bennett");
    expect(pick).not.toBe("golan");
  });
});
