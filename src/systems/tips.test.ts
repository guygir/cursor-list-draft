/**
 * @vitest-environment happy-dom
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { disableTips, enableTips, resetTips, tipsAllowed } from "./tips";

describe("first-run tips cookie", () => {
  beforeEach(() => {
    resetTips();
    localStorage.clear();
  });

  afterEach(() => {
    resetTips();
  });

  it("starts on, then a disable cookie turns the tour off", () => {
    expect(tipsAllowed()).toBe(true);
    disableTips();
    expect(tipsAllowed()).toBe(false);
    expect(document.cookie).toMatch(/harshima_tips=off/);
    expect(localStorage.getItem("list-draft:tips")).toBe("off");
  });

  it("falls back to localStorage when the cookie is missing", () => {
    localStorage.setItem("list-draft:tips", "off");
    expect(tipsAllowed()).toBe(false);
    enableTips();
    expect(tipsAllowed()).toBe(true);
  });
});
