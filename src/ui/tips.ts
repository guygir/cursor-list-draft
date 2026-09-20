import { disableTips, tipsAllowed } from "../systems/tips";
import { copy } from "./copy";
import { el } from "./dom";

interface TipStep {
  title: string;
  body: string;
  screen: "setup" | "draft";
  target: string;
  to?: string;
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
  started = true;
  hideNext = true;
  const start = document.querySelector(".setup-screen") ? 0 : 1;
  openStep(start);
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
  if (remaining.some((step) => step.screen !== currentScreen())) {
    index = from;
    started = true;
    parkTour();
    return;
  }
  finish(true);
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
  const marks = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  marks.setAttribute("class", "tips-marks");
  marks.setAttribute("aria-hidden", "true");
  const overlay = el("div", { class: "tips-overlay", role: "dialog", "aria-modal": "false" }, marks, card);
  return overlay;
}

function layoutTips(): void {
  const overlay = document.querySelector<HTMLElement>(".tips-overlay");
  const step = steps[index];
  if (!overlay || !step) return;
  const from = stepTarget(step);
  const to = step.to ? firstVisible(step.to) : null;
  const marks = overlay.querySelector(".tips-marks");
  const card = overlay.querySelector<HTMLElement>(".tips-card");
  if (!marks || !card) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  marks.setAttribute("viewBox", `0 0 ${w} ${h}`);
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
  if (to && to !== from) {
    marks.append(ring(to));
    marks.append(arrow(from ?? to, to));
  }
  placeCard(card, from ?? to);
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

function placeCard(card: HTMLElement, around: Element | null): void {
  const margin = 12;
  const cardW = Math.min(340, window.innerWidth - margin * 2);
  card.style.width = `${cardW}px`;
  const box = around?.getBoundingClientRect();
  let top = window.innerHeight / 2 - 80;
  let left = (window.innerWidth - cardW) / 2;
  if (box) {
    const below = box.bottom + 16;
    const above = box.top - 16;
    const cardH = card.offsetHeight || 180;
    if (below + cardH < window.innerHeight - margin) top = below;
    else if (above - cardH > margin) top = above - cardH;
    else top = Math.max(margin, Math.min(box.top, window.innerHeight - cardH - margin));
    left = Math.max(margin, Math.min(box.left, window.innerWidth - cardW - margin));
  }
  card.style.top = `${top}px`;
  card.style.left = `${left}px`;
}

function svgEl(tag: string, attrs: Record<string, string | number> = {}): SVGElement {
  const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
  return node;
}
