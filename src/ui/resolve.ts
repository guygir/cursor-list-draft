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
import { instagramStoryHref, whatsAppHref } from "./share-card";
import { renderEdgeCard, renderTreeMap, type TreeHandlers } from "./tree";

export function renderResolve(
  result: ElectionResult,
  onReplay: () => void,
  opts: {
    shareHint?: string;
    onShare?: () => Promise<void> | void;
    onShareCard?: (kind: "square" | "story") => Promise<"shared" | "saved">;
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
  const bar = el("div", { class: "confirm-bar is-split" }, replay);
  if (opts.onShareCard) {
    bar.append(renderShareRow(result, opts));
  } else if (opts.onShare) {
    const share = el("button", { type: "button", class: "share-btn" }, copy.share);
    share.addEventListener("click", async () => {
      await opts.onShare?.();
      share.textContent = copy.shared;
    });
    bar.append(share);
  }
  root.append(bar);
  if (opts.shareHint) root.append(el("p", { class: "no-board" }, opts.shareHint));
  return root;
}

function renderShareRow(
  result: ElectionResult,
  opts: {
    onShare?: () => Promise<void> | void;
    onShareCard?: (kind: "square" | "story") => Promise<"shared" | "saved">;
    shareUrl?: string;
  },
): HTMLElement {
  const row = el("div", { class: "share-row" });
  const player = result.lists.find((item) => item.list.isPlayer);
  const caption = `${player?.list.labelHe ?? copy.yourParty}: ${player?.seats ?? 0} ${copy.seats}. ${copy.winBySeats}\n${opts.shareUrl ?? ""}`;

  const wa = iconButton("whatsapp", copy.shareWhatsApp, WA_ICON);
  wa.addEventListener("click", async () => {
    const outcome = await opts.onShareCard?.("square");
    if (outcome === "saved") openShareSheet(row, "wa", caption);
  });
  const ig = iconButton("instagram", copy.shareInstagram, IG_ICON);
  ig.addEventListener("click", async () => {
    const outcome = await opts.onShareCard?.("story");
    if (outcome === "saved") openShareSheet(row, "ig", caption);
  });
  row.append(wa, ig);
  if (opts.onShare) {
    const link = el("button", { type: "button", class: "share-btn" }, copy.share);
    link.addEventListener("click", async () => {
      await opts.onShare?.();
      link.textContent = copy.shared;
    });
    row.append(link);
  }
  return row;
}

function openShareSheet(host: HTMLElement, kind: "wa" | "ig", caption: string): void {
  host.querySelector(".share-sheet")?.remove();
  const sheet = el("div", { class: "share-sheet", role: "status" });
  sheet.append(
    el("p", {}, kind === "wa" ? copy.shareReadyWa : copy.shareReadyIg),
    el(
      "a",
      {
        class: "share-sheet-link",
        href: kind === "wa" ? whatsAppHref(caption) : instagramStoryHref(),
        target: kind === "wa" ? "_blank" : undefined,
        rel: "noreferrer",
      },
      kind === "wa" ? copy.shareOpenWa : copy.shareOpenIg,
    ),
    el("p", { class: "share-sheet-note" }, copy.shareSave),
  );
  host.append(sheet);
}

function iconButton(kind: string, label: string, svg: string): HTMLButtonElement {
  const btn = el("button", { type: "button", class: `share-icon-button is-${kind}`, "aria-label": label });
  btn.insertAdjacentHTML("afterbegin", svg);
  btn.append(el("span", {}, label));
  return btn;
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
      el(
        "div",
        { class: "seat-cluster" },
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
    ),
    el("p", { class: "row-names" }, names),
    scoreMeters(cohesionPct, demandPct, "fresh", { delay: rowDelay + NIGHT_METER_DELAY_MS }),
    el("p", { class: "hill-note" }, `${row.neighborhood.labelHe} · ${copy.afterSplit}`),
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

const WA_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19.05 4.91A9.9 9.9 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.27-1.38a9.86 9.86 0 0 0 4.77 1.21h0c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01zm-7.01 15.24h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.13.82.84-3.05-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.02 4.54-3.67 8.24-8.24 8.24zm4.52-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74 1.49.64 2.08.7 2.83.59.43-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.23-.17-.48-.29z"/></svg>`;

const IG_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm10 1.7H7A2.3 2.3 0 0 0 4.7 7v10A2.3 2.3 0 0 0 7 19.3h10A2.3 2.3 0 0 0 19.3 17V7A2.3 2.3 0 0 0 17 4.7zM12 7.6A4.4 4.4 0 1 1 7.6 12 4.4 4.4 0 0 1 12 7.6zm0 1.6A2.8 2.8 0 1 0 14.8 12 2.8 2.8 0 0 0 12 9.2zm5.35-2.85a1.05 1.05 0 1 1-1.05 1.05 1.05 1.05 0 0 1 1.05-1.05z"/></svg>`;
