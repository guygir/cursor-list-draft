import { describe, expect, it } from "vitest";
import { getPerson } from "../data/pool";
import { applyCpuTurn, applyPick, createDraft, currentList, HARD_SLATE_CAP, isDraftOver, legalRemaining, slateCountOnList } from "./draft";

describe("snake draft", () => {
  it("is deterministic for the same player picks", () => {
    const a = play(["bennett", "lapid", "golan"], 1);
    const b = play(["bennett", "lapid", "golan"], 1);
    expect(a.lists.map((l) => l.picks)).toEqual(b.lists.map((l) => l.picks));
  });

  it("fills two lists of 6 against one CPU and leaves a leftover pool", () => {
    const end = play(["bennett", "lapid", "golan", "gantz", "liberman", "abbas"], 1);
    expect(isDraftOver(end)).toBe(true);
    expect(end.lists[0]?.picks).toHaveLength(6);
    expect(end.lists[1]?.picks).toHaveLength(6);
    expect(end.remaining.length).toBeGreaterThan(0);
  });

  it("fills three lists of 6 against two CPUs", () => {
    const end = play(["bennett", "lapid", "golan", "gantz", "liberman", "abbas"], 2);
    expect(isDraftOver(end)).toBe(true);
    expect(end.lists.every((list) => list.picks.length === 6)).toBe(true);
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

  it("hard mode blocks a third name from the same party", () => {
    let state = createDraft(1, 1, true);
    state = applyPick(state, "netanyahu");
    while (currentList(state) && !currentList(state)!.isPlayer) {
      state = applyCpuTurn(state);
    }
    const second = state.remaining.find((id) => getPerson(id).slateId === "likud");
    expect(second).toBeTruthy();
    state = applyPick(state, second!);
    const third = state.remaining.find((id) => getPerson(id).slateId === "likud");
    expect(third).toBeTruthy();
    const blocked = applyPick(state, third!);
    expect(blocked.lists.find((list) => list.isPlayer)?.picks).toEqual(["netanyahu", second]);
    expect(blocked.remaining).toContain(third);
    expect(blocked.turnCursor).toBe(state.turnCursor);
  });

  it("hard mode keeps every list at most two per party", () => {
    const end = play(["bennett", "lapid", "golan", "gantz", "liberman", "abbas"], 1, true);
    expect(isDraftOver(end)).toBe(true);
    for (const list of end.lists) {
      for (const id of list.picks) {
        expect(slateCountOnList(list.picks, getPerson(id).slateId)).toBeLessThanOrEqual(HARD_SLATE_CAP);
      }
    }
  });
});

function play(playerPicks: string[], cpus: number, hardMode = false) {
  let state = createDraft(cpus, 1, hardMode);
  while (!isDraftOver(state)) {
    const list = state.lists[state.turnQueue[state.turnCursor] ?? 0];
    if (list?.isPlayer) {
      const legal = legalRemaining(list.picks, state.remaining, hardMode);
      const next = playerPicks.find((id) => legal.includes(id as never)) ?? legal[0];
      if (!next) break;
      state = applyPick(state, next as never);
    } else {
      state = applyCpuTurn(state);
    }
  }
  return state;
}
