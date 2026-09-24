/**
 * @vitest-environment happy-dom
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { resetTips, tipsAllowed } from "../systems/tips";
import { closeTips, maybeShowTips, showTips } from "./tips";

function clickTips(label: string): void {
  [...document.querySelectorAll<HTMLButtonElement>(".tips-card button")]
    .find((btn) => btn.textContent === label)
    ?.click();
}

describe("first-run tip tour", () => {
  beforeEach(() => {
    resetTips();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    closeTips();
    resetTips();
    document.body.innerHTML = "";
  });

  it("parks Next on הפסים until pips appear instead of turning tips off", () => {
    document.body.innerHTML = `
      <div class="draft-screen">
        <button class="party-btn" type="button">ליכוד</button>
      </div>
    `;
    showTips();
    expect(document.querySelector(".tips-overlay")?.textContent).toContain("בחירה");
    expect(document.querySelector(".aspect-pips, .pip-key-list")).toBeNull();

    clickTips("הבא");

    expect(tipsAllowed()).toBe(true);
    expect(document.cookie).not.toMatch(/harshima_tips=off/);
    expect(document.querySelector(".tips-overlay")).toBeTruthy();
    expect(document.querySelector(".tips-overlay")?.textContent).toContain("הפסים");

    const pips = document.createElement("div");
    pips.className = "aspect-pips";
    document.querySelector(".draft-screen")?.append(pips);
    maybeShowTips();

    expect(tipsAllowed()).toBe(true);
    expect(document.querySelector(".tips-overlay")?.textContent).toContain("הפסים");
    expect(document.querySelector(".tips-marks")).toBeTruthy();
  });

  it("still writes tips off when Skip is used with אל תציגו שוב", () => {
    document.body.innerHTML = `
      <div class="setup-screen">
        <button class="primary" type="button">התחל</button>
      </div>
    `;
    showTips();
    expect(document.querySelector(".tips-overlay")?.textContent).toContain("המשחק");
    const hide = document.querySelector<HTMLInputElement>("#tips-hide");
    expect(hide?.checked).toBe(true);
    clickTips("דילוג");
    expect(document.querySelector(".tips-overlay")).toBeNull();
    expect(tipsAllowed()).toBe(false);
    expect(document.cookie).toMatch(/harshima_tips=off/);
  });
});
