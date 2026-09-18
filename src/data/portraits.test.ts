import { describe, expect, it } from "vitest";
import { PEOPLE } from "./pool";
import { generatedPortrait, hasWikiPortrait, initialsHe, portraitSrc } from "./portraits";

describe("portraits", () => {
  it("gives every published name an image src", () => {
    for (const person of PEOPLE) {
      const src = portraitSrc(person.id);
      expect(src.length, person.id).toBeGreaterThan(8);
      expect(src.startsWith("http") || src.startsWith("data:image/svg+xml"), person.id).toBe(true);
    }
  });

  it("builds a fallback card when Wikipedia has no photo", () => {
    const src = generatedPortrait("talik-gvili");
    expect(hasWikiPortrait("talik-gvili")).toBe(false);
    expect(src.startsWith("data:image/svg+xml")).toBe(true);
    expect(decodeURIComponent(src)).toContain("טג");
    expect(decodeURIComponent(src)).toContain("גואילי");
    expect(initialsHe("טליק גואילי")).toBe("טג");
  });

  it("keeps Wikipedia photos for published faces that have a page", () => {
    expect(hasWikiPortrait("mufid-mari")).toBe(true);
    expect(hasWikiPortrait("avisar")).toBe(true);
    expect(portraitSrc("mufid-mari")).toContain("wikimedia");
  });
});
