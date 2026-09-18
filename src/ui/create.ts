import { ASPECT_IDS, ASPECT_LABEL_HE } from "../data/aspects";
import { slateLabelHe } from "../data/pool";
import type { PersonAspects } from "../data/types";
import { nameClash, nearestSlate, sanitizeLeaderName } from "../systems/modes";
import { copy } from "./copy";
import { el } from "./dom";
import { renderHowCalc } from "./info";

export function renderCreateLeader(opts: {
  nameHe: string;
  aspects: PersonAspects;
  onStart: (nameHe: string, aspects: PersonAspects) => void;
  onBack: () => void;
}): HTMLElement {
  let nameHe = opts.nameHe;
  let aspects = { ...opts.aspects };
  const screen = el("div", { class: "screen create-screen" });

  screen.append(
    el(
      "header",
      { class: "mast tall" },
      el("div", { class: "brand" }, el("h1", {}, copy.createTitle), el("p", { class: "tagline" }, copy.modeCreate)),
      renderHowCalc(),
    ),
    el("p", { class: "create-lede" }, copy.createLede),
  );

  const clashNote = el("p", { class: "create-clash" }, copy.createClash);
  clashNote.hidden = !nameClash(nameHe);
  const nameField = el("div", { class: "create-name" }, el("label", { for: "leader-name" }, copy.createName));
  const input = el("input", {
    id: "leader-name",
    type: "text",
    maxlength: 24,
    value: nameHe,
    placeholder: copy.createNamePh,
    autocomplete: "off",
    spellcheck: "false",
  });
  nameField.append(input, clashNote);
  screen.append(nameField);

  const list = el("div", { class: "axis-list" });
  const valueNodes = new Map<string, HTMLElement>();
  for (const id of ASPECT_IDS) {
    const value = Math.round(aspects[id] * 99);
    const shown = el("strong", {}, String(value));
    valueNodes.set(id, shown);
    const slider = el("input", {
      type: "range",
      min: 0,
      max: 99,
      step: 1,
      value,
      "aria-label": ASPECT_LABEL_HE[id],
    });
    slider.addEventListener("input", () => {
      aspects = { ...aspects, [id]: Number(slider.value) / 99 };
      shown.textContent = slider.value;
      nearest.textContent = slateLabelHe(nearestSlate(aspects));
    });
    list.append(
      el(
        "div",
        { class: "axis-row" },
        el("header", {}, el("span", {}, ASPECT_LABEL_HE[id]), shown),
        slider,
        el("div", { class: "axis-ends" }, el("span", {}, copy.axisLow[id]), el("span", {}, copy.axisHigh[id])),
      ),
    );
  }
  screen.append(list);

  const nearest = el("span", {}, slateLabelHe(nearestSlate(aspects)));
  screen.append(el("p", { class: "nearest-line" }, `${copy.createNearest}: `, nearest));

  const start = el("button", { type: "button", class: "primary" }, copy.createStart);
  const syncStart = () => {
    const clean = sanitizeLeaderName(nameHe);
    const clash = Boolean(nameClash(clean));
    clashNote.hidden = !clash;
    start.disabled = !clean || clash;
  };
  input.addEventListener("input", () => {
    nameHe = input.value;
    syncStart();
  });
  start.addEventListener("click", () => {
    if (start.disabled) return;
    opts.onStart(sanitizeLeaderName(nameHe), aspects);
  });
  const back = el("button", { type: "button", class: "text-btn" }, copy.createBack);
  back.addEventListener("click", opts.onBack);
  screen.append(el("div", { class: "confirm-bar is-split" }, start, back));
  syncStart();
  return screen;
}
