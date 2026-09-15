import { ASPECT_LABEL_HE, peakAspect } from "../data/aspects";
import { getPerson, slateLabelHe, SLATE_ORDER } from "../data/pool";
import { portraitUrl } from "../data/portraits";
import type { DraftList, PersonId, SlateId } from "../data/types";
import { pairRankWeight, pairRelation, shortReasonHe } from "../systems/chemistry";
import { nearestNeighborhood } from "../systems/demand";
import { copy } from "./copy";
import { el } from "./dom";
import { renderMemberPicker } from "./members";

export interface TreeHandlers {
  onHover: (id: PersonId | null) => void;
  onFocus: (id: PersonId) => void;
  onPick: (id: PersonId) => void;
  onEdge: (key: string) => void;
  onEdgeHover: (key: string | null) => void;
  onOpenSlate: (id: SlateId) => void;
  onCloseSlate: () => void;
}

export interface TreeView {
  lists: DraftList[];
  remaining: PersonId[];
  hoverId: PersonId | null;
  focusId: PersonId | null;
  selectedEdge: string | null;
  hoverEdge: string | null;
  canPick: boolean;
  openSlate: SlateId | null;
}

/** Visual board only — not a scoring bloc and not a 61 claim. */
const BLOCS: Array<{ labelHe: string; slates: SlateId[] }> = [
  { labelHe: "גוש נתניהו", slates: ["likud", "otzma", "rz"] },
  { labelHe: "חרדים", slates: ["shas", "utj"] },
  { labelHe: "ישראל ביתנו", slates: ["yisrael-beiteinu"] },
  { labelHe: "גוש השינוי", slates: ["together", "yashar", "democrats", "blue-white"] },
  { labelHe: "רשימות ערביות", slates: ["raam", "joint-list"] },
];

const SIZE = 420;
const CX = 210;
const CY = 208;

export function edgeKey(a: PersonId, b: PersonId, type: string): string {
  const [left, right] = a < b ? [a, b] : [b, a];
  return `${left}__${right}__${type}`;
}

export function parseEdgeKey(key: string): { a: PersonId; b: PersonId; type: string } | null {
  const [a, b, type] = key.split("__");
  if (!a || !b || !type) return null;
  return { a: a as PersonId, b: b as PersonId, type };
}

export function renderTreeMap(view: TreeView, handlers: TreeHandlers): HTMLElement {
  const player = view.lists.find((list) => list.isPlayer);
  const hub = player?.picks[0] ?? null;
  const stage = el("div", { class: "tree-stage" });
  if (hub) {
    stage.append(renderConstellation(view, handlers, player!));
  } else if (view.openSlate) {
    stage.append(
      renderMemberPicker({
        ids: peopleInSlate(view.remaining, view.openSlate),
        slate: view.openSlate,
        hub: null,
        focusId: view.focusId,
        canPick: view.canPick,
        variant: "stage",
        onHover: handlers.onHover,
        onFocus: handlers.onFocus,
        onPick: handlers.onPick,
        onCloseSlate: handlers.onCloseSlate,
      }),
    );
  } else {
    stage.append(renderPartyField(view, handlers));
  }
  return stage;
}

export function renderHubSpokes(view: TreeView, handlers: TreeHandlers): HTMLElement {
  return renderTreeMap(view, handlers);
}

export function renderEdgeCard(key: string | null): HTMLElement {
  const box = el("aside", { class: "edge-card", "aria-live": "polite" });
  if (!key) {
    box.append(el("p", { class: "muted" }, copy.edgeHoverHint));
    return box;
  }
  fillEdgeReason(box, key);
  return box;
}

export function renderEdgeTip(key: string | null): HTMLElement {
  const tip = el("aside", { class: "edge-tip", "aria-live": "polite" });
  if (!key) return tip;
  fillEdgeReason(tip, key);
  return tip;
}

export function edgeLine(key: string): string {
  const parsed = parseEdgeKey(key);
  if (!parsed) return copy.edgeHoverHint;
  const rel = pairRelation(parsed.a, parsed.b);
  const authored = rel.authored[0];
  const names = `${getPerson(parsed.a).nameHe} / ${getPerson(parsed.b).nameHe}`;
  if (authored) return `${shortReasonHe(rel)} · ${names} · ${authored.source.contextHe}`;
  return `${shortReasonHe(rel)} · ${names} · ${rel.reasonHe}`;
}

