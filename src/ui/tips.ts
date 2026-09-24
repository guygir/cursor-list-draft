import { disableTips, enableTips, tipsAllowed } from "../systems/tips";
import { copy } from "./copy";
import { el } from "./dom";

interface TipStep {
  title: string;
  body: string;
  screen: "setup" | "draft";
  target: string;
  to?: string;
}

interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

const steps: TipStep[] = [
  {
    title: copy.tipsSteps[0]!.title,
    body: copy.tipsSteps[0]!.body,
    screen: "setup",
    target: ".setup-screen .primary",
  },
  {
    title: copy.tipsSteps[1]!.title,
    body: copy.tipsSteps[1]!.body,
    screen: "draft",
    target: ".name-btn, .party-btn",
    to: ".constellation, .confirm-btn",
  },
  {
    title: copy.tipsSteps[2]!.title,
    body: copy.tipsSteps[2]!.body,
    screen: "draft",
    target: ".aspect-pips, .pip-key-list",
  },
];

let open = false;
let started = false;
let index = 0;
let hideNext = true;

export function maybeShowTips(): void {
  if (!tipsAllowed()) return;
  if (open) {
    if (!stepTarget(steps[index])) goToVisible(index);
    else layoutTips();
    return;
  }
  if (document.querySelector(".setup-screen") && !started) {
    openStep(0);
    return;
  }
  if (document.querySelector(".draft-screen") && (started || tipsAllowed())) {
    goToVisible(started ? index : 1);
  }
}

export function showTips(): void {
  enableTips();
  started = true;
  hideNext = true;
  const start = document.querySelector(".setup-screen") ? 0 : 1;
  openStep(start);
}

export function renderTipsButton(): HTMLElement {
  const btn = el("button", { type: "button", class: "chrome-btn tips-open" }, copy.tipsReplay);
  btn.addEventListener("click", () => showTips());
  return btn;
}

export function closeTips(): void {
  document.querySelector(".tips-overlay")?.remove();
  window.removeEventListener("resize", layoutTips);
  window.removeEventListener("scroll", layoutTips, true);
  open = false;
}

function openStep(next: number): void {
  const step = visibleStep(next);
  if (!step) {
    finish(true);
    return;
  }
  showStep(step);
}

function showStep(step: TipStep): void {
  index = steps.indexOf(step);
  started = true;
  open = true;
  document.querySelector(".tips-overlay")?.remove();
  const overlay = renderOverlay(step);
  document.body.append(overlay);
  window.addEventListener("resize", layoutTips);
  window.addEventListener("scroll", layoutTips, true);
  layoutTips();
}

function visibleStep(from: number): TipStep | undefined {
  return steps.slice(Math.max(0, from)).find((step) => stepTarget(step));
}

function goToVisible(from: number): void {
  const remaining = steps.slice(Math.max(0, from));
  const ready = remaining.find((step) => stepTarget(step));
  if (ready) {
    openStep(steps.indexOf(ready));
    return;
  }
  if (remaining.length === 0) {
    finish(true);
    return;
  }
  // Next (or resume) asked for a step whose target is not on screen yet.
  // Park there: keep the tour open and tips allowed; do not write tips off.
  const requested = remaining[0]!;
  index = steps.indexOf(requested);
  started = true;
  if (remaining.some((step) => step.screen !== currentScreen())) {
    parkTour();
    return;
  }
  if (document.querySelector("#tips-title")?.textContent === requested.title) return;
  showStep(requested);
}

function currentScreen(): "setup" | "draft" | "other" {
  if (document.querySelector(".draft-screen")) return "draft";
  if (document.querySelector(".setup-screen")) return "setup";
  return "other";
}

function parkTour(): void {
  document.querySelector(".tips-overlay")?.remove();
  window.removeEventListener("resize", layoutTips);
  window.removeEventListener("scroll", layoutTips, true);
  open = false;
}

function finish(write: boolean): void {
  if (write || hideNext) disableTips();
  closeTips();
  started = false;
  index = 0;
}

