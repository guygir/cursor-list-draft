import { ASPECT_IDS, ASPECT_LABEL_HE, peakAspect } from "../data/aspects";
import { getPerson, slateLabelHe } from "../data/pool";
import { bindPortrait, hasWikiPortrait, portraitSrc } from "../data/portraits";
import type { Person, PersonId, SlateId } from "../data/types";
import { relationColor, teamRelation } from "../systems/chemistry";
import { copy } from "./copy";
import { el } from "./dom";

export function renderMemberPicker(opts: {
  ids: PersonId[];
  slate: SlateId;
  picks: PersonId[];
  focusId: PersonId | null;
  canPick: boolean;
  variant: "stage" | "dock";
  onHover: (id: PersonId | null) => void;
  onFocus: (id: PersonId) => void;
  onPick: (id: PersonId) => void;
  onCloseSlate: () => void;
}): HTMLElement {
  const { ids, slate, picks, focusId, variant } = opts;
  const hasTeam = picks.length > 0;
  const wrap = el("div", { class: `member-picker is-${variant}`, "aria-label": copy.chooseMember });
  const back = el("button", { type: "button", class: "back-btn" }, copy.backToParties);
  back.addEventListener("click", () => opts.onCloseSlate());
  wrap.append(
    el(
      "div",
      { class: "member-head" },
      el("strong", {}, slateLabelHe(slate)),
      back,
    ),
    el("p", { class: "member-legend" }, copy.pickWithButton),
    pipKey(hasTeam),
  );

  const grid = el("div", { class: "member-grid" });
  for (const id of ids) {
    const person = getPerson(id);
    const team = hasTeam ? teamRelation(picks, id) : null;
    const photo = portraitSrc(id);
    const title = team
      ? `${copy.sideTone}. ${copy.sideToneHint} ${team.reasonHe}`
      : undefined;
    const btn = el(
      "button",
      {
        type: "button",
        class: `name-btn ${team ? "has-tone" : ""} ${focusId === id ? "is-focused" : ""}`,
        "data-person": id,
        tabindex: focusId === id || (!focusId && id === ids[0]) ? 0 : -1,
        title,
        ...(team
          ? { style: `--tone:${relationColor(team.s)};--tone-w:${(2 + Math.abs(team.s) * 3).toFixed(2)}px` }
          : {}),
      },
      bindPortrait(
        el("img", {
          class: "name-photo",
          src: photo,
          alt: hasWikiPortrait(id) ? "" : copy.noWikiPhoto,
          title: hasWikiPortrait(id) ? person.nameHe : copy.noWikiPhoto,
          width: 28,
          height: 28,
          loading: "eager",
          decoding: "async",
          referrerpolicy: "no-referrer",
        }),
        id,
      ),
      el(
        "span",
        { class: "name-stack" },
        el("span", { class: "name-he" }, `${person.listSlot}. ${person.nameHe}`),
        aspectPips(person),
      ),
    );
    btn.addEventListener("click", () => {
      opts.onFocus(id);
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

function pipKey(hasTeam: boolean): HTMLElement {
  const box = el("div", { class: "pip-key" });
  box.append(el("p", { class: "member-legend" }, copy.pipExplain));
  box.append(el("p", { class: "member-legend" }, copy.pipPeak));
  const items = el("ul", { class: "pip-key-list" });
  for (const id of ASPECT_IDS) {
    items.append(
      el(
        "li",
        {},
        el("i", { class: "aspect-pip is-demo", style: "--v:0.9", "aria-hidden": "true" }),
        ASPECT_LABEL_HE[id],
      ),
    );
  }
  box.append(items);
  if (hasTeam) box.append(el("p", { class: "member-legend" }, `${copy.sideTone}. ${copy.sideToneHint}`));
  return box;
}

function aspectPips(person: Person): HTMLElement {
  const peak = peakAspect(person.aspects, person.slateId);
  const detail = ASPECT_IDS.map((id) => `${ASPECT_LABEL_HE[id]} ${Math.round(person.aspects[id] * 100)}`).join(" · ");
  const pips = el("span", {
    class: "aspect-pips",
    title: `${copy.aspects}: ${detail}. ${person.aspectsNoteHe ?? copy.aspectsToy}`,
    "aria-label": `${copy.aspects}: ${detail}`,
  });
  for (const id of ASPECT_IDS) {
    pips.append(
      el("i", {
        class: `aspect-pip${id === peak ? " is-peak" : ""}`,
        style: `--v:${person.aspects[id].toFixed(2)}`,
        title: `${ASPECT_LABEL_HE[id]} ${Math.round(person.aspects[id] * 100)}`,
      }),
    );
  }
  return pips;
}
