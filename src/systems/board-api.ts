import { type BoardEntry, type BoardStore, isBoardMode, readBoard, sortBoard } from "./board";

export const REMOTE_KEY = "list-draft:remote-board";

export function mergeBoards(local: BoardEntry[], remote: BoardEntry[]): BoardEntry[] {
  const byId = new Map<string, BoardEntry>();
  for (const row of remote) byId.set(row.id, row);
  for (const row of local) byId.set(row.id, row);
  return sortBoard([...byId.values()]);
}

export function readRemoteCache(store: BoardStore | null): BoardEntry[] {
  if (!store) return [];
  try {
    const raw = store.getItem(REMOTE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as BoardEntry[];
    return Array.isArray(parsed) ? parsed.filter(isPostedEntry) : [];
  } catch {
    return [];
  }
}

export function writeRemoteCache(rows: BoardEntry[], store: BoardStore | null): void {
  store?.setItem(REMOTE_KEY, JSON.stringify(rows.slice(0, 80)));
}

export function readVisibleBoard(store: BoardStore | null): BoardEntry[] {
  return mergeBoards(readBoard(store), readRemoteCache(store));
}

export function isPostedEntry(row: BoardEntry): boolean {
  return Boolean(
    row &&
      typeof row.id === "string" &&
      typeof row.hubName === "string" &&
      typeof row.seats === "number" &&
      isBoardMode(row.mode),
  );
}

export function sanitizePostedEntry(body: unknown): BoardEntry | null {
  if (!body || typeof body !== "object") return null;
  const row = body as BoardEntry;
  if (!isBoardMode(row.mode)) return null;
  const hubName = String(row.hubName ?? "").replace(/[<>]/g, "").trim().slice(0, 24);
  if (!hubName) return null;
  const seats = Math.max(0, Math.min(120, Math.round(Number(row.seats))));
  const cohesion = clamp01(Number(row.cohesion));
  const demand = Math.max(0, Number(row.demand) || 0);
  const at = Number(row.at);
  const id = String(row.id ?? "").slice(0, 80);
  if (!id || !Number.isFinite(at)) return null;
  const entry: BoardEntry = {
    id,
    at,
    mode: row.mode,
    hubName,
    seats,
    cohesion,
    demand,
    won: Boolean(row.won),
    nCpus: Math.max(1, Math.min(3, Math.round(Number(row.nCpus) || 1))),
    difficulty: String(row.difficulty ?? "open").slice(0, 12),
    share: String(row.share ?? "/").slice(0, 160),
  };
  if (row.dayKey) entry.dayKey = String(row.dayKey).slice(0, 16);
  return entry;
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

export async function pullRemoteBoard(): Promise<BoardEntry[] | null> {
  try {
    const res = await fetch("/api/board", { headers: { accept: "application/json" } });
    if (!res.ok) return null;
    const data = (await res.json()) as { rows?: BoardEntry[] };
    if (!Array.isArray(data.rows)) return null;
    return data.rows.map((row) => sanitizePostedEntry(row)).filter((row): row is BoardEntry => row !== null);
  } catch {
    return null;
  }
}

export async function pushRemoteRun(entry: BoardEntry): Promise<boolean> {
  try {
    const res = await fetch("/api/board", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(entry),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function hydrateRemoteBoard(store: BoardStore | null): Promise<boolean> {
  const rows = await pullRemoteBoard();
  if (!rows) return false;
  writeRemoteCache(rows, store);
  return true;
}