function renderOverlay(step: TipStep): HTMLElement {
  const last = index >= steps.length - 1;
  const hide = el("input", { type: "checkbox", id: "tips-hide" });
  hide.checked = hideNext;
  hide.addEventListener("change", () => {
    hideNext = hide.checked;
  });
  const next = el("button", { type: "button", class: "primary" }, last ? copy.tipsDone : copy.tipsNext);
  const skip = el(
    "button",
    { type: "button", class: "chrome-btn" },
    index > 0 ? copy.tipsBack : copy.tipsSkip,
  );
  next.addEventListener("click", () => {
    if (last) {
      finish(true);
      return;
    }
    goToVisible(index + 1);
  });
  skip.addEventListener("click", () => {
    if (index > 0) {
      goToVisible(index - 1);
      return;
    }
    finish(hideNext);
  });
  const card = el(
    "div",
    { class: "tips-card tips-sheet", "aria-labelledby": "tips-title" },
    el("p", { class: "eyebrow" }, `${index + 1} / ${steps.length}`),
    el("h2", { id: "tips-title" }, step.title),
    el("p", { class: "tips-body" }, step.body),
    el("label", { class: "tips-hide", for: "tips-hide" }, hide, el("span", {}, copy.tipsHide)),
    el("div", { class: "tips-actions" }, next, skip),
  );
  const dim = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  dim.setAttribute("class", "tips-dim");
  dim.setAttribute("aria-hidden", "true");
  const marks = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  marks.setAttribute("class", "tips-marks");
  marks.setAttribute("aria-hidden", "true");
  return el("div", { class: "tips-overlay", role: "dialog", "aria-modal": "false" }, dim, card, marks);
}

function layoutTips(): void {
  const overlay = document.querySelector<HTMLElement>(".tips-overlay");
  const step = steps[index];
  if (!overlay || !step) return;
  const from = stepTarget(step);
  const to = step.to ? firstVisible(step.to) : null;
  const dim = overlay.querySelector(".tips-dim");
  const marks = overlay.querySelector(".tips-marks");
  const card = overlay.querySelector<HTMLElement>(".tips-card");
  if (!marks || !card || !dim) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  for (const svg of [dim, marks]) svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
  const holes = [...new Set([from, to].filter((node): node is Element => Boolean(node)))];
  dim.replaceChildren(spotlight(w, h, holes));
  marks.replaceChildren();
  const defs = svgEl("defs");
  const marker = svgEl("marker", {
    id: "tips-arrowhead",
    viewBox: "0 0 10 10",
    refX: "8",
    refY: "5",
    markerWidth: "7",
    markerHeight: "7",
    orient: "auto-start-reverse",
  });
  marker.append(svgEl("path", { d: "M0,0 L10,5 L0,10 Z", fill: "#f4d53b" }));
  defs.append(marker);
  marks.append(defs);
  if (from) marks.append(ring(from));
  if (from && to && to !== from) {
    marks.append(ring(to));
    marks.append(arrow(from, to));
  }
  placeCard(card, from, to);
}

function spotlight(w: number, h: number, holes: Element[]): SVGElement {
  return svgEl("path", {
    class: "tips-veil",
    fill: "rgba(8, 8, 10, 0.5)",
    "fill-rule": "evenodd",
    d: veilPath(w, h, holes),
  });
}

function veilPath(w: number, h: number, holes: Element[]): string {
  let d = `M0,0H${w}V${h}H0Z`;
  for (const node of holes) {
    const box = node.getBoundingClientRect();
    if (box.width < 2 && box.height < 2) continue;
    const pad = 10;
    if (box.width > 160 || box.height > 110) {
      d += roundedRectPath(
        Math.max(4, box.left - pad),
        Math.max(4, box.top - pad),
        box.width + pad * 2,
        box.height + pad * 2,
        14,
      );
      continue;
    }
    const r = Math.max(22, Math.hypot(box.width, box.height) / 2 + pad);
    d += circlePath(box.left + box.width / 2, box.top + box.height / 2, r);
  }
  return d;
}

function roundedRectPath(x: number, y: number, w: number, h: number, r: number): string {
  const rad = Math.min(r, w / 2, h / 2);
  return (
    `M${x + rad},${y}H${x + w - rad}A${rad},${rad} 0 0 1 ${x + w},${y + rad}` +
    `V${y + h - rad}A${rad},${rad} 0 0 1 ${x + w - rad},${y + h}` +
    `H${x + rad}A${rad},${rad} 0 0 1 ${x},${y + h - rad}` +
    `V${y + rad}A${rad},${rad} 0 0 1 ${x + rad},${y}Z`
  );
}

function circlePath(cx: number, cy: number, r: number): string {
  return `M${cx - r},${cy}a${r},${r} 0 1 0 ${r * 2},0a${r},${r} 0 1 0 ${-r * 2},0Z`;
}

function stepTarget(step: TipStep | undefined): Element | null {
  if (!step) return null;
  if (step.screen === "setup" && !document.querySelector(".setup-screen")) return null;
  if (step.screen === "draft" && !document.querySelector(".draft-screen")) return null;
  return firstVisible(step.target);
}

function firstVisible(selector: string): Element | null {
  const nodes = [...document.querySelectorAll(selector)];
  return (
    nodes.find((node) => {
      const box = node.getBoundingClientRect();
      return box.width > 2 && box.height > 2;
    }) ??
    nodes[0] ??
    null
  );
}

