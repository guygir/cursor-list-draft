import type { PersonAspects, PersonId, SlateId } from "../data/types";
import { getPerson } from "../data/pool";
import { greedyCpuPick } from "../systems/cpu";
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
  renameList,
  slateCountOnList,
  type DifficultyId,
  type DraftState,
} from "../systems/draft";
import { recordRun, type BoardEntry } from "../systems/board";
import { loadOrCreatePartyName, loadOrCreatePlayerName, savePartyName, savePlayerName } from "../systems/names";
import { prefetchPortraits } from "../data/portraits";
import { hydrateRemoteBoard, pushRemoteRun } from "../systems/board-api";
import {
  customSharePath,
  dailyHubId,
  dailySeed,
  dailySharePath,
  decodeCustomCode,
  defaultAspects,
  encodeCustomCode,
  ensureCustomLeader,
  israelDateKey,
  makeCustomLeader,
  nearestSlate,
  sanitizeLeaderName,
  type LeaderLook,
} from "../systems/modes";
import { resolveElection, type ElectionResult } from "../systems/resolve";
import { copy } from "./copy";
import { firstPlaceOf, renderBoardPanel } from "./board";
import { renderCreateLeader } from "./create";
import { el, prefersReducedMotion } from "./dom";
import { renderNameEdit } from "./name-edit";
import { renderHowCalc } from "./info";
import { hoverEdge, hoverPerson, renderDraft, type DraftView, type PickNotice } from "./draft";
import { resetMeters } from "./meters";
import { makeResultCard, shareCaption, shareFilesOrDownload } from "./share-card";
import { hintFor } from "./tree";
import { renderResolve } from "./resolve";

type Screen = "setup" | "create" | "draft" | "resolve" | "board";
type PlayMode = "draft" | "create" | "daily";

interface AppState {
  screen: Screen;
  playMode: PlayMode;
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
  customName: string;
  customAspects: PersonAspects;
  customLook: LeaderLook;
  dayKey: string;
  boardEntry: BoardEntry | null;
  playerName: string;
  partyName: string;
}

let state: AppState = freshState(1);
let cpuTimer = 0;
let root: HTMLElement;

export function mount(appRoot: HTMLElement): void {
  const first = !root;
  root = appRoot;
  prefetchPortraits();
  state = freshState(1);
  if (first) document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (state.screen === "create" || state.screen === "board") {
      state.screen = "setup";
      render();
      return;
    }
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
  bootFromUrl();
  render();
  void hydrateBoard();
}

function freshState(nCpus: number, difficulty: DifficultyId = "open", playMode: PlayMode = "draft"): AppState {
  const partyName = loadOrCreatePartyName();
  return {
    screen: "setup",
    playMode,
    nCpus: clampCpus(nCpus),
    difficulty,
    draft: createDraft(nCpus, playSeed(), difficulty, undefined, { player: partyName }),
    focusId: null,
    hoverId: null,
    selectedEdge: null,
    hoverEdge: null,
    openSlate: null,
    result: null,
    liveText: "",
    cpuThinking: false,
    notices: [],
    customName: "",
    customAspects: defaultAspects(),
    customLook: "woman",
    dayKey: israelDateKey(),
    boardEntry: null,
    playerName: loadOrCreatePlayerName(),
    partyName,
  };
}

function playSeed(): number {
  return Math.floor(Math.random() * 0x7fffffff) || 1;
}

