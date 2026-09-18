import type { BoardMode } from "../systems/board";
import { boardForMode, rankOf, readBoard } from "../systems/board";
import { copy } from "./copy";
import { el } from "./dom";

export function renderBoardPanel(opts: {
  mode: BoardMode;
  dayKey?: string;
  currentId?: string;
  compact?: boolean;
}): HTMLElement {
  const rows = boardForMode(readBoard(), opts.mode, opts.dayKey).slice(0, opts.compact ? 5 : 12);
  const wrap = el("section", { class: `board-panel ${opts.compact ? "is-compact" : ""}` });
  wrap.append(el("h2", {}, copy.boardTitle));
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
