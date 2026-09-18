export type BoardMode = "draft" | "create" | "daily";

export interface BoardEntry {
  id: string;
  at: number;
  mode: BoardMode;
  dayKey?: string;
  hubName: string;
  seats: number;
  cohesion: number;
  demand: number;
  won: boolean;
  nCpus: number;
  difficulty: string;
  share: string;
}

export const BOARD_KEY = "list-draft:board";
const MAX_ROWS = 40;

export interface BoardStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function defaultStore(): BoardStore | null {
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

export function memoryStore(seed: BoardEntry[] = []): BoardStore {
  const data = new Map<string, string>();
  if (seed.length) data.set(BOARD_KEY, JSON.stringify(seed));
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
}

export function readBoard(store: BoardStore | null = defaultStore()): BoardEntry[] {
  if (!store) return [];
  try {
    const raw = store.getItem(BOARD_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as BoardEntry[];
    return Array.isArray(parsed) ? parsed.filter(isEntry) : [];
  } catch {
    return [];
  }
}

export function recordRun(entry: Omit<BoardEntry, "id" | "at">, store: BoardStore | null = defaultStore()): BoardEntry {
  const at = Date.now();
  const row: BoardEntry = {
    ...entry,
    id: `${entry.mode}-${at}-${Math.random().toString(36).slice(2, 8)}`,
    at,
  };
  const next = sortBoard([row, ...readBoard(store)]).slice(0, MAX_ROWS);
  store?.setItem(BOARD_KEY, JSON.stringify(next));
  return row;
}

export function sortBoard(rows: BoardEntry[]): BoardEntry[] {
  return [...rows].sort((a, b) => b.seats - a.seats || b.cohesion - a.cohesion || b.at - a.at);
}

export function boardForMode(rows: BoardEntry[], mode: BoardMode, dayKey?: string): BoardEntry[] {
  return sortBoard(
    rows.filter((row) => {
      if (row.mode !== mode) return false;
      if (mode === "daily" && dayKey) return row.dayKey === dayKey;
      return true;
    }),
  );
}

export function rankOf(rows: BoardEntry[], id: string): number {
  return sortBoard(rows).findIndex((row) => row.id === id) + 1;
}

export function isBoardMode(value: string): value is BoardMode {
  return value === "draft" || value === "create" || value === "daily";
}

function isEntry(row: BoardEntry): boolean {
  return Boolean(row && typeof row.hubName === "string" && typeof row.seats === "number");
}