function fillEdgeReason(box: HTMLElement, key: string): void {
  const parsed = parseEdgeKey(key);
  if (!parsed) return;
  const rel = pairRelation(parsed.a, parsed.b);
  const authored = rel.authored[0];
  box.append(
    el(
      "p",
      { class: rel.s < 0 ? "tone-red" : rel.s > 0 ? "tone-green" : "muted" },
      `${shortReasonHe(rel)} · ${getPerson(parsed.a).nameHe} / ${getPerson(parsed.b).nameHe}`,
    ),
    el("p", {}, authored?.source.contextHe ?? rel.reasonHe),
  );
  if (authored) {
    const link = el("a", { href: authored.source.url, target: "_blank", rel: "noreferrer" }, `${copy.source} · ${authored.source.date}`);
    box.append(el("p", { class: "source-line" }, link));
  }
}

export function hintFor(id: PersonId | null, hub: PersonId | null, edgeKeyValue: string | null = null): string {
  if (edgeKeyValue) return edgeLine(edgeKeyValue);
  if (!id) return hub ? copy.noHubAfter : copy.chooseParty;
  const person = getPerson(id);
  const hill = nearestNeighborhood(person.cell).labelHe;
  const peak = ASPECT_LABEL_HE[peakAspect(person.aspects, person.slateId)];
  if (!hub || hub === id) {
    const note = person.aspectsNoteHe ? ` · ${person.aspectsNoteHe}` : "";
    return `${person.nameHe} · ${person.partyHe} · ${peak} · ${hill}${note}`;
  }
  const rel = pairRelation(hub, id);
  return `${person.nameHe} · ${shortReasonHe(rel)} · ${peak} · ${hill}`;
}

function renderPartyField(view: TreeView, handlers: TreeHandlers): HTMLElement {
  const field = el("div", { class: "party-field", role: "group", "aria-label": copy.chooseParty });
  field.append(el("p", { class: "board-kicker" }, copy.chooseParty));

  for (const bloc of BLOCS) {
    const slates = bloc.slates.filter((slate) => remainingInSlate(view.remaining, slate) > 0);
    if (slates.length === 0) continue;
    const group = el("div", { class: "bloc" }, el("p", { class: "bloc-label" }, bloc.labelHe));
    const nodes = el("div", { class: "bloc-nodes" });
    for (const slate of slates) {
      const left = remainingInSlate(view.remaining, slate);
      const btn = el(
        "button",
        {
          type: "button",
          class: `party-btn ${view.openSlate === slate ? "is-hot" : ""}`,
          "data-slate": slate,
        },
        el("span", { class: "party-name" }, slateLabelHe(slate)),
        el("span", { class: "party-left" }, String(left)),
      );
      btn.addEventListener("click", () => handlers.onOpenSlate(slate));
      nodes.append(btn);
    }
    group.append(nodes);
    field.append(group);
  }
  return field;
}

interface PlacedNode {
  id: PersonId;
  rank: number;
  x: number;
  y: number;
  ghost: boolean;
  hub: boolean;
}

