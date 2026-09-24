/**
 * @vitest-environment happy-dom
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { resetTips, tipsAllowed } from "../systems/tips";
import { copy } from "./copy";
import { closeTips, maybeShowTips, showTips } from "./tips";

function draftShell(): HTMLElement {
  const screen = document.createElement("div");
  screen.className = "draft-screen";
  const party = document.createElement("button");
  party.className = "party-btn";
  party.textContent = "ליכוד";
  screen.append(party);
  document.body.append(screen);
  return screen;
}

function setupShell(): HTMLElement {
  const screen = document.createElement("div");
  screen.className = "setup-screen";
  const start = document.createElement("button");
  start.className = "primary";
  start.textContent = "התחלה";
  screen.append(start);
  document.body.append(screen);
  return screen;
}

function clickTipsPrimary(): void {
  document.querySelector<HTMLButtonElement>(".tips-overlay .tips-actions .primary")?.click();
}

function clickTipsSkip(): void {
  document.querySelector<HTMLButtonElement>(".tips-overlay .tips-actions .chrome-btn")?.click();
}

describe("draft tips tour", () => {
  beforeEach(() => {
    resetTips();
    localStorage.clear();
    document.body.innerHTML = "";
    closeTips();
  });

  afterEach(() => {
    closeTips();
    resetTips();
    document.body.innerHTML = "";
  });

  it("parks on הפסים when Next is clicked before pips exist, and resumes the spotlight", () => {
    const screen = draftShell();
    showTips();

    expect(document.querySelector(".tips-overlay")).toBeTruthy();
    expect(document.querySelector("#tips-title")?.textContent).toBe(copy.tipsSteps[1]!.title);
    expect(tipsAllowed()).toBe(true);

    clickTipsPrimary();

    expect(document.querySelector(".tips-overlay")).toBeTruthy();
    expect(document.querySelector("#tips-title")?.textContent).toBe(copy.tipsSteps[2]!.title);
    expect(tipsAllowed()).toBe(true);
    expect(localStorage.getItem("list-draft:tips")).not.toBe("off");
    expect(document.cookie).not.toMatch(/harshima_tips=off/);

    const pips = document.createElement("span");
    pips.className = "aspect-pips";
    pips.getBoundingClientRect = () =>
      ({
        x: 40,
        y: 80,
        left: 40,
        top: 80,
        right: 120,
        bottom: 110,
        width: 80,
        height: 30,
        toJSON() {
          return this;
        },
      }) as DOMRect;
    screen.append(pips);

    maybeShowTips();

    expect(document.querySelector(".tips-overlay")).toBeTruthy();
    expect(document.querySelector("#tips-title")?.textContent).toBe(copy.tipsSteps[2]!.title);
    expect(document.querySelector(".tips-marks .tips-ring")).toBeTruthy();
    expect(tipsAllowed()).toBe(true);
  });

  it("still writes tips off when skip keeps אל תציגו שוב checked", () => {
    setupShell();
    showTips();
    expect(document.querySelector<HTMLInputElement>("#tips-hide")?.checked).toBe(true);

    clickTipsSkip();

    expect(document.querySelector(".tips-overlay")).toBeNull();
    expect(tipsAllowed()).toBe(false);
    expect(localStorage.getItem("list-draft:tips")).toBe("off");
  });
});
