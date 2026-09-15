import { getPerson, POOL_IDS } from "../data/pool";
import type { DraftList, PersonId, SlateId } from "../data/types";
import { greedyCpuPick, mulberry32 } from "./cpu";

export const LIST_SIZE = 6;
export const MIN_CPU = 1;
export const MAX_CPU = 3;
export const HARD_SLATE_CAP = 2;

export interface DraftState {
  lists: DraftList[];
  remaining: PersonId[];
  turnQueue: number[];
  turnCursor: number;
  seed: number;
  rand: () => number;
  hardMode: boolean;
}

export function slateCountOnList(picks: PersonId[], slate: SlateId): number {
  return picks.filter((id) => getPerson(id).slateId === slate).length;
}

export function canAddToList(picks: PersonId[], personId: PersonId, hardMode: boolean): boolean {
  if (!hardMode) return true;
  return slateCountOnList(picks, getPerson(personId).slateId) < HARD_SLATE_CAP;
}

export function legalRemaining(picks: PersonId[], remaining: PersonId[], hardMode: boolean): PersonId[] {
  if (!hardMode) return remaining;
  return remaining.filter((id) => canAddToList(picks, id, true));
}

export function createDraft(cpuCount: number, seed = 1, hardMode = false): DraftState {
  const n = clampCpus(cpuCount);
  const lists: DraftList[] = [
    {
      id: "player",
      labelHe: "המפלגה שלך",
      labelEn: "Your party",
      picks: [],
      isPlayer: true,
      draftOrder: 0,
    },
  ];
  for (let i = 1; i <= n; i++) {
    lists.push({
      id: `cpu-${i}`,
      labelHe: `מפלגה ${i}`,
      labelEn: `Party ${i}`,
      picks: [],
      isPlayer: false,
      draftOrder: i,
    });
  }

  return {
    lists,
    remaining: [...POOL_IDS],
    turnQueue: buildSnakeQueue(lists.length, LIST_SIZE),
    turnCursor: 0,
    seed,
    rand: mulberry32(seed),
    hardMode,
  };
}

export function clampCpus(n: number): number {
  return Math.min(MAX_CPU, Math.max(MIN_CPU, Math.round(n)));
}

export function currentListIndex(state: DraftState): number | null {
  return state.turnQueue[state.turnCursor] ?? null;
}

export function currentList(state: DraftState): DraftList | null {
  const idx = currentListIndex(state);
  return idx === null ? null : (state.lists[idx] ?? null);
}

export function isDraftOver(state: DraftState): boolean {
  return state.remaining.length === 0 || state.turnCursor >= state.turnQueue.length;
}

export function applyPick(state: DraftState, personId: PersonId): DraftState {
  if (isDraftOver(state)) return state;
  const idx = currentListIndex(state);
  if (idx === null) return state;
  if (!state.remaining.includes(personId)) return state;
  const current = state.lists[idx];
  if (!current || !canAddToList(current.picks, personId, state.hardMode)) return state;

  const lists = state.lists.map((list, i) =>
    i === idx ? { ...list, picks: [...list.picks, personId] } : list,
  );

  return {
    lists,
    remaining: state.remaining.filter((id) => id !== personId),
    turnQueue: state.turnQueue,
    turnCursor: state.turnCursor + 1,
    seed: state.seed,
    rand: state.rand,
    hardMode: state.hardMode,
  };
}

export function applyCpuTurn(state: DraftState): DraftState {
  const list = currentList(state);
  if (!list || list.isPlayer || isDraftOver(state)) return state;
  const pool = legalRemaining(list.picks, state.remaining, state.hardMode);
  if (pool.length === 0) return state;
  const pick = greedyCpuPick(list, state.lists, pool, state.rand(), state.hardMode);
  return applyPick(state, pick);
}

/** Snake order, skipping a list once it already has LIST_SIZE names. */
export function buildSnakeQueue(listCount: number, listSize: number): number[] {
  const queue: number[] = [];
  const filled = Array.from({ length: listCount }, () => 0);
  let forward = true;
  const maxPicks = Math.min(listCount * listSize, POOL_IDS.length);

  while (queue.length < maxPicks) {
    const order = Array.from({ length: listCount }, (_, i) => i);
    const pass = forward ? order : [...order].reverse();
    for (const idx of pass) {
      if ((filled[idx] ?? 0) >= listSize) continue;
      if (queue.length >= maxPicks) break;
      queue.push(idx);
      filled[idx] = (filled[idx] ?? 0) + 1;
    }
    forward = !forward;
  }
  return queue;
}