function renderConstellation(view: TreeView, handlers: TreeHandlers, player: DraftList): HTMLElement {
  const wrap = el("div", { class: "constellation" });
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "tree-map");
  svg.setAttribute("viewBox", `0 0 ${SIZE} ${SIZE}`);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "הכרזה");

  const hubId = player.picks[0]!;
  const others = player.picks.slice(1);
  const preview = view.focusId && !player.picks.includes(view.focusId) ? view.focusId : null;
  const ring = preview ? [...others, preview] : others;
  const points = ringPoints(ring.length, 126);
  const nodes: PlacedNode[] = [
    { id: hubId, rank: 1, x: CX, y: CY, ghost: false, hub: true },
    ...ring.map((id, index) => ({
      id,
      rank: id === preview ? player.picks.length + 1 : player.picks.indexOf(id) + 1,
      x: points[index]!.x,
      y: points[index]!.y,
      ghost: id === preview,
      hub: false,
    })),
  ];

  let markup = `<defs>
    <radialGradient id="stage-glow" cx="50%" cy="48%" r="52%">
      <stop offset="0%" stop-color="#2a2618" />
      <stop offset="70%" stop-color="#171a22" />
      <stop offset="100%" stop-color="#12151c" />
    </radialGradient>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#stage-glow)" />
  <circle class="orbit" cx="${CX}" cy="${CY}" r="126" />`;

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i]!;
      const b = nodes[j]!;
      const rel = pairRelation(a.id, b.id);
      const key = edgeKey(a.id, b.id, rel.type);
      const weight = pairRankWeight(a.rank, b.rank);
      const tone = rel.s < 0 ? "is-red" : rel.s > 0 ? "is-green" : "is-muted";
      const width = 0.7 + weight * (rel.s < 0 ? 3.5 : rel.s > 0 ? 1.5 : 0.7);
      const ghost = a.ghost || b.ghost;
      const selected = view.selectedEdge === key || view.hoverEdge === key;
      markup += `<g data-edge="${key}">
        <path d="${spoke(a.x, a.y, b.x, b.y)}" class="chem-edge-hit" />
        <path d="${spoke(a.x, a.y, b.x, b.y)}" class="chem-edge ${tone} ${selected ? "is-selected" : ""} ${ghost ? "is-ghost" : ""}" style="stroke-width:${width.toFixed(2)}" />
      </g>`;
    }
  }

  svg.insertAdjacentHTML("beforeend", markup);
  bindEdges(svg, handlers);
  wrap.append(svg);

  const faces = el("div", { class: "tree-faces" });
  for (const node of nodes) {
    const person = getPerson(node.id);
    const hot = view.focusId === node.id || view.hoverId === node.id;
    const photo = portraitUrl(node.id);
    const face = el(
      "button",
      {
        type: "button",
        class: `tree-face person-node on-player ${node.hub ? "is-hub" : ""} ${node.ghost ? "is-ghost" : ""} ${hot ? "is-hot" : ""}`,
        "data-person": node.id,
        style: `--x:${((node.x / SIZE) * 100).toFixed(2)}%;--y:${((node.y / SIZE) * 100).toFixed(2)}%;`,
      },
      photo
        ? el("img", {
            class: "tree-photo",
            src: photo,
            alt: person.nameHe,
            referrerpolicy: "no-referrer",
          })
        : el("span", { class: "tree-photo is-fallback", "aria-hidden": "true" }, person.nameHe.slice(0, 1)),
      el("span", { class: "face-name" }, person.nameHe),
    );
    face.addEventListener("pointerenter", () => handlers.onHover(node.id));
    face.addEventListener("pointerleave", () => handlers.onHover(null));
    face.addEventListener("click", () => {
      handlers.onFocus(node.id);
      if (view.canPick && view.remaining.includes(node.id) && view.focusId === node.id) {
        handlers.onPick(node.id);
      }
    });
    faces.append(face);
  }
  wrap.append(faces);
  return wrap;
}

function bindEdges(svg: SVGSVGElement, handlers: TreeHandlers): void {
  svg.querySelectorAll<SVGElement>("[data-edge]").forEach((node) => {
    const key = node.dataset.edge;
    if (!key) return;
    node.addEventListener("pointerenter", () => handlers.onEdgeHover(key));
    node.addEventListener("pointerleave", () => handlers.onEdgeHover(null));
    node.addEventListener("click", (event) => {
      event.stopPropagation();
      handlers.onEdge(key);
    });
  });
}

function remainingInSlate(remaining: PersonId[], slate: SlateId): number {
  return remaining.filter((id) => getPerson(id).slateId === slate).length;
}

function ringPoints(count: number, radius: number): Array<{ x: number; y: number }> {
  if (count <= 0) return [];
  return Array.from({ length: count }, (_, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / count;
    return { x: CX + Math.cos(angle) * radius, y: CY + Math.sin(angle) * radius };
  });
}

function spoke(x1: number, y1: number, x2: number, y2: number): string {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const cx = mx + (CX - mx) * 0.16;
  const cy = my + (CY - my) * 0.16;
  return `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`;
}

export function slatesWithPeople(remaining: PersonId[]): SlateId[] {
  return SLATE_ORDER.filter((slate) => remainingInSlate(remaining, slate) > 0);
}

export function peopleInSlate(remaining: PersonId[], slate: SlateId): PersonId[] {
  return remaining
    .filter((id) => getPerson(id).slateId === slate)
    .sort((a, b) => getPerson(a).listSlot - getPerson(b).listSlot);
}
