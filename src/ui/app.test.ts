/**
 * @vitest-environment happy-dom
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import { mount } from "./app";

describe("playable draft UI", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.useRealTimers();
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

    const start = root.querySelector<HTMLButtonElement>(".primary");
    start?.click();
    expect(root.textContent).toContain("בחר מפלגה");
    expect(root.textContent).not.toContain("בנימין נתניהו");

    root.querySelector<HTMLButtonElement>(".party-btn")?.click();
    expect(root.textContent).toContain("בנימין נתניהו");
    expect(root.textContent).not.toContain("איתמר בן גביר");
    expect(root.querySelectorAll(".party-btn").length).toBe(0);

    const firstName = root.querySelector<HTMLButtonElement>(".name-btn");
    firstName?.click();
    root.querySelector<HTMLButtonElement>(".confirm-btn:not([disabled])")?.click();
    await vi.runOnlyPendingTimersAsync();
    const shown = [...root.querySelectorAll<HTMLButtonElement>(".name-btn")].map((btn) => btn.textContent);
    expect(shown.join(" ")).not.toContain("בנימין נתניהו");
    expect(root.querySelector(".notice-rail")?.textContent).toMatch(/מפלגה 1/);
    expect(root.querySelector(".tree-face, .tree-photo")).toBeTruthy();

    if (!root.querySelector(".name-btn")) {
      root.querySelector<HTMLButtonElement>(".party-btn")?.click();
    }
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
  });
});
