import type { PersonId, SlateId } from "../data/types";
import { getPerson } from "../data/pool";
import {
  applyCpuTurn,
  applyPick,
  clampCpus,
  createDraft,
  currentList,
  DIFFICULTIES,
  isDraftOver,
  legalRemaining,
  MAX_CPU,
  MIN_CPU,
  slateCountOnList,
  type DifficultyId,
  type DraftState,
} from "../systems/draft";
import { resolveElection, type ElectionResult } from "../systems/resolve";
import { copy } from "./copy";
import { el, prefersReducedMotion } from "./dom";
import { renderHowCalc } from "./info";
import { hoverEdge, hoverPerson, renderDraft, type DraftView, type PickNotice } from "./draft";
import { resetMeters } from "./meters";
import { hintFor } from "./tree";
import { renderResolve } from "./resolve";

type Screen = "setup" | "draft" | "resolve";

interface AppState {
  screen: Screen;
  nCpus: number;
  difficulty: DifficultyId;
  draft: DraftState;
  focusId: PersonId | null;
  hoverId: PersonId | null;
  selectedEdge: string | null;
  hoverEdge: string | null;
  openSlate: SlateId | null;
  result: ElectionResult | null;
  liveText: string;
  cpuThinking: boolean;
  notices: PickNotice[];
}

let state: AppState = freshState(1);
let cpuTimer = 0;
let root: HTMLElement;

export function mount(appRoot: HTMLElement): void {
  root = appRoot;
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (state.selectedEdge) {
      state.selectedEdge = null;
      render();
      return;
    }
    if (state.openSlate) {
      state.openSlate = null;
      state.focusId = null;
      render();
    }
  });
  render();
}

function freshState(nCpus: number, difficulty: DifficultyId = "open"): AppState {
  return {
    screen: "setup",
    nCpus: clampCpus(nCpus),
    difficulty,
    draft: createDraft(nCpus, playSeed(), difficulty),
    focusId: null,
    hoverId: null,
    selectedEdge: null,
    hoverEdge: null,
    openSlate: null,
    result: null,
    liveText: "",
    cpuThinking: false,
    notices: [],
  };
}

function playSeed(): number {
  return Math.floor(Math.random() * 0x7fffffff) || 1;
}

function render(): void {
  const focused = document.activeElement;
  const focusPerson = focused instanceof HTMLElement ? focused.dataset.person : undefined;
  root.replaceChildren();
  if (state.screen === "setup") {
    root.append(renderSetup());
  } else if (state.screen === "draft") {
    root.append(
      renderDraft(draftView(), {
        onHover: (id) => {
          if (state.hoverId === id) return;
          state.hoverId = id;
          const player = state.draft.lists.find((list) => list.isPlayer);
          hoverPerson(root, id, state.focusId, player?.picks ?? []);
        },
        onFocus: (id) => {
          if (state.focusId === id) return;
          state.focusId = id;
          render();
        },
        onPick: pick,
        onEdge: (key) => {
          state.selectedEdge = state.selectedEdge === key ? null : key;
          state.hoverEdge = state.selectedEdge;
          render();
        },
        onEdgeHover: (key) => {
          if (state.hoverEdge === key) return;
          state.hoverEdge = key;
          const player = state.draft.lists.find((list) => list.isPlayer);
          hoverEdge(
            root,
            key ?? state.selectedEdge,
            hintFor(state.hoverId ?? state.focusId, player?.picks ?? []),
          );
        },
        onOpenSlate: (id) => {
          if (state.openSlate === id) return;
          state.openSlate = id;
          state.focusId = null;
          render();
        },
        onCloseSlate: () => {
          state.openSlate = null;
          state.focusId = null;
          render();
        },
      }),
    );
  } else if (state.result) {
    root.append(renderResolve(state.result, replay));
  }

  const restore = focusPerson ?? state.focusId;
  if (restore) {
    const node = root.querySelector<HTMLElement>(`[data-person="${restore}"]`);
    if (node && document.activeElement !== node && focused instanceof HTMLElement && focused.dataset.person) {
      node.focus();
    }
  }
}

function draftView(): DraftView {
  const turn = currentList(state.draft);
  return {
    lists: state.draft.lists,
    hoverId: state.hoverId,
    focusId: state.focusId,
    selectedEdge: state.selectedEdge,
    hoverEdge: state.hoverEdge,
    remaining: legalRemaining(
      state.draft.lists.find((list) => list.isPlayer)?.picks ?? [],
      state.draft.remaining,
      state.draft.slateCap,
    ),
    canPick: Boolean(turn?.isPlayer) && !state.cpuThinking && !isDraftOver(state.draft),
    openSlate: state.openSlate,
    liveText: state.liveText,
    cpuThinking: state.cpuThinking,
    notices: state.notices,
    difficulty: state.draft.difficulty,
  };
}

