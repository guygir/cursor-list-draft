/**
 * @vitest-environment happy-dom
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "./app";

describe("playable draft UI", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", () => Promise.reject(new Error("offline")));
    localStorage.clear();
    history.replaceState({}, "", "/");
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
    expect(root.textContent).toContain("הנדיקאפ");
    expect(root.textContent).toContain("בלי הגבלת מפלגה");
    expect(root.textContent).not.toContain("שם אחד מכל מפלגה");
    expect(root.textContent).not.toContain("עד חמישה שמות");
    expect(root.textContent).not.toContain("עד שניים מאותה מפלגה");
    expect(root.textContent).toContain("יצירת מנהיג");
    expect(root.textContent).toContain("אתגר היום");
    expect(root.textContent).toContain("לוח שיאים");
    expect(root.querySelector(".mast")?.textContent).toContain("לוח שיאים");
    expect(root.querySelector(".mast-board")).toBeTruthy();
    expect(root.textContent).toContain("שם השחקן");
    expect(root.textContent).toContain("שם המפלגה");
    expect(root.textContent).toContain("עוד אין שיא שלך במצב הזה");
    expect(root.textContent).toContain("על המכשיר הזה");
    const nPick = root.querySelector(".n-pick");
    const daily = [...root.querySelectorAll<HTMLButtonElement>(".mode-btn")].find((btn) =>
      btn.textContent?.includes("אתגר היום"),
    );
    daily?.click();
    expect(root.querySelector(".n-pick")).toBe(nPick);
    expect(root.querySelector(".n-pick")?.classList.contains("is-locked")).toBe(true);
    expect(root.querySelector(".level-pick")?.classList.contains("is-locked")).toBe(true);
    [...root.querySelectorAll<HTMLButtonElement>(".mode-btn")].find((btn) => btn.textContent?.includes("דראפט"))?.click();
    expect(root.querySelector(".n-pick")?.classList.contains("is-locked")).toBe(false);
    [...root.querySelectorAll<HTMLButtonElement>("button")].find((btn) => btn.classList.contains("mast-board"))?.click();
    expect(root.textContent).toContain("עוד אין תוצאה");
    expect(root.textContent).not.toContain("דראפט · עד 5");
    root.querySelector<HTMLButtonElement>(".quit-btn")?.click();

    const start = root.querySelector<HTMLButtonElement>(".primary");
    start?.click();
    expect(root.textContent).toContain("בחרו מפלגה");
    expect(root.textContent).toContain("בחירה אוטומטית");
    expect(root.querySelector(".auto-pick-btn")).toBeTruthy();
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
    expect(root.querySelector(".notice-rail")?.textContent).toMatch(/בחרה את .+ בבחירה/);
    expect(root.querySelector(".tree-face, .tree-photo")).toBeTruthy();
    expect(root.textContent).toContain("מתעדכנים בכל בחירה");
    const credMeter = root.querySelector<HTMLButtonElement>(".score-meter.is-cred");
    credMeter?.click();
    expect(credMeter?.classList.contains("is-open")).toBe(true);
    expect(credMeter?.textContent).toContain("מפלגה אחת");
    expect(root.querySelector(".score-meter.is-demand")?.textContent).toContain("חולקות");
    expect(root.textContent).toContain("צבע הקו מראה כמה חזק החיבור");
    expect(root.querySelector(".color-scale")).toBeTruthy();

    if (!root.querySelector(".name-btn")) {
      root.querySelector<HTMLButtonElement>(".party-btn")?.click();
    }
    expect(root.textContent).toContain("הפס בצד: מול כל הרשימה, לפי המקום");
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
    expect(root.textContent).toContain("דראפט · פתוח");
    expect(root.textContent).toContain("מנצחת המפלגה עם הכי הרבה מנדטים");
    expect(root.querySelector(".why-line")?.textContent).toMatch(/ניצח|מנדטים/);
    expect(root.querySelector(".why-line")?.textContent).not.toMatch(/^סתירה ב־1–2/);
    expect(root.querySelector(".seat-line")).toBeTruthy();
    expect(root.querySelector(".seat-line .bar-fill")).toBeTruthy();
    expect(root.textContent).toContain("וואטסאפ");
    expect(root.textContent).toContain("סטורי");
    expect(root.querySelector(".share-icon-button[data-share='whatsapp']")).toBeTruthy();
    expect(root.querySelector(".share-icon-button[data-share='instagram']")).toBeTruthy();
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
      btn.textContent?.includes("יצירת מנהיג"),
    );
    create?.click();
    root.querySelector<HTMLButtonElement>(".primary")?.click();
    expect(root.textContent).toContain("ראש הרשימה שלך");
    expect(root.textContent).toContain("אישה");
    expect(root.textContent).toContain("גבר");
    expect(root.querySelectorAll(".look-btn").length).toBe(2);
    expect(root.querySelector<HTMLImageElement>(".look-btn[data-look='woman'] img")?.src).toMatch(
      /avatar-grown-woman\.png$/,
    );
    expect(root.querySelector<HTMLImageElement>(".look-btn[data-look='man'] img")?.src).toMatch(
      /avatar-grown-man\.png$/,
    );
    root.querySelector<HTMLButtonElement>(".look-btn[data-look='man']")?.click();
    const name = root.querySelector<HTMLInputElement>("#leader-name");
    if (name) {
      name.value = "איתי";
      name.dispatchEvent(new Event("input", { bubbles: true }));
    }
    root.querySelector<HTMLButtonElement>(".primary")?.click();
    await vi.runOnlyPendingTimersAsync();
    expect(root.textContent).toContain("איתי");
    expect(root.querySelector(".slot.filled")?.textContent).toContain("איתי");
    expect(root.textContent).toContain("בחרו מפלגה");
    expect(root.textContent).toContain("בחירה 2 מתוך 10");
  });

  it("auto-picks the greedy best without opening a party first", async () => {
    vi.useFakeTimers();
    const root = document.createElement("div");
    document.body.append(root);
    mount(root);
    root.querySelector<HTMLButtonElement>(".primary")?.click();
    expect(root.querySelector(".slot.filled")).toBeNull();
    root.querySelector<HTMLButtonElement>(".auto-pick-btn")?.click();
    await vi.runOnlyPendingTimersAsync();
    expect(root.querySelector(".slot.filled")).toBeTruthy();
    expect(root.querySelector(".tree-face, .tree-photo")).toBeTruthy();

    for (let i = 0; i < 30 && !root.textContent?.includes("ליל בחירות"); i++) {
      root.querySelector<HTMLButtonElement>(".auto-pick-btn:not([disabled])")?.click();
      await vi.runOnlyPendingTimersAsync();
    }
    await vi.runAllTimersAsync();
    expect(root.textContent).toContain("ליל בחירות");
    expect(root.querySelector(".why-line")?.textContent).toMatch(/ניצח|מנדטים/);
    expect(root.querySelector(".seat-line .bar-fill")).toBeTruthy();
    expect(root.querySelector(".share-icon-button[data-share='whatsapp']")).toBeTruthy();
  });

  it("locks the party name after kickoff and returns to setup from the draft", async () => {
    vi.useFakeTimers();
    const root = document.createElement("div");
    document.body.append(root);
    mount(root);
    expect(root.querySelector(".identity-field .name-edit.is-party")).toBeTruthy();
    root.querySelector<HTMLButtonElement>(".primary")?.click();
    expect(root.querySelector(".draft-screen")).toBeTruthy();
    expect(root.querySelector(".draft-screen .name-edit")).toBeNull();
    expect(root.querySelector(".party-label")?.textContent?.length).toBeGreaterThan(0);
    expect(root.textContent).toContain("חזרה לתפריט");
    root.querySelector<HTMLButtonElement>(".auto-pick-btn")?.click();
    await vi.runOnlyPendingTimersAsync();
    expect(root.querySelector(".slot.filled")).toBeTruthy();
    root.querySelector<HTMLButtonElement>(".quit-btn")?.click();
    expect(root.querySelector(".setup-screen")).toBeTruthy();
    expect(root.textContent).toContain("זה צעצוע");
    expect(root.querySelector(".identity-field .name-edit.is-party")).toBeTruthy();
    expect(root.querySelector(".draft-screen")).toBeNull();
  });

  it("opens the leaderboard on daily with a top back button", () => {
    const root = document.createElement("div");
    document.body.append(root);
    mount(root);
    root.querySelector<HTMLButtonElement>(".mast-board")?.click();
    expect(root.textContent).toContain("אתגר היום");
    expect(root.querySelector(".quit-btn")?.textContent).toContain("חזרה לתפריט");
    expect(root.querySelector(".board-filters")).toBeTruthy();
    expect(root.querySelectorAll(".board-panel").length).toBe(1);
    root.querySelector<HTMLButtonElement>(".quit-btn")?.click();
    expect(root.querySelector(".setup-screen")?.textContent).toContain("זה צעצוע");
  });

  it("prefills create-leader with a random name and look faces", () => {
    const root = document.createElement("div");
    document.body.append(root);
    mount(root);
    [...root.querySelectorAll<HTMLButtonElement>(".mode-btn")].find((btn) =>
      btn.textContent?.includes("יצירת מנהיג"),
    )?.click();
    root.querySelector<HTMLButtonElement>(".primary")?.click();
    const name = root.querySelector<HTMLInputElement>("#leader-name");
    expect(name?.value.length).toBeGreaterThan(0);
    expect(root.querySelector<HTMLImageElement>(".look-btn[data-look='woman'] img")?.src).toMatch(
      /avatar-grown-woman\.png$/,
    );
  });
});
