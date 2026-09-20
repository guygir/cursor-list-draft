import type { BoardEntry, BoardMode } from "../systems/board";
import { boardForMode, playerBestOf, rankOf } from "../systems/board";
import { readBoard } from "../systems/board";
import { readVisibleBoard } from "../systems/board-api";
import { DIFFICULTIES, type HandicapId } from "../systems/draft";
import { copy } from "./copy";
import { el } from "./dom";

export function firstPlaceOf(query: { mode: BoardMode; dayKey?: string; difficulty?: string }) {
  return boardForMode(readVisibleBoard(globalThis.localStorage ?? null), query)[0] ?? null;
}

export function localBestOf(
  playerName: string,
  query: { mode: BoardMode; dayKey?: string; difficulty?: string },
): BoardEntry | null {
  return playerBestOf(boardForMode(readBoard(globalThis.localStorage ?? null), query), playerName);
}

export function renderBoardPanel(opts: {
  mode: BoardMode;
  dayKey?: string;
  difficulty?: string;
  currentId?: string;
  playerName?: string;
  compact?: boolean;
  hideEmpty?: boolean;
  hideNote?: boolean;
  title?: string;
}): HTMLElement | null {
  const rows = boardForMode(readVisibleBoard(globalThis.localStorage ?? null), {
    mode: opts.mode,
    ...(opts.dayKey ? { dayKey: opts.dayKey } : {}),
    ...(opts.difficulty ? { difficulty: opts.difficulty } : {}),
  });
  const top = rows.slice(0, opts.compact ? 5 : 10);
  const mine = opts.playerName ? playerBestOf(rows, opts.playerName) : null;
  const extra = mine && !top.some((row) => row.id === mine.id) ? mine : null;
  if (opts.hideEmpty && !rows.length) return null;
  const wrap = el("section", { class: `board-panel ${opts.compact ? "is-compact" : ""}` });
  wrap.append(el("h2", {}, opts.title ?? copy.boardTitle));
  if (!opts.hideNote) wrap.append(el("p", { class: "board-note" }, copy.boardLocal));
  if (!rows.length) {
    wrap.append(el("p", { class: "board-empty" }, copy.boardEmpty));
    return wrap;
  }
  const list = el("ol", { class: "board-list" });
  for (const row of top) {
    list.append(renderBoardRow(row, rankOf(rows, row.id), row.id === opts.currentId || row.id === mine?.id));
  }
  if (extra) {
    list.append(renderBoardRow(extra, rankOf(rows, extra.id), true, true));
  }
  wrap.append(list);
  return wrap;
}

function renderBoardRow(row: BoardEntry, place: number, isYou: boolean, isExtra = false): HTMLElement {
  return el(
    "li",
    { class: `board-row ${isYou ? "is-you" : ""} ${isExtra ? "is-extra" : ""}` },
    el("span", { class: "board-rank" }, String(place)),
    el(
      "span",
      { class: "board-who" },
      el("strong", { class: "board-player" }, row.playerName || copy.anonPlayer),
      el("span", { class: "board-hub" }, isExtra ? `${row.hubName} · ${copy.yourBest}` : row.hubName),
    ),
    el("span", { class: "board-seats" }, `${row.seats}`),
    el("span", { class: "board-unit" }, copy.seats),
  );
}

export function renderBoardFilters(opts: {
  mode: BoardMode;
  difficulty: HandicapId;
  onMode: (mode: BoardMode) => void;
  onDifficulty: (id: HandicapId) => void;
}): HTMLElement {
  const box = el("div", { class: "board-filters" });
  const modes = el("fieldset", { class: "board-filter-pick" }, el("legend", {}, copy.modeLabel));
  const modeRows: Array<{ id: BoardMode; title: string }> = [
    { id: "daily", title: copy.modeDaily },
    { id: "draft", title: copy.modeDraft },
    { id: "create", title: copy.modeCreate },
  ];
  for (const row of modeRows) {
    const btn = el(
      "button",
      { type: "button", class: `mode-btn ${opts.mode === row.id ? "is-on" : ""}`, "data-board-mode": row.id },
      el("strong", {}, row.title),
    );
    btn.addEventListener("click", () => opts.onMode(row.id));
    modes.append(btn);
  }
  box.append(modes);
  if (opts.mode !== "daily") {
    const levels = el("fieldset", { class: "level-pick" }, el("legend", {}, copy.levelLabel));
    for (const row of DIFFICULTIES) {
      const label = el(
        "label",
        { class: opts.difficulty === row.id ? "is-on" : "", "data-board-level": row.id },
        el("span", { class: "level-name" }, row.labelHe),
        el("span", { class: "level-hint" }, row.hintHe),
      );
      label.addEventListener("click", () => opts.onDifficulty(row.id as HandicapId));
      levels.append(label);
    }
    box.append(levels);
  }
  return box;
}
