import { describe, expect, it } from "vitest";
import { boardForMode, memoryStore, rankOf, readBoard, recordRun, sortBoard } from "./board";

describe("local leaderboard", () => {
  it("ranks by seats then cohesion and stays on the device store", () => {
    const store = memoryStore();
    recordRun(
      { mode: "daily", dayKey: "2026-09-18", hubName: "גולן", seats: 12, cohesion: 0.8, demand: 40, won: false, nCpus: 1, difficulty: "open", share: "?day=2026-09-18" },
      store,
    );
    const best = recordRun(
      { mode: "daily", dayKey: "2026-09-18", hubName: "גולן", seats: 28, cohesion: 0.9, demand: 50, won: true, nCpus: 1, difficulty: "open", share: "?day=2026-09-18" },
      store,
    );
    recordRun(
      { mode: "create", hubName: "איתי", seats: 40, cohesion: 0.5, demand: 70, won: true, nCpus: 1, difficulty: "open", share: "?c=x" },
      store,
    );
    const daily = boardForMode(readBoard(store), "daily", "2026-09-18");
    expect(daily).toHaveLength(2);
    expect(daily[0]?.seats).toBe(28);
    expect(rankOf(daily, best.id)).toBe(1);
    expect(sortBoard(readBoard(store))[0]?.hubName).toBe("איתי");
  });

  it("does not invent a global player count", () => {
    const rows = readBoard(memoryStore());
    expect(rows).toEqual([]);
  });
});
