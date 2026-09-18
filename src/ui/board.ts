import type { BoardMode } from "../systems/board";
import { boardForMode, rankOf } from "../systems/board";
import { readVisibleBoard } from "../systems/board-api";
import { copy } from "./copy";
import { el } from "./dom";

export function renderBoardPanel(opts: {
  mode: BoardMode;
  dayKey?: string;
  difficulty?: string;
  currentId?: string;
  compact?: boolean;
  hideEmpty?: boolean;
  title?: string;
}): HTMLElement | null {
  const rows = boardForMode(readVisibleBoard(globalThis.localStorage ?? null), {
    mode: opts.mode,
    ...(opts.dayKey ? { dayKey: opts.dayKey } : {}),
    ...(opts.difficulty ? { difficulty: opts.difficulty } : {}),
  }).slice(0, opts.compact ? 5 : 12);
  if (opts.hideEmpty && !rows.length) return null;
  const wrap = el("section", { class: `board-panel ${opts.compact ? "is-compact" : ""}` });
  wrap.append(el("h2", {}, opts.title ?? copy.boardTitle));
  wrap.append(el("p", { class: "board-note" }, copy.boardLocal));
  if (!rows.length) {
    wrap.append(el("p", { class: "board-empty" }, copy.boardEmpty));
    return wrap;
  }
  const list = el("ol", { class: "board-list" });
  for (const row of rows) {
    const place = rankOf(rows, row.id);
    list.append(
      el(
        "li",
        { class: `board-row ${row.id === opts.currentId ? "is-you" : ""}` },
        el("span", { class: "board-rank" }, String(place)),
        el("strong", { class: "board-hub" }, row.hubName),
        el("span", { class: "board-mode" }, modeLabel(row.mode)),
        el("span", { class: "board-seats" }, `${row.seats}`),
        el("span", { class: "board-unit" }, copy.seats),
      ),
    );
  }
  wrap.append(list);
  return wrap;
}

function modeLabel(mode: BoardMode): string {
  if (mode === "create") return copy.modeCreate;
  if (mode === "daily") return copy.modeDaily;
  return copy.modeDraft;
}
