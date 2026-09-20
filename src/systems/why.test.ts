import { describe, expect, it } from "vitest";
import { whyLine, type WhyList } from "./why";
import { NEIGHBORHOODS } from "../data/masses";
import type { PairTerm } from "./chemistry";

function score(partial: Partial<WhyList> & { id?: string; isPlayer?: boolean; labelHe?: string }): WhyList {
  return {
    list: {
      id: partial.id ?? "player",
      labelHe: partial.labelHe ?? "נחל אור",
      labelEn: "Nachal Or",
      picks: ["bennett", "lapid"],
      isPlayer: partial.isPlayer ?? true,
      draftOrder: 0,
    },
    cohesion: 0.6,
    pairs: [],
    neighborhood: NEIGHBORHOODS[0]!,
    massRaw: 20,
    massAfterSplit: 38,
    splitWith: [],
    passedThreshold: true,
    seats: 12,
    ...partial,
  };
}

describe("why line", () => {
  it("leads with who won by mandates, not a raw after-split number", () => {
    const line = whyLine(
      [
        score({ seats: 12 }),
        score({ id: "cpu-1", isPlayer: false, labelHe: "ברק אלון", seats: 20 }),
      ],
      "cpu-1",
    );
    expect(line.he).toContain("ניצח עם");
    expect(line.he).toContain("20 מנדטים");
    expect(line.he).not.toContain("38");
    expect(line.he).not.toContain("אחרי פיצול");
  });

  it("does not headline opposite-cell tension at 1–2 as the reason", () => {
    const pair: PairTerm = {
      i: 1,
      j: 2,
      a: "bennett",
      b: "deri",
      s: -0.45,
      weight: 1,
      contribution: -0.45,
      relation: {
        a: "bennett",
        b: "deri",
        s: -0.45,
        kind: "opposite-cell",
        type: "cell-distance",
        reliability: "medium",
        isSourcedVeto: false,
        reasonHe: "תאים מנוגדים",
        reasonEn: "opposite cells",
        authored: [],
      },
    };
    const line = whyLine(
      [
        score({
          seats: 18,
          pairs: [pair],
          list: {
            id: "player",
            labelHe: "נחל אור",
            labelEn: "Nachal Or",
            picks: ["bennett", "deri"],
            isPlayer: true,
            draftOrder: 0,
          },
        }),
        score({ id: "cpu-1", isPlayer: false, labelHe: "ברק אלון", seats: 10 }),
      ],
      "player",
    );
    expect(line.he).toMatch(/^ניצחת עם 18 מנדטים/);
    expect(line.he).not.toContain("סתירה ב־1–2");
  });

  it("names a 0–120 wipe when the player misses the threshold", () => {
    const line = whyLine(
      [
        score({ seats: 0, passedThreshold: false }),
        score({ id: "cpu-1", isPlayer: false, labelHe: "ברק אלון", seats: 120 }),
      ],
      "cpu-1",
    );
    expect(line.he).toContain("120");
    expect(line.he).toContain("אחוז החסימה");
    expect(line.he).toContain("ברק אלון");
  });
});
