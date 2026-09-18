import { copy } from "./copy";
import { el, prefersReducedMotion } from "./dom";

const GROW_MS = 560;
const DEMAND_STAGGER_MS = 80;

let lastTargets = { cred: 0, demand: 0 };

export function resetMeters(): void {
  lastTargets = { cred: 0, demand: 0 };
}

export function scoreMeters(
  cohesionPct: number,
  demandPct: number,
  mode: "live" | "fresh" = "live",
): HTMLElement {
  const cred = clampPct(cohesionPct);
  const demand = clampPct(demandPct);
  const fromCred = mode === "fresh" ? 0 : lastTargets.cred;
  const fromDemand = mode === "fresh" ? 0 : lastTargets.demand;
  if (mode === "live") lastTargets = { cred, demand };

  const wrap = el(
    "div",
    { class: "score-meters-wrap" },
    el(
      "div",
      { class: "score-meters" },
      meter(copy.credibility, fromCred, cred, "cred", 0),
      meter(copy.demand, fromDemand, demand, "demand", DEMAND_STAGGER_MS),
    ),
    el("p", { class: "meter-hint" }, copy.metersLive),
  );
  return wrap;
}

function meter(
  label: string,
  from: number,
  to: number,
  kind: "cred" | "demand",
  delay: number,
): HTMLElement {
  const num = el("strong", { "data-count": String(to) }, String(from));
  const fill = el("div", {
    class: "score-meter-fill",
    style: `--from:${from}%;--target:${to}%`,
  });
  const track = el(
    "div",
    {
      class: "score-meter-track",
      role: "meter",
      "aria-label": label,
      "aria-valuemin": 0,
      "aria-valuemax": 100,
      "aria-valuenow": to,
    },
    el("span", { class: "meter-ticks", "aria-hidden": "true" }),
    fill,
  );
  countUp(num, from, to, delay);
  return el(
    "div",
    { class: `score-meter is-${kind}` },
    el("div", { class: "score-meter-head" }, el("span", {}, label), num),
    track,
  );
}

export function countUp(node: HTMLElement, from: number, to: number, delay = 0): void {
  if (prefersReducedMotion() || from === to) {
    node.textContent = String(to);
    return;
  }
  const startAt = performance.now() + delay;
  const tick = (now: number) => {
    if (now < startAt) {
      requestAnimationFrame(tick);
      return;
    }
    const t = Math.min(1, (now - startAt) / GROW_MS);
    const eased = 1 - (1 - t) ** 3;
    node.textContent = String(Math.round(from + (to - from) * eased));
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function clampPct(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}
