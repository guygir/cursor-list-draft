import { sanitizeDisplayName } from "../systems/names";
import { el } from "./dom";

export function renderNameEdit(opts: {
  value: string;
  ariaLabel: string;
  className?: string;
  onCommit: (next: string) => void;
}): HTMLElement {
  const wrap = el("span", { class: `name-edit ${opts.className ?? ""}` });
  showButton();
  return wrap;

  function showButton(): void {
    const btn = el(
      "button",
      { type: "button", class: "name-edit-btn", "aria-label": opts.ariaLabel },
      el("span", { class: "name-edit-value" }, opts.value),
      el("span", { class: "name-edit-mark", "aria-hidden": "true" }, "✎"),
    );
    btn.addEventListener("click", (event) => {
      event.stopPropagation();
      showInput();
    });
    wrap.replaceChildren(btn);
  }

  function showInput(): void {
    const input = el("input", {
      type: "text",
      class: "name-edit-input",
      value: opts.value,
      maxlength: 18,
      "aria-label": opts.ariaLabel,
      autocomplete: "off",
      spellcheck: "false",
    });
    const commit = () => {
      const next = sanitizeDisplayName(input.value) || opts.value;
      opts.onCommit(next);
    };
    input.addEventListener("blur", commit);
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        input.blur();
      }
      if (event.key === "Escape") {
        event.preventDefault();
        showButton();
      }
    });
    wrap.replaceChildren(input);
    input.focus();
    input.select();
  }
}
