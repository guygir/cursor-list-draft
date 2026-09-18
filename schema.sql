CREATE TABLE IF NOT EXISTS runs (
  id TEXT PRIMARY KEY,
  at_ms INTEGER NOT NULL,
  mode TEXT NOT NULL,
  day_key TEXT,
  hub_name TEXT NOT NULL,
  player_name TEXT,
  seats INTEGER NOT NULL,
  cohesion REAL NOT NULL,
  demand REAL NOT NULL,
  won INTEGER NOT NULL,
  n_cpus INTEGER NOT NULL,
  difficulty TEXT NOT NULL,
  share TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS posts (
  ip TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  window_start INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS runs_rank ON runs (mode, seats DESC, cohesion DESC, at_ms DESC);
