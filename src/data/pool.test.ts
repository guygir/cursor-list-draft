import { describe, expect, it } from "vitest";
import { SLATE_ASPECTS } from "./aspects";
import { getPerson, PEOPLE, SLATE_ORDER } from "./pool";

describe("2026 slate pool", () => {
  it("has enough people for a 3-list snake of 10", () => {
    expect(PEOPLE.length).toBeGreaterThanOrEqual(30);
  });

  it("keeps unique ids", () => {
    const ids = PEOPLE.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives each published slate its top 10 without invented names", () => {
    for (const slate of SLATE_ORDER) {
      const rows = PEOPLE.filter((p) => p.slateId === slate);
      expect(rows.length).toBeGreaterThanOrEqual(10);
      expect(rows.map((p) => p.listSlot).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    }
    expect(getPerson("talik-gvili").nameHe).toBe("טליק גואילי");
    expect(getPerson("mufid-mari").nameHe).toBe("מופיד מרעי");
    expect(getPerson("ahmed-darawshe").listSlot).toBe(9);
  });

  it("sits every published name on the five toy axes", () => {
    for (const person of PEOPLE) {
      for (const key of ["bibi", "judicial", "service", "security", "economy"] as const) {
        expect(person.aspects[key]).toBeGreaterThanOrEqual(0);
        expect(person.aspects[key]).toBeLessThanOrEqual(1);
      }
      expect(person.aspectsNoteHe?.length).toBeGreaterThan(8);
    }
    expect(getPerson("levin").aspects.judicial).toBeGreaterThan(getPerson("eli-cohen").aspects.judicial);
    expect(getPerson("israel-katz").aspects.security).toBeGreaterThan(getPerson("ohana").aspects.security);
    expect(getPerson("tibon").aspects.security).toBeLessThan(getPerson("avisar").aspects.security);
    expect(getPerson("talik-gvili").aspects).not.toEqual(SLATE_ASPECTS.likud);
    expect(getPerson("deri").aspects.economy).toBeGreaterThan(getPerson("liberman").aspects.economy);
    expect(getPerson("golan").aspects.economy).toBeGreaterThan(getPerson("lapid").aspects.economy);
    expect(SLATE_ASPECTS.shas.economy).toBeGreaterThan(SLATE_ASPECTS.likud.economy);
    expect(getPerson("bennett").cell).toEqual({
      x: getPerson("bennett").aspects.service,
      y: getPerson("bennett").aspects.bibi,
    });
  });
});
