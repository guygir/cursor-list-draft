/**
 * @vitest-environment happy-dom
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "./app";

describe("playable draft UI", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", () => Promise.reject(new Error("offline")));
    localStorage.clear();
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("discloses, drafts, and resolves a game", async () => {
    vi.useFakeTimers();
    const root = document.createElement("div");
    document.body.append(root);
    mount(root);

    expect(root.textContent).toContain("זה צעצוע");
    expect(root.textContent).toContain("הרשימה");
    root.querySelector<HTMLButtonElement>(".how-calc-btn")?.click();
    expect(root.textContent).toContain("איך זה עובד");
    expect(root.textContent).toContain("אמינות");
    expect(root.textContent).toContain("שמועות");
    expect(root.textContent).toContain("3.25%");
    expect(root.textContent).toContain("רמת קושי");
    expect(root.textContent).toContain("בלי הגבלת מפלגה");
    expect(root.textContent).toContain("שם אחד מכל מפלגה");
    expect(root.textContent).not.toContain("עד חמישה שמות");
    expect(root.textContent).not.toContain("עד שניים מאותה מפלגה");
    expect(root.textContent).toContain("צור מנהיג");
    expect(root.textContent).toContain("אתגר היום");
    expect(root.textContent).toContain("לוח שיאים");
    expect(root.textContent).toContain("שם השחקן");
    expect(root.textContent).toContain("שם המפלגה");
    expect(root.textContent).toContain("עוד אין שיא במצב הזה");
    expect(root.textContent).toContain("על המכשיר הזה");
    [...root.querySelectorAll<HTMLButtonElement>("button")].find((btn) => btn.textContent?.includes("לוח שיאים"))?.click();
    expect(root.textContent).toContain("עוד אין ריצה");
    expect(root.textContent).not.toContain("דראפט · עד 5");
    root.querySelector<HTMLButtonElement>(".primary")?.click();

    const start = root.querySelector<HTMLButtonElement>(".primary");
    start?.click();
    expect(root.textContent).toContain("בחר מפלגה");
    expect(root.textContent).not.toContain("בנימין נתניהו");

    root.querySelector<HTMLButtonElement>(".party-btn")?.click();
    expect(root.textContent).toContain("בנימין נתניהו");
    expect(root.textContent).toContain("חמשת הפסים");
    expect(root.textContent).toContain("נתניהו");
    expect(root.textContent).toContain("כלכלה");
    expect(root.textContent).not.toContain("איתמר בן גביר");
    expect(root.querySelectorAll(".party-btn").length).toBe(0);

    const firstName = root.querySelector<HTMLButtonElement>(".name-btn");
    firstName?.click();
    root.querySelector<HTMLButtonElement>(".confirm-btn:not([disabled])")?.click();
    await vi.runOnlyPendingTimersAsync();
    const shown = [...root.querySelectorAll<HTMLButtonElement>(".name-btn")].map((btn) => btn.textContent);
    expect(shown.join(" ")).not.toContain("בנימין נתניהו");
    expect(root.querySelector(".notice-rail")?.textContent).toMatch(/שבצה את .+ בבחירה/);
    expect(root.querySelector(".tree-face, .tree-photo")).toBeTruthy();
    expect(root.textContent).toContain("מתעדכנים בכל בחירה");
    const credMeter = root.querySelector<HTMLButtonElement>(".score-meter.is-cred");
    credMeter?.click();
    expect(credMeter?.classList.contains("is-open")).toBe(true);
    expect(credMeter?.textContent).toContain("מפלגה אחת");
    expect(root.querySelector(".score-meter.is-demand")?.textContent).toContain("חולקות");
    expect(root.textContent).toContain("צבע הקו = חוזק החיבור");
    expect(root.querySelector(".color-scale")).toBeTruthy();

    if (!root.querySelector(".name-btn")) {
      root.querySelector<HTMLButtonElement>(".party-btn")?.click();
    }
    expect(root.textContent).toContain("הפס בצד = מול כל הרשימה, משוקלל");
    root.querySelector<HTMLButtonElement>(".name-btn")?.click();
    root.querySelector<HTMLButtonElement>(".confirm-btn:not([disabled])")?.click();
    await vi.runOnlyPendingTimersAsync();
    root.querySelector(".chem-edge-hit")?.dispatchEvent(new Event("pointerenter", { bubbles: true }));
    expect(root.querySelector(".edge-tip")?.textContent?.length).toBeGreaterThan(8);

    for (let i = 0; i < 40 && !root.textContent?.includes("ליל בחירות"); i++) {
      if (!root.querySelector(".name-btn")) {
        root.querySelector<HTMLButtonElement>(".party-btn")?.click();
      }
      const btn = root.querySelector<HTMLButtonElement>(".name-btn");
      if (!btn) {
        await vi.runOnlyPendingTimersAsync();
        continue;
      }
      btn.click();
      root.querySelector<HTMLButtonElement>(".confirm-btn:not([disabled])")?.click();
      await vi.runOnlyPendingTimersAsync();
    }

    await vi.runAllTimersAsync();
    expect(root.textContent).toMatch(/ליל בחירות|מנדטים|למה/);
    expect(root.querySelector(".why-line")?.textContent?.length).toBeGreaterThan(8);
    expect(root.textContent).toContain("אמינות");
    expect(root.textContent).toContain("ביקוש");
    expect(root.querySelectorAll(".score-meter").length).toBeGreaterThan(0);
    expect(root.textContent).not.toContain("מה שהעץ");
    expect(root.textContent).not.toContain("מעבד");
    expect(root.textContent).toContain("דראפט · קל");
    expect(root.textContent).toContain("מנצחת המפלגה עם הכי הרבה מנדטים");
    expect(root.querySelector(".board-panel")?.textContent).toMatch(/מנדטים|עוד אין/);
  });

  it("paints setup before a hanging board fetch returns", () => {
    vi.stubGlobal(
      "fetch",
      () =>
        new Promise(() => {
          /* never settles — UI must not wait */
        }),
    );
    const root = document.createElement("div");
    document.body.append(root);
    mount(root);
    expect(root.textContent).toContain("הרשימה");
    expect(root.textContent).toContain("על המכשיר הזה");
    expect(root.textContent).not.toContain("טוען");
    expect(root.querySelector(".spinner, .loading")).toBeNull();
    vi.unstubAllGlobals();
  });

  it("opens create-leader and starts a locked hub draft from a share code", async () => {
    vi.useFakeTimers();
    const root = document.createElement("div");
    document.body.append(root);
    mount(root);
    const create = [...root.querySelectorAll<HTMLButtonElement>(".mode-btn")].find((btn) =>
      btn.textContent?.includes("צור מנהיג"),
    );
    create?.click();
    root.querySelector<HTMLButtonElement>(".primary")?.click();
    expect(root.textContent).toContain("הראש שלך");
    const name = root.querySelector<HTMLInputElement>("#leader-name");
    if (name) {
      name.value = "איתי";
      name.dispatchEvent(new Event("input", { bubbles: true }));
    }
    root.querySelector<HTMLButtonElement>(".primary")?.click();
    await vi.runOnlyPendingTimersAsync();
    expect(root.textContent).toContain("איתי");
    expect(root.textContent).toMatch(/הרשימה של איתי|שבץ/);
    expect(root.textContent).toContain("בחירה 2 מתוך 10");
  });
});
