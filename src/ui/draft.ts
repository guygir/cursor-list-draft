import { getPerson, slateLabelHe } from "../data/pool";
import { bindPortrait, portraitSrc } from "../data/portraits";
import type { DraftList, PersonId } from "../data/types";
import { difficultyById, LIST_SIZE, type DifficultyId } from "../systems/draft";
import { listMeters } from "../systems/scores";
import { copy } from "./copy";
import { el } from "./dom";
import { renderHowCalc } from "./info";
import { scoreMeters } from "./meters";
import { renderMemberPicker } from "./members";
import {
  edgeLine,
  hintFor,
  peopleInSlate,
  renderDraftLegend,
  renderEdgeTip,
  renderTreeMap,
  slatesWithPeople,
  type TreeHandlers,
  type TreeView,
} from "./tree";

export interface DraftHandlers extends TreeHandlers {
  onCloseSlate: () => void;
  onQuit: () => void;
  onAutoPick: () => void;
}

export interface PickNotice {
  listHe: string;
  personId: PersonId;
  slot: number;
}

export interface DraftView extends TreeView {
  liveText: string;
  cpuThinking: boolean;
  notices: PickNotice[];
  difficulty: DifficultyId;
}

export function renderDraft(view: DraftView, handlers: DraftHandlers): HTMLElement {
  const player = view.lists.find((l) => l.isPlayer);
  const focus = view.focusId ? getPerson(view.focusId) : null;
  const inspectId = view.hoverId ?? view.focusId;
  const root = el("div", { class: `screen draft-screen ${player?.picks.length ? "has-hub" : ""}` });

  root.append(renderHeader(view, player, handlers));
  root.append(renderSlots(player, view.lists));

  const stage = el("div", { class: "graph-pane" });
  stage.append(renderNotices(view.notices));
  stage.append(renderTreeMap(view, handlers));
  if (player?.picks.length) stage.append(renderDraftLegend());
  stage.append(renderEdgeTip(view.hoverEdge ?? view.selectedEdge));
  stage.append(el("p", { class: "hint-line" }, hintFor(inspectId, player?.picks ?? [], view.hoverEdge ?? view.selectedEdge)));
  root.append(stage);

  root.append(renderPickDock(view, handlers, player?.picks ?? []));

  const confirm = el(
    "button",
    {
      type: "button",
      class: "primary confirm-btn",
      disabled: !canConfirm(view),
    },
    focus && canConfirm(view) ? copy.confirm(focus.nameHe) : view.openSlate ? copy.confirmEmpty : copy.chooseParty,
  );
  confirm.addEventListener("click", () => {
    if (view.focusId && canConfirm(view)) handlers.onPick(view.focusId);
  });
  const auto = el(
    "button",
    {
      type: "button",
      class: "auto-pick-btn",
      disabled: !view.canPick || view.remaining.length === 0,
    },
    copy.autoPick,
  );
  auto.addEventListener("click", () => {
    if (!view.canPick || view.remaining.length === 0) return;
    handlers.onAutoPick();
  });
  root.append(el("div", { class: "confirm-bar is-split" }, confirm, auto));
  root.append(renderRivals(view.lists));
  root.append(el("div", { class: "sr-only", "aria-live": "polite" }, view.liveText));
  return root;
}

function canConfirm(view: DraftView): boolean {
  return Boolean(
    view.canPick && view.focusId && view.remaining.includes(view.focusId) && !view.cpuThinking,
  );
}

function renderHeader(view: DraftView, player: DraftList | undefined, handlers: DraftHandlers): HTMLElement {
  const filled = player?.picks.length ?? 0;
  const quit = el("button", { type: "button", class: "chrome-btn quit-btn" }, copy.quitToMenu);
  quit.addEventListener("click", handlers.onQuit);
  return el(
    "header",
    { class: "mast compact" },
    el(
      "div",
      { class: "brand" },
      el("h1", {}, copy.title),
      player ? el("p", { class: "party-label" }, player.labelHe) : null,
    ),
    el(
      "div",
      { class: "mast-tools" },
      view.difficulty !== "open"
        ? el("p", { class: "hard-badge" }, difficultyById(view.difficulty).labelHe)
        : null,
      el("p", { class: "pick-count" }, copy.pickN(Math.min(filled + 1, LIST_SIZE), LIST_SIZE)),
      renderHowCalc(),
      quit,
    ),
  );
}

