const MAX_ROWS = 80;
const MAX_POSTS_PER_HOUR = 20;

export async function onRequestGet(context) {
  const db = context.env?.DB;
  if (!db) return json({ rows: [] });
  await ensure(db);
  const result = await db
    .prepare(
      `SELECT id, at_ms AS at, mode, day_key AS dayKey, hub_name AS hubName, seats, cohesion, demand, won, n_cpus AS nCpus, difficulty, share
       FROM runs ORDER BY seats DESC, cohesion DESC, at_ms DESC LIMIT ?`,
    )
    .bind(MAX_ROWS)
    .all();
  return json({ rows: (result.results ?? []).map(fromRow) });
}

export async function onRequestPost(context) {
  const db = context.env?.DB;
  if (!db) return json({ ok: false }, 503);
  await ensure(db);
  const ip = context.request.headers.get("CF-Connecting-IP") ?? "local";
  if (!(await allowPost(db, ip))) return json({ ok: false }, 429);
  let body;
  try {
    body = await context.request.json();
  } catch {
    return json({ ok: false }, 400);
  }
  const row = sanitize(body);
  if (!row) return json({ ok: false }, 400);
  await db
    .prepare(
      `INSERT OR REPLACE INTO runs (id, at_ms, mode, day_key, hub_name, seats, cohesion, demand, won, n_cpus, difficulty, share)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      row.id,
      row.at,
      row.mode,
      row.dayKey ?? null,
      row.hubName,
      row.seats,
      row.cohesion,
      row.demand,
      row.won ? 1 : 0,
      row.nCpus,
      row.difficulty,
      row.share,
    )
    .run();
  return json({ ok: true, id: row.id });
}

async function ensure(db) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS runs (
      id TEXT PRIMARY KEY,
      at_ms INTEGER NOT NULL,
      mode TEXT NOT NULL,
      day_key TEXT,
      hub_name TEXT NOT NULL,
      seats INTEGER NOT NULL,
      cohesion REAL NOT NULL,
      demand REAL NOT NULL,
      won INTEGER NOT NULL,
      n_cpus INTEGER NOT NULL,
      difficulty TEXT NOT NULL,
      share TEXT NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS posts (
      ip TEXT PRIMARY KEY,
      count INTEGER NOT NULL,
      window_start INTEGER NOT NULL
    )`),
    db.prepare(`CREATE INDEX IF NOT EXISTS runs_rank ON runs (mode, seats DESC, cohesion DESC, at_ms DESC)`),
  ]);
}

async function allowPost(db, ip) {
  const now = Date.now();
  const hour = 60 * 60 * 1000;
  const row = await db.prepare("SELECT count, window_start FROM posts WHERE ip = ?").bind(ip).first();
  if (!row || now - row.window_start > hour) {
    await db.prepare("INSERT OR REPLACE INTO posts (ip, count, window_start) VALUES (?, 1, ?)").bind(ip, now).run();
    return true;
  }
  if (row.count >= MAX_POSTS_PER_HOUR) return false;
  await db.prepare("UPDATE posts SET count = count + 1 WHERE ip = ?").bind(ip).run();
  return true;
}

function sanitize(body) {
  if (!body || typeof body !== "object") return null;
  const mode = body.mode;
  if (mode !== "draft" && mode !== "create" && mode !== "daily") return null;
  const hubName = String(body.hubName ?? "").replace(/[<>]/g, "").trim().slice(0, 24);
  const id = String(body.id ?? "").slice(0, 80);
  const at = Number(body.at);
  if (!hubName || !id || !Number.isFinite(at)) return null;
  return {
    id,
    at,
    mode,
    dayKey: body.dayKey ? String(body.dayKey).slice(0, 16) : null,
    hubName,
    seats: Math.max(0, Math.min(120, Math.round(Number(body.seats)))),
    cohesion: clamp01(Number(body.cohesion)),
    demand: Math.max(0, Number(body.demand) || 0),
    won: Boolean(body.won),
    nCpus: Math.max(1, Math.min(3, Math.round(Number(body.nCpus) || 1))),
    difficulty: String(body.difficulty ?? "open").slice(0, 12),
    share: String(body.share ?? "/").slice(0, 160),
  };
}

function fromRow(row) {
  return {
    ...row,
    won: Boolean(row.won),
    dayKey: row.dayKey ?? undefined,
  };
}

function clamp01(n) {
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}
