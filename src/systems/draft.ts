import { getPerson, POOL_IDS } from "../data/pool";
import type { DraftList, PersonId, SlateId } from "../data/types";
import { greedyCpuPick } from "./cpu";

export const LIST_SIZE = 10;
export const MIN_CPU = 1;
export const MAX_CPU = 3;

export type DifficultyId = "open" | "three" | "one";

export interface Difficulty {
  id: DifficultyId;
  /** null = no party cap */
  slateCap: number | null;
  labelHe: string;
  hintHe: string;
}

export const DIFFICULTIES: readonly Difficulty[] = [
  { id: "open", slateCap: null, labelHe: "קל", hintHe: "בלי הגבלת מפלגה" },
  { id: "three", slateCap: 3, labelHe: "עד 3", hintHe: "עד שלושה שמות מאותה מפלגה" },
  { id: "one", slateCap: 1, labelHe: "אחד", hintHe: "שם אחד מכל מפלגה" },
];

/** Old five/two rows fold into the nearest remaining cap. */
export function normalizeDifficulty(id: string | undefined): DifficultyId {
  if (id === "one") return "one";
  if (id === "three" || id === "five" || id === "two") return "three";
  return "open";
}

export function difficultyById(id: string | undefined): Difficulty {
  const key = normalizeDifficulty(id);
  return DIFFICULTIES.find((row) => row.id === key) ?? DIFFICULTIES[0]!;
}

export interface DraftState {
  lists: DraftList[];
  remaining: PersonId[];
  turnQueue: number[];
  turnCursor: number;
  seed: number;
  rand: () => number;
  difficulty: DifficultyId;
  slateCap: number | null;
}

export function slateCountOnList(picks: PersonId[], slate: SlateId): number {
  return picks.filter((id) => getPerson(id).slateId === slate).length;
}

export function canAddToList(
  picks: PersonId[],
  personId: PersonId,
  slateCap: number | null,
): boolean {
  if (slateCap == null) return true;
  return slateCountOnList(picks, getPerson(personId).slateId) < slateCap;
}

export function legalRemaining(
  picks: PersonId[],
  remaining: PersonId[],
  slateCap: number | null,
): PersonId[] {
  if (slateCap == null) return remaining;
  return remaining.filter((id) => canAddToList(picks, id, slateCap));
}

export function createDraft(
  cpuCount: number,
  seed = 1,
  difficulty: DifficultyId = "open",
  playerHub?: PersonId,
): DraftState {
  const n = clampCpus(cpuCount);
  const { slateCap } = difficultyById(difficulty);
  const hub = playerHub ? getPerson(playerHub) : null;
  const lists: DraftList[] = [
    {
      id: "player",
      labelHe: hub ? `הרשימה של ${hub.nameHe}` : "המפלגה שלך",
      labelEn: hub ? `${hub.nameEn}'s list` : "Your party",
      picks: hub ? [hub.id] : [],
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
    remaining: POOL_IDS.filter((id) => id !== playerHub),
    turnQueue: buildSnakeQueue(
      lists.length,
      LIST_SIZE,
      lists.map((list) => list.picks.length),
    ),
    turnCursor: 0,
    seed,
    rand: () => 0,
    difficulty,
    slateCap,
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
  if (!current || !canAddToList(current.picks, personId, state.slateCap)) return state;

  const lists = state.lists.map((list, i) =>
    i === idx ? { ...list, picks: [...list.picks, personId] } : list,
  );

  return skipIfBlocked({
    lists,
    remaining: state.remaining.filter((id) => id !== personId),
    turnQueue: state.turnQueue,
    turnCursor: state.turnCursor + 1,
    seed: state.seed,
    rand: state.rand,
    difficulty: state.difficulty,
    slateCap: state.slateCap,
  });
}

export function applyCpuTurn(state: DraftState): DraftState {
  const list = currentList(state);
  if (!list || list.isPlayer || isDraftOver(state)) return state;
  const pool = legalRemaining(list.picks, state.remaining, state.slateCap);
  if (pool.length === 0) return skipIfBlocked({ ...state, turnCursor: state.turnCursor + 1 });
  const pick = greedyCpuPick(list, state.lists, pool, state.slateCap);
  return applyPick(state, pick);
}

/** Skip anyone who cannot legally take a remaining name. */
export function skipIfBlocked(state: DraftState): DraftState {
  let next = state;
  while (!isDraftOver(next)) {
    const list = currentList(next);
    if (!list) break;
    const pool = legalRemaining(list.picks, next.remaining, next.slateCap);
    if (pool.length > 0) break;
    next = { ...next, turnCursor: next.turnCursor + 1 };
  }
  return next;
}

/** Snake order, skipping a list once it already has LIST_SIZE names. */
export function buildSnakeQueue(listCount: number, listSize: number, already: number[] = []): number[] {
  const full: number[] = [];
  const filled = Array.from({ length: listCount }, () => 0);
  let forward = true;
  const target = Math.min(listCount * listSize, POOL_IDS.length + already.reduce((sum, n) => sum + n, 0));

  while (filled.reduce((sum, n) => sum + n, 0) < target) {
    const order = Array.from({ length: listCount }, (_, i) => i);
    const pass = forward ? order : [...order].reverse();
    let progressed = false;
    for (const idx of pass) {
      if ((filled[idx] ?? 0) >= listSize) continue;
      if (filled.reduce((sum, n) => sum + n, 0) >= target) break;
      full.push(idx);
      filled[idx] = (filled[idx] ?? 0) + 1;
      progressed = true;
    }
    if (!progressed) break;
    forward = !forward;
  }

  const skip = Array.from({ length: listCount }, (_, i) => already[i] ?? 0);
  return full.filter((idx) => {
    if ((skip[idx] ?? 0) > 0) {
      skip[idx] = (skip[idx] ?? 0) - 1;
      return false;
    }
    return true;
  });
}
