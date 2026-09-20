import { copy } from "./copy";
import { el, prefersReducedMotion } from "./dom";

export const METER_GROW_MS = 560;
export const NIGHT_COUNT_MS = 1100;
export const NIGHT_BAR_MS = 900;
export const NIGHT_BAR_DELAY_MS = 320;
export const NIGHT_ROW_STAGGER_MS = 160;
export const NIGHT_METER_DELAY_MS = 520;

let lastTargets = { cred: 0, demand: 0 };

export function resetMeters(): void {
  lastTargets = { cred: 0, demand: 0 };
}

export function scoreMeters(
  cohesionPct: number,
  demandPct: number,
  mode: "live" | "fresh" = "live",
  opts: { delay?: number; picks?: number } = {},
): HTMLElement {
  const cred = clampPct(cohesionPct);
  const demand = clampPct(demandPct);
  const fromCred = mode === "fresh" ? 0 : lastTargets.cred;
  const fromDemand = mode === "fresh" ? 0 : lastTargets.demand;
  if (mode === "live") lastTargets = { cred, demand };
  const delay = opts.delay ?? 0;

  const wrap = el(
    "div",
    { class: `score-meters-wrap${mode === "fresh" ? " is-night" : ""}` },
    el(
      "div",
      { class: "score-meters" },
      meter(copy.credibility, copy.credibilityTip, fromCred, cred, "cred", delay),
      meter(copy.demand, copy.demandTip, fromDemand, demand, "demand", delay + 80),
    ),
    null,
  );
  return wrap;
}

function meter(
  label: string,
  tip: string,
  from: number,
  to: number,
  kind: "cred" | "demand",
  delay: number,
): HTMLElement {
  const tipId = `meter-tip-${kind}-${Math.round(delay * 10)}-${to}`;
  const num = el("strong", { "data-count": String(to) }, String(from));
  const fill = el("div", {
    class: "score-meter-fill",
    style: `--from:${from}%;--target:${to}%;--grow-delay:${delay}ms;--grow-ms:${METER_GROW_MS}ms`,
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
  const pop = el("p", { class: "meter-tip", id: tipId }, tip);
  countUp(num, from, to, delay, METER_GROW_MS);
  const box = el(
    "button",
    {
      type: "button",
      class: `score-meter is-${kind}`,
      "aria-expanded": "false",
      "aria-controls": tipId,
      title: tip,
    },
    el("div", { class: "score-meter-head" }, el("span", {}, label), num),
    track,
    pop,
  );
  bindMeterExplain(box);
  return box;
}

function bindMeterExplain(box: HTMLElement): void {
  ensureMeterTipDismiss();
  const setOpen = (open: boolean) => {
    box.classList.toggle("is-open", open);
    box.setAttribute("aria-expanded", open ? "true" : "false");
  };
  box.addEventListener("click", (event) => {
    event.stopPropagation();
    const next = !box.classList.contains("is-open");
    document.querySelectorAll(".score-meter.is-open").forEach((node) => {
      if (node !== box) {
        node.classList.remove("is-open");
        node.setAttribute("aria-expanded", "false");
      }
    });
    setOpen(next);
  });
  box.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });
}

function ensureMeterTipDismiss(): void {
  if (document.documentElement.dataset.meterTips === "1") return;
  document.documentElement.dataset.meterTips = "1";
  document.addEventListener("click", () => {
    document.querySelectorAll(".score-meter.is-open").forEach((node) => {
      node.classList.remove("is-open");
      node.setAttribute("aria-expanded", "false");
    });
  });
}

export function countUp(
  node: HTMLElement,
  from: number,
  to: number,
  delay = 0,
  duration = METER_GROW_MS,
): void {
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
    const t = Math.min(1, (now - startAt) / duration);
    const eased = 1 - (1 - t) ** 3;
    node.textContent = String(Math.round(from + (to - from) * eased));
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function clampPct(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}