function ring(node: Element): SVGElement {
  const box = node.getBoundingClientRect();
  const pad = 8;
  if (box.width > 160 || box.height > 110) {
    return svgEl("rect", {
      class: "tips-ring",
      x: Math.max(4, box.left - pad),
      y: Math.max(4, box.top - pad),
      width: box.width + pad * 2,
      height: box.height + pad * 2,
      rx: 14,
    });
  }
  const r = Math.max(22, Math.hypot(box.width, box.height) / 2 + pad);
  return svgEl("circle", {
    class: "tips-ring",
    cx: box.left + box.width / 2,
    cy: box.top + box.height / 2,
    r,
  });
}

function arrow(from: Element, to: Element): SVGElement {
  const a = from.getBoundingClientRect();
  const b = to.getBoundingClientRect();
  const x1 = a.left + a.width / 2;
  const y1 = a.top + a.height / 2;
  const x2 = b.left + b.width / 2;
  const y2 = b.top + b.height / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const start = 28;
  const end = 32;
  return svgEl("path", {
    class: "tips-arrow",
    d: `M${x1 + (dx / len) * start},${y1 + (dy / len) * start} L${x2 - (dx / len) * end},${y2 - (dy / len) * end}`,
    "marker-end": "url(#tips-arrowhead)",
  });
}

function placeCard(card: HTMLElement, from: Element | null, to: Element | null): void {
  const margin = 12;
  const cardW = Math.min(320, window.innerWidth - margin * 2);
  card.style.width = `${cardW}px`;
  const cardH = card.offsetHeight || 200;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const forbidden: Box[] = [from, to]
    .filter((node): node is Element => Boolean(node))
    .map((node) => padBox(node.getBoundingClientRect(), 18));
  if (from && to && from !== to) {
    forbidden.push(arrowBand(from.getBoundingClientRect(), to.getBoundingClientRect(), 24));
  }

  const focus = forbidden[0];
  const candidates: Array<{ left: number; top: number }> = [];
  if (focus && focus.width > 4 && focus.height > 4) {
    candidates.push(
      { left: clamp(focus.left, margin, vw - cardW - margin), top: focus.bottom + 14 },
      { left: clamp(focus.left, margin, vw - cardW - margin), top: focus.top - cardH - 14 },
      { left: focus.right + 14, top: clamp(focus.top, margin, vh - cardH - margin) },
      { left: focus.left - cardW - 14, top: clamp(focus.top, margin, vh - cardH - margin) },
    );
  }
  candidates.push(
    { left: vw - cardW - margin, top: margin },
    { left: margin, top: margin },
    { left: vw - cardW - margin, top: vh - cardH - margin },
    { left: margin, top: vh - cardH - margin },
  );

  let best = { left: clamp((vw - cardW) / 2, margin, vw - cardW - margin), top: margin };
  let bestScore = Number.POSITIVE_INFINITY;
  for (const pos of candidates) {
    const left = clamp(pos.left, margin, vw - cardW - margin);
    const top = clamp(pos.top, margin, vh - cardH - margin);
    const box = { left, top, right: left + cardW, bottom: top + cardH, width: cardW, height: cardH };
    let score = forbidden.reduce((sum, hit) => sum + overlapArea(box, hit), 0);
    if (from && to && from !== to) {
      const a = from.getBoundingClientRect();
      const b = to.getBoundingClientRect();
      const midX = (a.left + a.width / 2 + b.left + b.width / 2) / 2;
      const midY = (a.top + a.height / 2 + b.top + b.height / 2) / 2;
      if (coversPoint(box, midX, midY)) score += 40_000;
    }
    if (score < bestScore) {
      bestScore = score;
      best = { left, top };
    }
  }
  card.style.left = `${best.left}px`;
  card.style.top = `${best.top}px`;
}

function padBox(box: DOMRect, pad: number): Box {
  return {
    left: box.left - pad,
    top: box.top - pad,
    right: box.right + pad,
    bottom: box.bottom + pad,
    width: box.width + pad * 2,
    height: box.height + pad * 2,
  };
}

function arrowBand(a: DOMRect, b: DOMRect, half: number): Box {
  const x1 = a.left + a.width / 2;
  const y1 = a.top + a.height / 2;
  const x2 = b.left + b.width / 2;
  const y2 = b.top + b.height / 2;
  return {
    left: Math.min(x1, x2) - half,
    top: Math.min(y1, y2) - half,
    right: Math.max(x1, x2) + half,
    bottom: Math.max(y1, y2) + half,
    width: Math.abs(x2 - x1) + half * 2,
    height: Math.abs(y2 - y1) + half * 2,
  };
}

function overlapArea(a: Box, b: Box): number {
  const w = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
  const h = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  return w * h;
}

function coversPoint(box: Box, x: number, y: number): boolean {
  return x >= box.left && x <= box.right && y >= box.top && y <= box.bottom;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function svgEl(tag: string, attrs: Record<string, string | number> = {}): SVGElement {
  const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
  return node;
}
