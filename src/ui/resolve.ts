import { getPerson } from "../data/pool";
import type { BoardEntry, BoardMode } from "../systems/board";
import { difficultyById } from "../systems/draft";
import type { ElectionResult, ListScore } from "../systems/resolve";
import { DEMAND_SCALE } from "../systems/scores";
import { KNESSET_SEATS } from "../systems/seats";
import { renderBoardPanel } from "./board";
import { copy } from "./copy";
import { el } from "./dom";
import { renderHowCalc } from "./info";
import {
  NIGHT_BAR_DELAY_MS,
  NIGHT_BAR_MS,
  NIGHT_COUNT_MS,
  NIGHT_METER_DELAY_MS,
  NIGHT_ROW_STAGGER_MS,
  countUp,
  scoreMeters,
} from "./meters";
import { klafiShareButtons, sharePreparedCard } from "./share-card";
import { renderEdgeCard, renderTreeMap, type TreeHandlers } from "./tree";

export function renderResolve(
  result: ElectionResult,
  onReplay: () => void,
  opts: {
    shareHint?: string;
    onShare?: () => Promise<void> | void;
    playerName?: string;
    shareUrl?: string;
    boardMode?: BoardMode;
    dayKey?: string;
    difficulty?: string;
    boardEntry?: BoardEntry;
  } = {},
): HTMLElement {
  const lists = result.lists.map((row) => row.list);
  const won = result.winnerId === "player";
  const root = el("div", { class: "screen resolve-screen" });

  root.append(
    el(
      "header",
      { class: "mast" },
      el("div", { class: "brand" }, el("h1", {}, copy.night), el("p", { class: "tag" }, copy.sponsor)),
      el(
        "div",
        { class: "mast-tools" },
        renderHowCalc(),
        el("p", { class: won ? "banner win" : "banner loss" }, won ? copy.win : copy.loss),
      ),
    ),
    el("p", { class: "win-rule" }, copy.winBySeats),
    el("div", { class: "ticker" }, copy.disclosure),
  );

  const board = el("div", { class: "night-board" });
  [...result.lists]
    .sort((a, b) => b.seats - a.seats)
    .forEach((row, index) => board.append(renderListBar(row, result.winnerId, index)));
  root.append(board);

  root.append(
    el("section", { class: "why-block" }, el("h2", {}, copy.why), el("p", { class: "why-line" }, result.why.he)),
  );
  if (opts.boardMode) {
    const panel = renderBoardPanel({
      mode: opts.boardMode,
      title: nightBoardTitle(opts.boardMode, opts.difficulty),
      compact: true,
      ...(opts.dayKey ? { dayKey: opts.dayKey } : {}),
      ...(opts.difficulty ? { difficulty: opts.difficulty } : {}),
      ...(opts.boardEntry ? { currentId: opts.boardEntry.id } : {}),
    });
    if (panel) root.append(panel);
  }

  const treeWrap = el("section", { class: "result-tree" });
  const edgeDock = el("div", { class: "result-edge" }, renderEdgeCard(null));
  const view = {
    lists,
    remaining: [] as string[],
    hoverId: null,
    focusId: null,
    selectedEdge: null,
    hoverEdge: null,
    canPick: false,
    openSlate: null,
  };
  const handlers: TreeHandlers = {
    onHover: () => undefined,
    onFocus: () => undefined,
    onPick: () => undefined,
    onOpenSlate: () => undefined,
    onCloseSlate: () => undefined,
    onEdge: (key) => {
      edgeDock.replaceChildren(renderEdgeCard(key));
    },
    onEdgeHover: (key) => {
      edgeDock.replaceChildren(renderEdgeCard(key));
    },
  };
  treeWrap.append(renderTreeMap(view, handlers), edgeDock);
  root.append(treeWrap);

  const replay = el("button", { type: "button", class: "primary" }, copy.replay);
  replay.addEventListener("click", onReplay);
  const copyLink = el("button", { type: "button", class: "share-btn" }, copy.share);
  copyLink.addEventListener("click", async () => {
    await opts.onShare?.();
    copyLink.textContent = copy.shared;
  });
  const actions = el("div", { class: "result-actions" });
  actions.append(el("div", { class: "result-actions-row" }, replay, opts.onShare ? copyLink : null));
  if (opts.playerName != null) {
    actions.append(renderShareRow(result, opts.playerName, opts.shareUrl ?? location.href));
  }
  root.append(actions);
  if (opts.shareHint) root.append(el("p", { class: "no-board" }, opts.shareHint));
  return root;
}

function renderShareRow(result: ElectionResult, playerName: string, shareUrl: string): HTMLElement {
  const row = el("div", { class: "share-row dialog-actions" });
  const { wa, ig } = klafiShareButtons();
  wa.addEventListener("click", () => {
    void sharePreparedCard({
      channel: "whatsapp",
      result,
      playerName,
      url: shareUrl,
      button: wa,
    });
  });
  ig.addEventListener("click", () => {
    void sharePreparedCard({
      channel: "instagram",
      result,
      playerName,
      url: shareUrl,
      button: ig,
    });
  });
  row.append(wa, ig);
  return row;
}

function renderListBar(row: ListScore, winnerId: string, index: number): HTMLElement {
  const names = row.list.picks.map((id) => getPerson(id).nameHe).join(" · ");
  const pct = (row.seats / KNESSET_SEATS) * 100;
  const cohesionPct = Math.round(row.cohesion * 100);
  const demandPct = Math.round(Math.min(100, (row.massAfterSplit / DEMAND_SCALE) * 100));
  const rowDelay = index * NIGHT_ROW_STAGGER_MS;
  const seatNum = el("strong", { class: "seat-num" }, "0");
  countUp(seatNum, 0, row.seats, rowDelay, NIGHT_COUNT_MS);
  const item = el(
    "article",
    {
      class: `mandate-row ${row.list.id === winnerId ? "is-winner" : ""} ${row.list.isPlayer ? "is-player" : ""}`,
      style: `--row-delay:${rowDelay}ms`,
    },
    el(
      "header",
      {},
      el("h3", {}, row.list.labelHe),
      row.list.isPlayer ? el("span", { class: "you-pill" }, copy.yourParty) : null,
    ),
    el(
      "div",
      { class: "seat-line" },
      seatNum,
      el("span", { class: "seat-unit" }, copy.seats),
      el(
        "div",
        { class: "bar-track", "aria-hidden": "true" },
        el("div", {
          class: "bar-fill is-seats",
          style: `--from:0%;--target:${pct}%;--grow-delay:${rowDelay + NIGHT_BAR_DELAY_MS}ms;--grow-ms:${NIGHT_BAR_MS}ms`,
        }),
      ),
    ),
    el("p", { class: "row-names" }, names),
    scoreMeters(cohesionPct, demandPct, "fresh", { delay: rowDelay + NIGHT_METER_DELAY_MS }),
    el("p", { class: "hill-note" }, row.neighborhood.labelHe),
    row.passedThreshold ? null : el("p", { class: "tone-red" }, `${copy.dropped} · ${copy.threshold}`),
  );
  return item;
}

function nightBoardTitle(mode: BoardMode, difficulty?: string): string {
  if (mode === "daily") return copy.modeDaily;
  const level = difficultyById(difficulty).labelHe;
  const modeHe = mode === "create" ? copy.modeCreate : copy.modeDraft;
  return `${modeHe} · ${level}`;
}
