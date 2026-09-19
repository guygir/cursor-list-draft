import { describe, expect, it } from "vitest";
import { PEOPLE } from "./pool";
import { generatedLookPortrait, generatedPortrait, hasWikiPortrait, initialsHe, lookPortraitSrc, portraitSrc } from "./portraits";
import { makeCustomLeader } from "../systems/modes";

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
    expect(hasWikiPortrait("mishraki")).toBe(true);
    expect(hasWikiPortrait("ronen")).toBe(true);
    expect(hasWikiPortrait("bashir")).toBe(true);
    expect(portraitSrc("mufid-mari")).toContain("wikimedia");
  });

  it("does not attach a same-name stranger after a fuzzy search", () => {
    expect(hasWikiPortrait("talik-gvili")).toBe(false);
    expect(hasWikiPortrait("negri")).toBe(false);
    expect(hasWikiPortrait("rosenthal")).toBe(false);
    expect(hasWikiPortrait("david-ohana")).toBe(false);
    expect(hasWikiPortrait("dror-amos")).toBe(false);
  });

  it("paints an invented hub as a generated woman or man, not a Wikipedia face", () => {
    const woman = makeCustomLeader({
      nameHe: "נועה",
      slateId: "democrats",
      aspects: { bibi: 0.15, judicial: 0.18, service: 0.15, security: 0.48, economy: 0.74 },
      look: "woman",
    });
    const src = portraitSrc(woman.id);
    expect(src).toBe("/looks/avatar-grown-woman.png");
    expect(src).toBe(generatedLookPortrait(woman));
    expect(lookPortraitSrc("man")).toBe("/looks/avatar-grown-man.png");
    expect(lookPortraitSrc("man")).not.toBe(src);
  });
});
