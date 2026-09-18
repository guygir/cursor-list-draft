import { describe, expect, it } from "vitest";
import { memoryStore, recordRun } from "./board";
import { mergeBoards, readVisibleBoard, sanitizePostedEntry, writeRemoteCache } from "./board-api";

describe("remote board merge", () => {
  it("shows local rows immediately and overlays remote without a spinner", () => {
    const store = memoryStore();
    const local = recordRun(
      { mode: "draft", hubName: "מקומי", seats: 10, cohesion: 0.4, demand: 20, won: false, nCpus: 1, difficulty: "open", share: "/" },
      store,
    );
    writeRemoteCache(
      [
        { id: "remote-1", at: 1, mode: "draft", hubName: "רחוק", seats: 40, cohesion: 0.9, demand: 50, won: true, nCpus: 1, difficulty: "open", share: "/" },
      ],
      store,
    );
    const visible = readVisibleBoard(store);
    expect(visible[0]?.hubName).toBe("רחוק");
    expect(visible.some((row) => row.id === local.id)).toBe(true);
  });

  it("rejects a junk post so the API cannot invent a score", () => {
    expect(sanitizePostedEntry({ seats: 99 })).toBeNull();
    expect(sanitizePostedEntry({ id: "x", at: 1, mode: "draft", hubName: "", seats: 10, cohesion: 1, demand: 1, won: false, nCpus: 1, difficulty: "open", share: "/" })).toBeNull();
    const ok = sanitizePostedEntry({
      id: "ok",
      at: 1,
      mode: "daily",
      dayKey: "2026-09-18",
      hubName: "גולן",
      seats: 200,
      cohesion: 2,
      demand: 3,
      won: true,
      nCpus: 9,
      difficulty: "open",
      share: "/",
    });
    expect(ok?.seats).toBe(120);
    expect(ok?.cohesion).toBe(1);
    expect(ok?.nCpus).toBe(3);
  });

  it("keeps the higher local row when ids match", () => {
    const merged = mergeBoards(
      [{ id: "a", at: 2, mode: "draft", hubName: "חדש", seats: 12, cohesion: 0.2, demand: 1, won: false, nCpus: 1, difficulty: "open", share: "/" }],
      [{ id: "a", at: 1, mode: "draft", hubName: "ישן", seats: 8, cohesion: 0.1, demand: 1, won: false, nCpus: 1, difficulty: "open", share: "/" }],
    );
    expect(merged).toHaveLength(1);
    expect(merged[0]?.hubName).toBe("חדש");
  });
});