function render(): void {
  const focused = document.activeElement;
  const focusPerson = focused instanceof HTMLElement ? focused.dataset.person : undefined;
  const prev = root.firstElementChild;
  const setupScroll =
    state.screen === "setup" && prev instanceof HTMLElement && prev.classList.contains("setup-screen")
      ? prev.scrollTop
      : null;
  root.replaceChildren();
  if (state.screen === "setup") {
    root.append(renderSetup());
  } else if (state.screen === "board") {
    root.append(renderBoardScreen());
  } else if (state.screen === "create") {
    root.append(
      renderCreateLeader({
        nameHe: state.customName,
        aspects: state.customAspects,
        look: state.customLook,
        onStart: startCreateDraft,
        onBack: () => {
          state.screen = "setup";
          render();
        },
      }),
    );
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
        onRenameParty: (name) => {
          state.partyName = savePartyName(name);
          state.draft = renameList(state.draft, "player", state.partyName);
          render();
        },
        onAutoPick: autoPick,
      }),
    );
  } else if (state.result) {
    root.append(
      renderResolve(state.result, replay, {
        shareHint: copy.boardLocal,
        onShare: shareRun,
        onShareCard: shareCard,
        shareUrl: location.href,
        boardMode: state.playMode,
        difficulty: state.difficulty,
        ...(state.playMode === "daily" ? { dayKey: state.dayKey } : {}),
        ...(state.boardEntry ? { boardEntry: state.boardEntry } : {}),
      }),
    );
  }

  const restore = focusPerson ?? state.focusId;
  if (restore) {
    const node = root.querySelector<HTMLElement>(`[data-person="${restore}"]`);
    if (node && document.activeElement !== node && focused instanceof HTMLElement && focused.dataset.person) {
      node.focus();
    }
  }
  if (setupScroll != null) {
    const next = root.querySelector<HTMLElement>(".setup-screen");
    if (next) next.scrollTop = setupScroll;
  } else if (state.screen === "resolve" || state.screen === "board") {
    root.querySelector<HTMLElement>(".resolve-screen, .setup-screen")?.scrollTo(0, 0);
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
  const openBoard = () => {
    state.screen = "board";
    render();
  };
  const boardBtn = el("button", { type: "button", class: "text-btn board-open mast-board" }, copy.boardOpen);
  boardBtn.addEventListener("click", openBoard);
  screen.append(
    el(
      "header",
      { class: "mast tall" },
      el("div", { class: "brand" }, el("h1", {}, copy.title), el("p", { class: "tagline" }, copy.tagline)),
      el("div", { class: "mast-tools" }, boardBtn, renderHowCalc()),
    ),
    el("p", { class: "sponsor" }, copy.sponsor),
    el("p", { class: "disclosure" }, copy.disclosure),
    renderIdentity(),
  );

  const modes = el("fieldset", { class: "mode-pick" }, el("legend", {}, copy.modeLabel));
  const todayName = getPerson(dailyHubId(state.dayKey)).nameHe;
  const modeRows: Array<{ id: PlayMode; title: string; hint: string }> = [
    { id: "draft", title: copy.modeDraft, hint: copy.modeDraftHint },
    { id: "create", title: copy.modeCreate, hint: copy.modeCreateHint },
    { id: "daily", title: copy.modeDaily, hint: copy.modeDailyHint(todayName) },
  ];
  for (const row of modeRows) {
    const btn = el(
      "button",
      { type: "button", class: `mode-btn ${state.playMode === row.id ? "is-on" : ""}`, "data-mode": row.id },
      el("strong", {}, row.title),
      el("span", {}, row.hint),
    );
    btn.addEventListener("click", () => {
      if (state.playMode === row.id) return;
      state.playMode = row.id;
      if (!patchSetup()) render();
    });
    modes.append(btn);
  }
  screen.append(modes);

  const dailyLock = state.playMode === "daily";
  const field = el(
    "fieldset",
    { class: `n-pick ${dailyLock ? "is-locked" : ""}`, ...(dailyLock ? { "aria-disabled": "true" } : {}) },
    el("legend", {}, copy.nLabel),
  );
  for (let n = MIN_CPU; n <= MAX_CPU; n++) {
    const id = `cpu-${n}`;
    const label = el(
      "label",
      { class: state.nCpus === n ? "is-on" : "", "data-n": String(n) },
      el("input", {
        type: "radio",
        name: "cpus",
        id,
        value: n,
        ...(state.nCpus === n ? { checked: true } : {}),
        ...(dailyLock ? { disabled: true } : {}),
      }),
      ` ${n}`,
    );
    label.querySelector("input")?.addEventListener("change", () => {
      if (state.playMode === "daily") return;
      state.nCpus = n;
      if (!patchSetup()) render();
    });
    field.append(label);
  }
  screen.append(field);

  const levels = el(
    "fieldset",
    { class: `level-pick ${dailyLock ? "is-locked" : ""}`, ...(dailyLock ? { "aria-disabled": "true" } : {}) },
    el("legend", {}, copy.levelLabel),
  );
  for (const row of DIFFICULTIES) {
    const id = `level-${row.id}`;
    const label = el(
      "label",
      { class: state.difficulty === row.id ? "is-on" : "", "data-level": row.id },
      el("input", {
        type: "radio",
        name: "level",
        id,
        value: row.id,
        ...(state.difficulty === row.id ? { checked: true } : {}),
        ...(dailyLock ? { disabled: true } : {}),
      }),
      el("span", { class: "level-name" }, row.labelHe),
      el("span", { class: "level-hint" }, row.hintHe),
    );
    label.querySelector("input")?.addEventListener("change", () => {
      if (state.playMode === "daily") return;
      state.difficulty = row.id;
      if (!patchSetup()) render();
    });
    levels.append(label);
  }
  screen.append(levels);

  const start = el("button", { type: "button", class: "primary setup-start" }, startLabel());
  start.addEventListener("click", beginFromSetup);
  screen.append(el("div", { class: "confirm-bar" }, start));
  screen.append(renderRecordTeaser());
  screen.append(el("p", { class: "no-board" }, copy.boardLocal));
  return screen;
}

