import { copy } from "./copy";
import { el } from "./dom";

export function renderHowCalc(): HTMLElement {
  const wrap = el("div", { class: "how-calc" });
  const button = el(
    "button",
    {
      type: "button",
      class: "how-calc-btn",
      "aria-expanded": "false",
      "aria-controls": "how-calc-panel",
      "aria-label": copy.howCalcAria,
      title: copy.howCalcTitle,
    },
    "!",
  );

  const blocks = copy.howCalcBlocks.flatMap((block) => {
    const chunk: HTMLElement[] = [el("p", { class: "how-calc-head" }, block.title), el("p", {}, block.body)];
    if (block.links?.length) {
      const list = el("p", { class: "how-calc-links" });
      for (const link of block.links) {
        list.append(
          el("a", { href: link.url, target: "_blank", rel: "noreferrer" }, link.label),
          " ",
        );
      }
      chunk.push(list);
    }
    return chunk;
  });

  const panel = el(
    "div",
    {
      id: "how-calc-panel",
      class: "how-calc-panel",
      hidden: true,
      role: "dialog",
      "aria-label": copy.howCalcTitle,
    },
    el("p", { class: "how-calc-title" }, copy.howCalcTitle),
    ...blocks,
  );

  const onDoc = (event: Event): void => {
    if (!wrap.contains(event.target as Node)) close();
  };

  const close = (): void => {
    button.setAttribute("aria-expanded", "false");
    panel.hidden = true;
    document.removeEventListener("pointerdown", onDoc);
  };

  const open = (): void => {
    button.setAttribute("aria-expanded", "true");
    panel.hidden = false;
    document.addEventListener("pointerdown", onDoc);
  };

  button.addEventListener("click", (event) => {
    event.stopPropagation();
    if (button.getAttribute("aria-expanded") === "true") close();
    else open();
  });
  wrap.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      close();
      button.focus();
    }
  });

  wrap.append(button, panel);
  return wrap;
}