function renderSlots(player: DraftList | undefined, lists: DraftList[]): HTMLElement {
  const wrap = el("section", { class: "slot-rail-wrap", "aria-label": copy.yourParty });
  const meters = player
    ? listMeters(player, lists)
    : { cohesionPct: 0, demandPct: 0 };
  wrap.append(scoreMeters(meters.cohesionPct, meters.demandPct, "live", { picks: player?.picks.length ?? 0 }));
  const ol = el("ol", { class: "slot-rail" });
  for (let i = 0; i < LIST_SIZE; i++) {
    const id = player?.picks[i];
    const person = id ? getPerson(id) : null;
    const photo = id ? portraitSrc(id) : null;
    ol.append(
      el(
        "li",
        { class: person ? "slot filled" : "slot empty" },
        el("span", { class: "slot-n" }, String(i + 1)),
        photo
          ? bindPortrait(
              el("img", {
                class: "slot-photo",
                src: photo,
                alt: "",
                width: 18,
                height: 18,
                referrerpolicy: "no-referrer",
              }),
              id!,
            )
          : null,
        el("span", { class: "slot-name" }, person ? person.nameHe : copy.emptySlot),
      ),
    );
  }
  wrap.append(ol);
  return wrap;
}

function renderPickDock(view: DraftView, handlers: DraftHandlers, picks: PersonId[]): HTMLElement {
  const dock = el("section", { class: "pick-dock", "aria-label": copy.pool });
  if (view.openSlate && picks.length) {
    dock.append(
      renderMemberPicker({
        ids: peopleInSlate(view.remaining, view.openSlate),
        slate: view.openSlate,
        picks,
        focusId: view.focusId,
        canPick: view.canPick,
        variant: "dock",
        onHover: handlers.onHover,
        onFocus: handlers.onFocus,
        onPick: handlers.onPick,
        onCloseSlate: handlers.onCloseSlate,
      }),
    );
  } else if (picks.length) {
    dock.append(renderPartyChips(view, handlers));
  }
  return dock;
}

function renderPartyChips(view: DraftView, handlers: DraftHandlers): HTMLElement {
  const row = el("div", { class: "party-chip-row" });
  for (const slate of slatesWithPeople(view.remaining)) {
    const btn = el(
      "button",
      {
        type: "button",
        class: `party-btn chip ${view.openSlate === slate ? "is-hot" : ""}`,
        "data-slate": slate,
      },
      slateLabelHe(slate),
    );
    btn.addEventListener("click", () => handlers.onOpenSlate(slate));
    row.append(btn);
  }
  return row;
}

function renderNotices(notices: PickNotice[]): HTMLElement {
  const rail = el("aside", { class: "notice-rail", "aria-label": copy.roundNotices, "aria-live": "polite" });
  for (const notice of notices) {
    const person = getPerson(notice.personId);
    const photo = portraitSrc(notice.personId);
    rail.append(
      el(
        "p",
        { class: "notice" },
        bindPortrait(
          el("img", {
            class: "notice-photo",
            src: photo,
            alt: "",
            referrerpolicy: "no-referrer",
          }),
          notice.personId,
        ),
        el("span", {}, copy.cpuNotice(notice.listHe, person.nameHe, notice.slot)),
      ),
    );
  }
  return rail;
}

function renderRivals(lists: DraftList[]): HTMLElement {
  const parts = lists
    .filter((l) => !l.isPlayer)
    .map((list) => {
      const names = list.picks.map((id) => getPerson(id).nameHe).join(" · ") || copy.emptySlot;
      return `${list.labelHe}: ${names}`;
    });
  return el("p", { class: "rival-line", "aria-label": copy.parties }, parts.join("  ·  "));
}

export function hoverEdge(root: HTMLElement, key: string | null, personHint: string): void {
  root.querySelectorAll(".chem-edge.is-selected").forEach((node) => node.classList.remove("is-selected"));
  if (key) {
    root.querySelectorAll(`[data-edge="${key}"] .chem-edge`).forEach((node) => node.classList.add("is-selected"));
  }
  const tip = root.querySelector(".edge-tip");
  if (tip) tip.replaceWith(renderEdgeTip(key));
  const hint = root.querySelector(".hint-line");
  if (hint) hint.textContent = key ? edgeLine(key) : personHint;
}

export function hoverPerson(root: HTMLElement, id: PersonId | null, fallback: PersonId | null, picks: PersonId[]): void {
  root.querySelectorAll(".person-node.is-hot").forEach((node) => node.classList.remove("is-hot"));
  root.querySelectorAll(".name-btn.is-hot").forEach((node) => node.classList.remove("is-hot"));
  const shown = id ?? fallback;
  if (shown) {
    root.querySelectorAll(`[data-person="${shown}"]`).forEach((node) => node.classList.add("is-hot"));
  }
  const hint = root.querySelector(".hint-line");
  if (hint) hint.textContent = hintFor(shown, picks);
}
