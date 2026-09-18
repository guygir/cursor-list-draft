import { getPerson } from "../data/pool";
import type { ElectionResult, ListScore } from "../systems/resolve";
import { DEMAND_SCALE } from "../systems/scores";
import { KNESSET_SEATS } from "../systems/seats";
import { copy } from "./copy";
import { el } from "./dom";
import { renderHowCalc } from "./info";
import { countUp, scoreMeters } from "./meters";
import { renderEdgeCard, renderTreeMap, type TreeHandlers } from "./tree";

export function renderResolve(result: ElectionResult, onReplay: () => void): HTMLElement {
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
    el("div", { class: "ticker" }, copy.disclosure),
  );

  const board = el("div", { class: "night-board" });
  for (const row of [...result.lists].sort((a, b) => b.seats - a.seats)) {
    board.append(renderListBar(row, result.winnerId));
  }
  root.append(board);

  root.append(
    el("section", { class: "why-block" }, el("h2", {}, copy.why), el("p", { class: "why-line" }, result.why.he)),
  );

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
  root.append(el("div", { class: "confirm-bar" }, replay));
  return root;
}

function renderListBar(row: ListScore, winnerId: string): HTMLElement {
  const names = row.list.picks.map((id) => getPerson(id).nameHe).join(" · ");
  const pct = (row.seats / KNESSET_SEATS) * 100;
  const cohesionPct = Math.round(row.cohesion * 100);
  const demandPct = Math.round(Math.min(100, (row.massAfterSplit / DEMAND_SCALE) * 100));
  const seatNum = el("strong", { class: "seat-num" }, "0");
  countUp(seatNum, 0, row.seats, row.list.isPlayer ? 0 : 80);
  const item = el(
    "article",
    { class: `mandate-row ${row.list.id === winnerId ? "is-winner" : ""} ${row.list.isPlayer ? "is-player" : ""}` },
    el(
      "header",
      {},
      el("h3", {}, row.list.labelHe),
      seatNum,
      el("span", { class: "seat-unit" }, copy.seats),
    ),
    el("p", { class: "row-names" }, names),
    el(
      "div",
      { class: "bar-track", "aria-hidden": "true" },
      el("span", { class: "meter-ticks", "aria-hidden": "true" }),
      el("div", { class: "bar-fill is-seats", style: `--from:0%;--target:${pct}%` }),
    ),
    scoreMeters(cohesionPct, demandPct, "fresh"),
    el("p", { class: "hill-note" }, row.neighborhood.labelHe),
    row.passedThreshold ? null : el("p", { class: "tone-red" }, `${copy.dropped} · ${copy.threshold}`),
  );
  return item;
}
