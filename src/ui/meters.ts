import { copy } from "./copy";
import { el } from "./dom";

export function scoreMeters(cohesionPct: number, demandPct: number): HTMLElement {
  return el(
    "div",
    { class: "score-meters" },
    meter(copy.credibility, cohesionPct, "cred"),
    meter(copy.demand, demandPct, "demand"),
  );
}

function meter(label: string, value: number, kind: "cred" | "demand"): HTMLElement {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return el(
    "div",
    { class: `score-meter is-${kind}` },
    el("div", { class: "score-meter-head" }, el("span", {}, label), el("strong", {}, String(v))),
    el(
      "div",
      {
        class: "score-meter-track",
        role: "meter",
        "aria-label": label,
        "aria-valuemin": 0,
        "aria-valuemax": 100,
        "aria-valuenow": v,
      },
      el("div", { class: "score-meter-fill", style: `--target:${v}%` }),
    ),
  );
}