function patchSetup(): boolean {
  const screen = root.querySelector<HTMLElement>(".setup-screen");
  if (!screen || state.screen !== "setup") return false;
  const dailyLock = state.playMode === "daily";
  screen.querySelectorAll<HTMLButtonElement>(".mode-btn[data-mode]").forEach((btn) => {
    btn.classList.toggle("is-on", btn.dataset.mode === state.playMode);
  });
  const nPick = screen.querySelector<HTMLElement>(".n-pick");
  if (nPick) {
    nPick.classList.toggle("is-locked", dailyLock);
    if (dailyLock) nPick.setAttribute("aria-disabled", "true");
    else nPick.removeAttribute("aria-disabled");
    nPick.querySelectorAll<HTMLLabelElement>("label[data-n]").forEach((label) => {
      const n = Number(label.dataset.n);
      label.classList.toggle("is-on", n === state.nCpus);
      const input = label.querySelector<HTMLInputElement>("input");
      if (input) {
        input.checked = n === state.nCpus;
        input.disabled = dailyLock;
      }
    });
  }
  const levels = screen.querySelector<HTMLElement>(".level-pick");
  if (levels) {
    levels.classList.toggle("is-locked", dailyLock);
    if (dailyLock) levels.setAttribute("aria-disabled", "true");
    else levels.removeAttribute("aria-disabled");
    levels.querySelectorAll<HTMLLabelElement>("label[data-level]").forEach((label) => {
      label.classList.toggle("is-on", label.dataset.level === state.difficulty);
      const input = label.querySelector<HTMLInputElement>("input");
      if (input) {
        input.checked = label.dataset.level === state.difficulty;
        input.disabled = dailyLock;
      }
    });
  }
  const start = screen.querySelector<HTMLButtonElement>(".setup-start");
  if (start) start.textContent = startLabel();
  const first = firstPlaceOf({
    mode: state.playMode,
    difficulty: state.playMode === "daily" ? "open" : state.difficulty,
    ...(state.playMode === "daily" ? { dayKey: state.dayKey } : {}),
  });
  const teaser = screen.querySelector<HTMLButtonElement>(".record-teaser-btn");
  if (teaser) teaser.textContent = first ? copy.firstPlace(first.playerName || first.hubName, first.seats) : copy.noFirstPlace;
  return true;
}

