import { ASPECT_IDS, ASPECT_LABEL_HE, peakAspect } from "../data/aspects";
import { getPerson, slateLabelHe } from "../data/pool";
import { portraitUrl } from "../data/portraits";
import type { Person, PersonId, SlateId } from "../data/types";
import { pairRelation } from "../systems/chemistry";
import { copy } from "./copy";
import { el } from "./dom";

export function renderMemberPicker(opts: {
  ids: PersonId[];
  slate: SlateId;
  hub: PersonId | null;
  focusId: PersonId | null;
  canPick: boolean;
  variant: "stage" | "dock";
  onHover: (id: PersonId | null) => void;
  onFocus: (id: PersonId) => void;
  onPick: (id: PersonId) => void;
  onCloseSlate: () => void;
}): HTMLElement {
  const { ids, slate, hub, focusId, canPick, variant } = opts;
  const wrap = el("div", { class: `member-picker is-${variant}`, "aria-label": copy.chooseMember });
  const back = el("button", { type: "button", class: "back-btn" }, copy.backToParties);
  back.addEventListener("click", () => opts.onCloseSlate());
  wrap.append(el("div", { class: "member-head" }, back, el("strong", {}, slateLabelHe(slate))));

  const grid = el("div", { class: "member-grid" });
  for (const id of ids) {
    const person = getPerson(id);
    const rel = hub ? pairRelation(hub, id) : null;
    const tone = rel ? (rel.s < 0 ? "is-red" : rel.s > 0 ? "is-green" : "") : "";
    const photo = portraitUrl(id);
    const btn = el(
      "button",
      {
        type: "button",
        class: `name-btn ${tone} ${focusId === id ? "is-focused" : ""}`,
        "data-person": id,
        tabindex: focusId === id || (!focusId && id === ids[0]) ? 0 : -1,
      },
      photo
        ? el("img", {
            class: "name-photo",
            src: photo,
            alt: "",
            width: 28,
            height: 28,
            referrerpolicy: "no-referrer",
          })
        : el("span", { class: "name-photo is-fallback", "aria-hidden": "true" }, person.nameHe.slice(0, 1)),
      el(
        "span",
        { class: "name-stack" },
        el("span", { class: "name-he" }, `${person.listSlot}. ${person.nameHe}`),
        aspectPips(person),
      ),
    );
    btn.addEventListener("click", () => {
      if (focusId === id && canPick) opts.onPick(id);
      else opts.onFocus(id);
    });
    btn.addEventListener("pointerenter", () => opts.onHover(id));
    btn.addEventListener("pointerleave", () => opts.onHover(null));
    btn.addEventListener("focus", () => opts.onFocus(id));
    btn.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const buttons = [...grid.querySelectorAll<HTMLButtonElement>(".name-btn")];
        const idx = buttons.indexOf(btn);
        const next = buttons[idx + (event.key === "ArrowDown" ? 1 : -1)];
        next?.focus();
      }
    });
    grid.append(btn);
  }
  wrap.append(grid);
  return wrap;
}

function aspectPips(person: Person): HTMLElement {
  const peak = peakAspect(person.aspects, person.slateId);
  const pips = el("span", {
    class: "aspect-pips",
    title: person.aspectsNoteHe ?? copy.aspectsToy,
    "aria-label": `${copy.aspects}: ${ASPECT_LABEL_HE[peak]}`,
  });
  for (const id of ASPECT_IDS) {
    pips.append(
      el("i", {
        class: `aspect-pip${id === peak ? " is-peak" : ""}`,
        style: `--v:${person.aspects[id].toFixed(2)}`,
      }),
    );
  }
  return pips;
}