function renderSetup(): HTMLElement {
  const screen = el("div", { class: "screen setup-screen" });
  screen.append(
    el(
      "header",
      { class: "mast tall" },
      el("div", { class: "brand" }, el("h1", {}, copy.title), el("p", { class: "tagline" }, copy.tagline)),
      renderHowCalc(),
    ),
    el("p", { class: "sponsor" }, copy.sponsor),
    el("p", { class: "disclosure" }, copy.disclosure),
  );

  const field = el("fieldset", { class: "n-pick" }, el("legend", {}, copy.nLabel));
  for (let n = MIN_CPU; n <= MAX_CPU; n++) {
    const id = `cpu-${n}`;
    const label = el(
      "label",
      { class: state.nCpus === n ? "is-on" : "" },
      el("input", {
        type: "radio",
        name: "cpus",
        id,
        value: n,
        ...(state.nCpus === n ? { checked: true } : {}),
      }),
      ` ${n}`,
    );
    label.querySelector("input")?.addEventListener("change", () => {
      state.nCpus = n;
      render();
    });
    field.append(label);
  }
  screen.append(field);

  const levels = el("fieldset", { class: "level-pick" }, el("legend", {}, copy.levelLabel));
  for (const row of DIFFICULTIES) {
    const id = `level-${row.id}`;
    const label = el(
      "label",
      { class: state.difficulty === row.id ? "is-on" : "" },
      el("input", {
        type: "radio",
        name: "level",
        id,
        value: row.id,
        ...(state.difficulty === row.id ? { checked: true } : {}),
      }),
      el("span", { class: "level-name" }, row.labelHe),
      el("span", { class: "level-hint" }, row.hintHe),
    );
    label.querySelector("input")?.addEventListener("change", () => {
      state.difficulty = row.id;
      render();
    });
    levels.append(label);
  }
  screen.append(levels);

  const start = el("button", { type: "button", class: "primary" }, copy.start);
  start.addEventListener("click", () => {
    resetMeters();
    state = { ...freshState(state.nCpus, state.difficulty), screen: "draft", liveText: copy.yourTurn };
    render();
  });
  screen.append(el("div", { class: "confirm-bar" }, start));
  return screen;
}

function pick(id: PersonId): void {
  const turn = currentList(state.draft);
  if (!turn?.isPlayer || state.cpuThinking) return;
  if (!state.draft.remaining.includes(id)) return;
  const slate = getPerson(id).slateId;
  state.draft = applyPick(state.draft, id);
  state.focusId = null;
  state.hoverId = null;
  const player = state.draft.lists.find((list) => list.isPlayer);
  const cap = state.draft.slateCap;
  const atCap = cap != null && player && slateCountOnList(player.picks, slate) >= cap;
  const stillInSlate = state.draft.remaining.some((left) => getPerson(left).slateId === slate);
  state.openSlate = !atCap && stillInSlate ? slate : null;
  state.notices = [];
  state.liveText = `שובץ ${getPerson(id).nameHe}`;
  if (isDraftOver(state.draft)) {
    finish();
    return;
  }
  render();
  runCpuTurns();
}

function runCpuTurns(): void {
  window.clearTimeout(cpuTimer);
  if (isDraftOver(state.draft)) {
    finish();
    return;
  }
  const turn = currentList(state.draft);
  if (!turn || turn.isPlayer) {
    state.cpuThinking = false;
    state.liveText = copy.yourTurn;
    render();
    return;
  }
  state.cpuThinking = true;
  const cpuNo = turn.draftOrder;
  state.liveText = copy.cpuTurn(cpuNo);
  render();
  const delay = prefersReducedMotion() ? 0 : 420;
  cpuTimer = window.setTimeout(() => {
    const before = turn.picks.length;
    state.draft = applyCpuTurn(state.draft);
    const picked = currentAfterPick(turn.id, before);
    if (picked) {
      const list = state.draft.lists.find((row) => row.id === turn.id);
      state.notices = [
        ...state.notices,
        { listHe: turn.labelHe, personId: picked, slot: list?.picks.length ?? 0 },
      ];
      state.liveText = `${turn.labelHe} לקח את ${getPerson(picked).nameHe}`;
    }
    if (isDraftOver(state.draft)) {
      finish();
      return;
    }
    runCpuTurns();
  }, delay);
}

function currentAfterPick(listId: string, prevLen: number): PersonId | null {
  const list = state.draft.lists.find((l) => l.id === listId);
  return list?.picks[prevLen] ?? list?.picks.at(-1) ?? null;
}

function finish(): void {
  window.clearTimeout(cpuTimer);
  state.cpuThinking = false;
  state.result = resolveElection(state.draft.lists);
  state.screen = "resolve";
  state.liveText = state.result.why.he;
  resetMeters();
  render();
}

function replay(): void {
  window.clearTimeout(cpuTimer);
  resetMeters();
  state = freshState(state.nCpus, state.difficulty);
  render();
}
