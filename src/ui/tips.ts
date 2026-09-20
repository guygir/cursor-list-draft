import { disableTips, tipsAllowed } from "../systems/tips";
import { copy } from "./copy";
import { el } from "./dom";

const steps = copy.tipsSteps;
let open = false;

export function maybeShowTips(): void {
  if (open || !tipsAllowed()) return;
  showTips();
}

export function showTips(): void {
  closeTips();
  open = true;
  document.body.append(renderTips(0, true));
}

export function closeTips(): void {
  document.querySelector(".tips-sheet")?.remove();
  open = false;
}

function renderTips(index: number, hideNext: boolean): HTMLElement {
  const step = steps[index] ?? steps[0]!;
  const last = index >= steps.length - 1;
  const dialog = el("dialog", {
    class: "tips-sheet",
    "aria-labelledby": "tips-title",
  });
  const hide = el("input", { type: "checkbox", id: "tips-hide" });
  hide.checked = hideNext;
  const next = el(
    "button",
    { type: "button", class: "primary" },
    last ? copy.tipsDone : copy.tipsNext,
  );
  const skip = el(
    "button",
    { type: "button", class: "chrome-btn" },
    index > 0 ? copy.tipsBack : copy.tipsSkip,
  );
  const finish = (write: boolean) => {
    if (write || hide.checked) disableTips();
    closeTips();
  };
  next.addEventListener("click", () => {
    if (last) {
      finish(true);
      return;
    }
    dialog.replaceWith(renderTips(index + 1, hide.checked));
  });
  skip.addEventListener("click", () => {
    if (index > 0) {
      dialog.replaceWith(renderTips(index - 1, hide.checked));
      return;
    }
    finish(hide.checked);
  });
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    finish(hide.checked);
  });
  dialog.append(
    el("p", { class: "eyebrow" }, `${index + 1} / ${steps.length}`),
    el("h2", { id: "tips-title" }, step.title),
    el("p", { class: "tips-body" }, step.body),
    el(
      "label",
      { class: "tips-hide", for: "tips-hide" },
      hide,
      el("span", {}, copy.tipsHide),
    ),
    el("div", { class: "tips-actions" }, next, skip),
  );
  queueMicrotask(() => {
    try {
      if (!dialog.open) dialog.showModal();
    } catch {
      dialog.setAttribute("open", "");
    }
  });
  return dialog;
}
