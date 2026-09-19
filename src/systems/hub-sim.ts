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
import { greedyCpuPick, noisyCpuPick } from "./cpu";
import { publishedHubs } from "./modes";
import { resolveElection } from "./resolve";

export type PlayerPolicy = "noisy" | "greedy";

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

export interface HubNTableRow {
  hubId: PersonId;
  hubHe: string;
  partyHe: string;
  nCpus: number;
  avgSeats: number;
  winRate: number;
  byDifficulty: Record<DifficultyId, { avgSeats: number; winRate: number }>;
}

/** CPU always uses 35/25/15/25. Player can stay noisy or take the greedy max. */
export function playDraft(state: DraftState, playerPolicy: PlayerPolicy = "noisy"): DraftState {
  let next = state;
  while (!isDraftOver(next)) {
    const list = currentList(next);
    if (!list) break;
    const pool = legalRemaining(list.picks, next.remaining, next.slateCap);
    if (pool.length === 0) {
      next = skipIfBlocked({ ...next, turnCursor: next.turnCursor + 1 });
      continue;
    }
    const pick =
      list.isPlayer && playerPolicy === "greedy"
        ? greedyCpuPick(list, next.lists, pool, next.slateCap)
        : noisyCpuPick(list, next.lists, pool, next.slateCap, next.rand);
    next = applyPick(next, pick);
  }
  return next;
}

/** Player and every CPU use the same noisy pick (35/25/15/25). Auto-pick in the UI stays greedy. */
export function playAllNoisy(state: DraftState): DraftState {
  return playDraft(state, "noisy");
}

export function runHubCell(
  hubId: PersonId,
  nCpus: number,
  difficulty: DifficultyId,
  seed = 1,
  playerPolicy: PlayerPolicy = "noisy",
): HubSimCell {
  const hub = getPerson(hubId);
  const finished = playDraft(createDraft(nCpus, seed, difficulty, hubId), playerPolicy);
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

export function runHubGrid(opts: { seeds?: number; playerPolicy?: PlayerPolicy } = {}): HubSimRow[] {
  const seeds = opts.seeds ?? 16;
  const playerPolicy = opts.playerPolicy ?? "noisy";
  const hubs = publishedHubs();
  return hubs.map((hub) => {
    const cells: HubSimCell[] = [];
    for (const difficulty of DIFFICULTIES) {
      for (let nCpus = MIN_CPU; nCpus <= MAX_CPU; nCpus++) {
        for (let seed = 1; seed <= seeds; seed++) {
          cells.push(runHubCell(hub.id, nCpus, difficulty.id, seed, playerPolicy));
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

export function tableForN(rows: HubSimRow[], nCpus: number): HubNTableRow[] {
  return rows
    .map((row) => {
      const match = row.cells.filter((cell) => cell.nCpus === nCpus);
      const byDifficulty = Object.fromEntries(
        DIFFICULTIES.map((diff) => {
          const slice = match.filter((cell) => cell.difficulty === diff.id);
          return [
            diff.id,
            {
              avgSeats: mean(slice.map((cell) => cell.playerSeats)),
              winRate: mean(slice.map((cell) => (cell.won ? 1 : 0))),
            },
          ];
        }),
      ) as HubNTableRow["byDifficulty"];
      return {
        hubId: row.hubId,
        hubHe: row.hubHe,
        partyHe: row.partyHe,
        nCpus,
        avgSeats: mean(match.map((cell) => cell.playerSeats)),
        winRate: mean(match.map((cell) => (cell.won ? 1 : 0))),
        byDifficulty,
      };
    })
    .sort((a, b) => b.avgSeats - a.avgSeats);
}

export function formatHubTablesByN(rows: HubSimRow[], title: string): string {
  const blocks = [title, ""];
  for (let nCpus = MIN_CPU; nCpus <= MAX_CPU; nCpus++) {
    blocks.push(formatNTable(tableForN(rows, nCpus), nCpus));
    blocks.push("");
  }
  return blocks.join("\n").trimEnd();
}

function formatNTable(table: HubNTableRow[], nCpus: number): string {
  const lines = [
    `### ${nCpus} opponent${nCpus === 1 ? "" : "s"}`,
    "",
    "| hub | party | avg | win | open | three | one |",
    "|---|---|---:|---:|---:|---:|---:|",
  ];
  for (const row of table) {
    lines.push(
      `| ${row.hubHe} | ${row.partyHe} | ${row.avgSeats.toFixed(1)} | ${pct(row.winRate)} | ${cell(row, "open")} | ${cell(row, "three")} | ${cell(row, "one")} |`,
    );
  }
  return lines.join("\n");
}

function cell(row: HubNTableRow, difficulty: DifficultyId): string {
  const slice = row.byDifficulty[difficulty];
  return `${slice.avgSeats.toFixed(1)}${slice.winRate >= 0.5 ? "*" : ""}`;
}

function pct(rate: number): string {
  return `${(rate * 100).toFixed(0)}%`;
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function formatHubGrid(rows: HubSimRow[]): string {
  return formatHubTablesByN(rows, "Toy grid — not a forecast. * = win rate ≥ 50% in that difficulty.");
}
