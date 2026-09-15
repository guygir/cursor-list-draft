import { describe, expect, it } from "vitest";
import { SLATE_ASPECTS } from "./aspects";
import { getPerson, PEOPLE, SLATE_ORDER } from "./pool";

describe("2026 slate pool", () => {
  it("has enough people for a 3-list snake of 6", () => {
    expect(PEOPLE.length).toBeGreaterThanOrEqual(18);
  });

  it("keeps unique ids", () => {
    const ids = PEOPLE.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives each published slate its top slots without invented names", () => {
    const short = new Set(["raam", "blue-white", "joint-list"]);
    for (const slate of SLATE_ORDER) {
      const rows = PEOPLE.filter((p) => p.slateId === slate);
      if (short.has(slate)) {
        expect(rows.length).toBeGreaterThanOrEqual(6);
      } else {
        expect(rows.length).toBeGreaterThanOrEqual(10);
      }
    }
  });

  it("sits every published name on the four toy axes", () => {
    for (const person of PEOPLE) {
      for (const key of ["bibi", "judicial", "service", "security"] as const) {
        expect(person.aspects[key]).toBeGreaterThanOrEqual(0);
        expect(person.aspects[key]).toBeLessThanOrEqual(1);
      }
      expect(person.aspectsNoteHe?.length).toBeGreaterThan(8);
    }
    expect(getPerson("levin").aspects.judicial).toBeGreaterThan(getPerson("eli-cohen").aspects.judicial);
    expect(getPerson("israel-katz").aspects.security).toBeGreaterThan(getPerson("ohana").aspects.security);
    expect(getPerson("tibon").aspects.security).toBeLessThan(getPerson("avisar").aspects.security);
    expect(getPerson("talik-gvili").aspects).not.toEqual(SLATE_ASPECTS.likud);
  });
});
