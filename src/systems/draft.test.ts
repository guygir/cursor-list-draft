import { describe, expect, it } from "vitest";
import { getPerson } from "../data/pool";
import {
  applyCpuTurn,
  applyPick,
  createDraft,
  currentList,
  isDraftOver,
  legalRemaining,
  LIST_SIZE,
  slateCountOnList,
} from "./draft";

describe("snake draft", () => {
  it("is deterministic for the same player picks", () => {
    const a = play(["bennett", "lapid", "golan"], 1);
    const b = play(["bennett", "lapid", "golan"], 1);
    expect(a.lists.map((l) => l.picks)).toEqual(b.lists.map((l) => l.picks));
  });

  it("locks a hub as player slot 1 and lets the CPU pick next", () => {
    const state = createDraft(1, 1, "open", "golan");
    expect(state.lists[0]?.picks).toEqual(["golan"]);
    expect(state.remaining).not.toContain("golan");
    expect(currentList(state)?.isPlayer).toBe(false);
    const after = applyCpuTurn(state);
    expect(after.lists.find((list) => !list.isPlayer)?.picks).toHaveLength(1);
    expect(after.lists[0]?.picks).toEqual(["golan"]);
  });

  it("fills two lists of 10 against one CPU and leaves a leftover pool", () => {
    const end = play(["bennett", "lapid", "golan", "gantz", "liberman", "abbas"], 1);
    expect(isDraftOver(end)).toBe(true);
    expect(end.lists[0]?.picks).toHaveLength(LIST_SIZE);
    expect(end.lists[1]?.picks).toHaveLength(LIST_SIZE);
    expect(end.remaining.length).toBeGreaterThan(0);
  });

  it("fills three lists of 10 against two CPUs", () => {
    const end = play(["bennett", "lapid", "golan", "gantz", "liberman", "abbas"], 2);
    expect(isDraftOver(end)).toBe(true);
    expect(end.lists.every((list) => list.picks.length === LIST_SIZE)).toBe(true);
  });

  it("removes a name from the pool after the player or a CPU takes it", () => {
    let state = createDraft(1);
    state = applyPick(state, "netanyahu");
    expect(state.remaining).not.toContain("netanyahu");
    expect(state.lists.flatMap((list) => list.picks)).toContain("netanyahu");

    const afterCpu = applyCpuTurn(state);
    const cpuPick = afterCpu.lists.find((list) => !list.isPlayer)?.picks[0];
    expect(cpuPick).toBeTruthy();
    expect(afterCpu.remaining).not.toContain(cpuPick);
    expect(afterCpu.remaining).not.toContain("netanyahu");
    const taken = afterCpu.lists.flatMap((list) => list.picks);
    expect(new Set(taken).size).toBe(taken.length);
    expect(taken.every((id) => !afterCpu.remaining.includes(id))).toBe(true);
  });

  it("one-per-party blocks a second name from the same slate", () => {
    let state = createDraft(1, 1, "one");
    state = applyPick(state, "netanyahu");
    while (currentList(state) && !currentList(state)!.isPlayer) {
      state = applyCpuTurn(state);
    }
    const second = state.remaining.find((id) => getPerson(id).slateId === "likud");
    expect(second).toBeTruthy();
    const blocked = applyPick(state, second!);
    expect(blocked.lists.find((list) => list.isPlayer)?.picks).toEqual(["netanyahu"]);
    expect(blocked.remaining).toContain(second);
    expect(blocked.turnCursor).toBe(state.turnCursor);
  });

  it.each([
    ["three", 3],
    ["one", 1],
  ] as const)("%s keeps every list at most %s per party", (difficulty, cap) => {
    const end = play(["bennett", "lapid", "golan", "gantz", "liberman", "abbas"], 1, difficulty);
    expect(isDraftOver(end)).toBe(true);
    for (const list of end.lists) {
      expect(list.picks.length).toBe(LIST_SIZE);
      for (const id of list.picks) {
        expect(slateCountOnList(list.picks, getPerson(id).slateId)).toBeLessThanOrEqual(cap);
      }
    }
  });
});

function play(playerPicks: string[], cpus: number, difficulty: "open" | "three" | "one" = "open") {
  let state = createDraft(cpus, 1, difficulty);
  while (!isDraftOver(state)) {
    const list = state.lists[state.turnQueue[state.turnCursor] ?? 0];
    if (list?.isPlayer) {
      const legal = legalRemaining(list.picks, state.remaining, state.slateCap);
      const next = playerPicks.find((id) => legal.includes(id as never)) ?? legal[0];
      if (!next) break;
      state = applyPick(state, next as never);
    } else {
      state = applyCpuTurn(state);
    }
  }
  return state;
}
