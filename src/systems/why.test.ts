import { describe, expect, it } from "vitest";
import { whyLine, type WhyList } from "./why";
import { NEIGHBORHOODS } from "../data/masses";

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
  it("does not print a raw after-split number and names the seat winner", () => {
    const line = whyLine(
      [
        score({ seats: 12 }),
        score({ id: "cpu-1", isPlayer: false, labelHe: "ברק אלון", seats: 20 }),
      ],
      "cpu-1",
    );
    expect(line.he).toContain("יותר מנדטים");
    expect(line.he).not.toContain("38");
    expect(line.he).not.toContain("אחרי פיצול");
  });
});