function renderIdentity(): HTMLElement {
  const row = el("div", { class: "identity-row" });
  row.append(
    el(
      "label",
      { class: "identity-field" },
      el("span", {}, copy.playerName),
      renderNameEdit({
        value: state.playerName,
        ariaLabel: copy.playerName,
        className: "is-player",
        onCommit: (name) => {
          state.playerName = savePlayerName(name);
          render();
        },
      }),
    ),
    el(
      "label",
      { class: "identity-field" },
      el("span", {}, copy.partyName),
      renderNameEdit({
        value: state.partyName,
        ariaLabel: copy.partyName,
        className: "is-party",
        onCommit: (name) => {
          state.partyName = savePartyName(name);
          state.draft = renameList(state.draft, "player", state.partyName);
          render();
        },
      }),
    ),
  );
  return row;
}

function renderRecordTeaser(): HTMLElement {
  const first = firstPlaceOf({
    mode: state.playMode,
    difficulty: state.playMode === "daily" ? "open" : state.difficulty,
    ...(state.playMode === "daily" ? { dayKey: state.dayKey } : {}),
  });
  const open = () => {
    state.screen = "board";
    render();
  };
  const box = el("div", { class: "record-teaser" });
  const line = el(
    "button",
    { type: "button", class: "record-teaser-btn" },
    first ? copy.firstPlace(first.playerName || first.hubName, first.seats) : copy.noFirstPlace,
  );
  line.addEventListener("click", open);
  box.append(line);
  return box;
}

function renderBoardScreen(): HTMLElement {
  const screen = el("div", { class: "screen setup-screen" });
  screen.append(
    el(
      "header",
      { class: "mast tall" },
      el("div", { class: "brand" }, el("h1", {}, copy.boardTitle), el("p", { class: "tagline" }, copy.boardLocal)),
    ),
  );
  const panels = [
    renderBoardPanel({
      mode: "daily",
      dayKey: state.dayKey,
      difficulty: "open",
      title: copy.modeDaily,
      hideNote: true,
    }),
    ...DIFFICULTIES.map((row) =>
      renderBoardPanel({
        mode: "create",
        difficulty: row.id,
        title: `${copy.modeCreate} · ${row.labelHe}`,
        hideNote: true,
      }),
    ),
    ...DIFFICULTIES.map((row) =>
      renderBoardPanel({
        mode: "draft",
        difficulty: row.id,
        title: `${copy.modeDraft} · ${row.labelHe}`,
        hideNote: true,
      }),
    ),
  ].filter((node): node is HTMLElement => node !== null);
  screen.append(...panels);
  const back = el("button", { type: "button", class: "primary" }, copy.createBack);
  back.addEventListener("click", () => {
    state.screen = "setup";
    render();
  });
  screen.append(el("div", { class: "confirm-bar" }, back));
  return screen;
}

function startLabel(): string {
  if (state.playMode === "create") return copy.modeCreate;
  if (state.playMode === "daily") return copy.playWith(getPerson(dailyHubId(state.dayKey)).nameHe);
  return copy.start;
}

function beginFromSetup(): void {
  if (state.playMode === "create") {
    state.screen = "create";
    render();
    return;
  }
  if (state.playMode === "daily") {
    startLockedDraft(dailyHubId(state.dayKey), dailySeed(state.dayKey), 1, "open");
    writeUrl(dailySharePath(state.dayKey));
    return;
  }
  startOpenDraft();
}

function startOpenDraft(): void {
  resetMeters();
  const keep = {
    customName: state.customName,
    customAspects: state.customAspects,
    customLook: state.customLook,
    dayKey: state.dayKey,
    playerName: state.playerName,
    partyName: state.partyName,
  };
  state = {
    ...freshState(state.nCpus, state.difficulty, "draft"),
    ...keep,
    screen: "draft",
    liveText: copy.yourTurn,
    draft: createDraft(state.nCpus, playSeed(), state.difficulty, undefined, { player: keep.partyName }),
  };
  writeUrl("");
  render();
}

function startCreateDraft(nameHe: string, aspects: PersonAspects, look: LeaderLook): void {
  const name = sanitizeLeaderName(nameHe);
  if (!name) return;
  state.customName = name;
  state.customAspects = aspects;
  state.customLook = look;
  const spec = { nameHe: name, aspects, slateId: nearestSlate(aspects), look };
  const hub = makeCustomLeader(spec);
  startLockedDraft(hub.id, playSeed(), state.nCpus, state.difficulty);
  writeUrl(customSharePath(spec));
}

