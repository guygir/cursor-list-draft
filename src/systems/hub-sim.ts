import { getPerson, slateLabelHe } from "../data/pool";
import type { PersonId } from "../data/types";
import {
  applyPick,
  createDraft,
  currentList,
  DIFFICULTIES,
  isDraftOver,
  legalRemaining,
  MAX_CPU,
  MIN_CPU,
  skipIfBlocked,
  type DifficultyId,
  type DraftState,
} from "./draft";
import { noisyCpuPick } from "./cpu";
import { publishedHubs } from "./modes";
import { resolveElection } from "./resolve";

export interface HubSimCell {
  hubId: PersonId;
  hubHe: string;
  partyHe: string;
  difficulty: DifficultyId;
  nCpus: number;
  playerSeats: number;
  won: boolean;
  cohesion: number;
  massAfterSplit: number;
  neighborhoodHe: string;
  rivalSeats: number[];
}

export interface HubSimRow {
  hubId: PersonId;
  hubHe: string;
  partyHe: string;
  cells: HubSimCell[];
  avgSeats: number;
  winRate: number;
}

/** Player and every CPU use the same noisy pick (35/25/15/25). Auto-pick in the UI stays greedy. */
export function playAllNoisy(state: DraftState): DraftState {
  let next = state;
  while (!isDraftOver(next)) {
    const list = currentList(next);
    if (!list) break;
    const pool = legalRemaining(list.picks, next.remaining, next.slateCap);
    if (pool.length === 0) {
      next = skipIfBlocked({ ...next, turnCursor: next.turnCursor + 1 });
      continue;
    }
    next = applyPick(next, noisyCpuPick(list, next.lists, pool, next.slateCap, next.rand));
  }
  return next;
}

export function runHubCell(
  hubId: PersonId,
  nCpus: number,
  difficulty: DifficultyId,
  seed = 1,
): HubSimCell {
  const hub = getPerson(hubId);
  const finished = playAllNoisy(createDraft(nCpus, seed, difficulty, hubId));
  const result = resolveElection(finished.lists);
  const player = result.lists.find((row) => row.list.isPlayer);
  if (!player) throw new Error("no player");
  return {
    hubId,
    hubHe: hub.nameHe,
    partyHe: slateLabelHe(hub.slateId),
    difficulty,
    nCpus,
    playerSeats: player.seats,
    won: result.winnerId === "player",
    cohesion: player.cohesion,
    massAfterSplit: player.massAfterSplit,
    neighborhoodHe: player.neighborhood.labelHe,
    rivalSeats: result.lists.filter((row) => !row.list.isPlayer).map((row) => row.seats),
  };
}

export function runHubGrid(opts: { seeds?: number } = {}): HubSimRow[] {
  const seeds = opts.seeds ?? 16;
  const hubs = publishedHubs();
  return hubs.map((hub) => {
    const cells: HubSimCell[] = [];
    for (const difficulty of DIFFICULTIES) {
      for (let nCpus = MIN_CPU; nCpus <= MAX_CPU; nCpus++) {
        for (let seed = 1; seed <= seeds; seed++) {
          cells.push(runHubCell(hub.id, nCpus, difficulty.id, seed));
        }
      }
    }
    const avgSeats = cells.reduce((sum, cell) => sum + cell.playerSeats, 0) / cells.length;
    const winRate = cells.filter((cell) => cell.won).length / cells.length;
    return {
      hubId: hub.id,
      hubHe: hub.nameHe,
      partyHe: slateLabelHe(hub.slateId),
      cells,
      avgSeats,
      winRate,
    };
  });
}

export function formatHubGrid(rows: HubSimRow[]): string {
  const diffs = DIFFICULTIES.map((row) => row.id);
  const ns = [1, 2, 3] as const;
  const lines: string[] = [
    "Toy noisy grid — regular draft. Opening pick = published #1. Then 35/25/15/25. Not a forecast.",
    "",
    "hub\tparty\tavg\twin\t" +
      diffs.flatMap((d) => ns.map((n) => `${d}/n${n}`)).join("\t"),
  ];
  const sorted = [...rows].sort((a, b) => b.avgSeats - a.avgSeats);
  for (const row of sorted) {
    const cells = diffs.flatMap((d) =>
      ns.map((n) => {
        const match = row.cells.filter((cell) => cell.difficulty === d && cell.nCpus === n);
        const seats = match.reduce((sum, cell) => sum + cell.playerSeats, 0) / match.length;
        const winRate = match.filter((cell) => cell.won).length / match.length;
        return `${seats.toFixed(1)}${winRate >= 0.5 ? "*" : ""}`;
      }),
    );
    lines.push(
      `${row.hubHe}\t${row.partyHe}\t${row.avgSeats.toFixed(1)}\t${(row.winRate * 100).toFixed(0)}%\t${cells.join("\t")}`,
    );
  }
  return lines.join("\n");
}