function startLockedDraft(hubId: PersonId, seed: number, nCpus: number, difficulty: DifficultyId): void {
  resetMeters();
  state.draft = createDraft(nCpus, seed, difficulty, hubId, { player: state.partyName });
  state.nCpus = nCpus;
  state.difficulty = difficulty;
  state.screen = "draft";
  state.focusId = null;
  state.hoverId = null;
  state.selectedEdge = null;
  state.hoverEdge = null;
  state.openSlate = null;
  state.result = null;
  state.cpuThinking = false;
  state.notices = [];
  state.liveText = copy.yourTurn;
  render();
  runCpuTurns();
}

function bootFromUrl(): void {
  const params = new URLSearchParams(location.search);
  const code = params.get("c");
  const day = params.get("day");
  if (code) {
    const spec = decodeCustomCode(code) ?? decodeCustomCode(decodeURIComponent(code));
    if (!spec) return;
    state.playMode = "create";
    state.customName = spec.nameHe;
    state.customAspects = spec.aspects;
    if (spec.look) state.customLook = spec.look;
    const hub = ensureCustomLeader(encodeCustomCode(spec));
    if (hub) startLockedDraft(hub.id, playSeed(), state.nCpus, state.difficulty);
    return;
  }
  if (day) {
    state.playMode = "daily";
    state.dayKey = day;
    startLockedDraft(dailyHubId(day), dailySeed(day), 1, "open");
  }
}

function writeUrl(search: string): void {
  const url = `${location.pathname}${search}`;
  history.replaceState({}, "", url);
}

async function shareRun(): Promise<void> {
  const href = location.href;
  try {
    await navigator.clipboard.writeText(href);
  } catch {
    window.prompt(copy.share, href);
  }
}

async function shareCard(kind: "square" | "story"): Promise<"shared" | "saved"> {
  if (!state.result) throw new Error(copy.shareFail);
  const player = state.result.lists.find((row) => row.list.isPlayer);
  const caption = shareCaption(player?.seats ?? 0, player?.list.labelHe ?? state.partyName, location.href);
  const blob = await makeResultCard({
    result: state.result,
    playerName: state.playerName,
    kind,
  });
  return shareFilesOrDownload({ blob, kind, ...caption });
}

function autoPick(): void {
  const turn = currentList(state.draft);
  if (!turn?.isPlayer || state.cpuThinking) return;
  const remaining = legalRemaining(
    turn.picks,
    state.draft.remaining,
    state.draft.slateCap,
  );
  if (remaining.length === 0) return;
  pick(greedyCpuPick(turn, state.draft.lists, remaining, state.draft.slateCap));
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
  const player = state.result.lists.find((row) => row.list.isPlayer);
  const hubId = player?.list.picks[0];
  state.boardEntry = recordRun({
    mode: state.playMode,
    ...(state.playMode === "daily" ? { dayKey: state.dayKey } : {}),
    playerName: state.playerName,
    hubName: hubId ? getPerson(hubId).nameHe : copy.yourParty,
    seats: player?.seats ?? 0,
    cohesion: player?.cohesion ?? 0,
    demand: player?.massAfterSplit ?? 0,
    won: state.result.winnerId === "player",
    nCpus: state.nCpus,
    difficulty: state.difficulty,
    share: location.search || "/",
  });
  void pushRemoteRun(state.boardEntry);
  resetMeters();
  render();
}

async function hydrateBoard(): Promise<void> {
  const store = globalThis.localStorage ?? null;
  const ok = await hydrateRemoteBoard(store);
  if (ok && state.screen === "board") render();
}

function replay(): void {
  window.clearTimeout(cpuTimer);
  resetMeters();
  const keep = {
    playMode: state.playMode,
    customName: state.customName,
    customAspects: state.customAspects,
    customLook: state.customLook,
    dayKey: state.dayKey,
    playerName: state.playerName,
    partyName: state.partyName,
  };
  state = { ...freshState(state.nCpus, state.difficulty, keep.playMode), ...keep };
  writeUrl("");
  render();
}
