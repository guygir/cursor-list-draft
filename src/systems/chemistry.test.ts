import { describe, expect, it } from "vitest";
import { PEOPLE } from "../data/pool";
import {
  GREEN_EPSILON,
  pairContribution,
  pairRankWeight,
  pairRelation,
  pairWeight,
  rankWeight,
  scoreCohesion,
} from "./chemistry";

describe("rank weights", () => {
  it("keeps 1/rank for the centroid, with a 1.25 hub bump on slot 1", () => {
    expect(rankWeight(1)).toBeCloseTo(1.25);
    expect(rankWeight(2)).toBeCloseTo(0.5);
    expect(rankWeight(6)).toBeCloseTo(1 / 6);
  });

  it("makes 1–2 the ticket at weight 1 and later pairs quieter", () => {
    expect(pairRankWeight(1, 2)).toBeCloseTo(1);
    expect(pairRankWeight(1, 6)).toBeCloseTo(1 / 3);
    expect(pairRankWeight(5, 6)).toBeCloseTo(2 / 30);
    expect(pairRankWeight(19, 20)).toBeLessThan(0.006);
  });
});

describe("pair relation", () => {
  it("uses sourced vetoes at -1.0", () => {
    expect(pairRelation("liberman", "netanyahu").s).toBe(-1);
    expect(pairRelation("liberman", "abbas").kind).toBe("veto");
  });

  it("uses the Bennett–Deri sourced split", () => {
    const rel = pairRelation("bennett", "deri");
    expect(rel.kind).toBe("split");
    expect(rel.s).toBe(-1);
    expect(rel.reasonHe.length).toBeGreaterThan(8);
  });

  it("treats same-line clusters as a small green", () => {
    expect(pairRelation("netanyahu", "ohana").s).toBeGreaterThan(0.08);
    expect(pairRelation("bennett", "eisenkot").s).toBeGreaterThan(0.05);
    expect(pairRelation("bennett", "lapid").kind).toBe("same-line");
    expect(pairRelation("bennett", "lapid").type).toBe("same-faction");
  });

  it("distinguishes Likud 2/3/4 instead of cloning the slate", () => {
    const loyal = pairRelation("netanyahu", "ohana").s;
    const courts = pairRelation("netanyahu", "levin").s;
    const minister = pairRelation("eli-cohen", "ohana").s;
    const mismatch = pairRelation("eli-cohen", "levin").s;
    expect(loyal).toBeGreaterThan(courts);
    expect(minister).toBeGreaterThan(mismatch);
    expect(pairRelation("ofir-katz", "talik-gvili").s).toBeGreaterThan(0.15);
    expect(pairRelation("saar", "levin").s).toBeLessThan(0);
  });

  it("compares the two people, not their parties", () => {
    expect(pairRelation("levin", "eisenkot").s).toBeLessThan(pairRelation("eli-cohen", "eisenkot").s);
    expect(pairRelation("israel-katz", "eisenkot").s).toBeGreaterThan(pairRelation("levin", "eisenkot").s);
    expect(pairRelation("rothman", "golan").s).toBeLessThan(pairRelation("forer", "golan").s);
  });

  it("marks Ben-Gvir vs Golan as a heavy red, not a binary 1/0", () => {
    const rel = pairRelation("ben-gvir", "golan");
    expect(rel.s).toBeLessThan(-0.4);
    expect(rel.s).toBeGreaterThan(-1);
    expect(["rumor", "opposite-cell"]).toContain(rel.kind);
  });

  it("lets opposition dominate Gantz–Netanyahu even if they served together", () => {
    const rel = pairRelation("gantz", "netanyahu");
    expect(rel.s).toBeLessThan(0);
  });

  it("scores every published pair on the axes", () => {
    for (let i = 0; i < PEOPLE.length; i++) {
      for (let j = i + 1; j < PEOPLE.length; j++) {
        const rel = pairRelation(PEOPLE[i]!.id, PEOPLE[j]!.id);
        expect(rel.s).toBeGreaterThanOrEqual(-1);
        expect(rel.s).toBeLessThanOrEqual(0.22);
        expect(Number.isFinite(rel.s)).toBe(true);
      }
    }
  });

  it("gives most pairs a graded color, not only a few 1-or-0 edges", () => {
    const sample = [
      pairRelation("netanyahu", "golan").s,
      pairRelation("bennett", "ben-gvir").s,
      pairRelation("liberman", "deri").s,
      pairRelation("lapid", "eisenkot").s,
      pairRelation("ohana", "regev").s,
      pairRelation("gantz", "bennett").s,
    ];
    const bands = new Set(sample.map((s) => Math.round(s * 5) / 5));
    expect(bands.size).toBeGreaterThan(2);
    expect(sample.every((s) => s === 0 || Math.abs(s) === 1)).toBe(false);
    expect(sample.some((s) => Math.abs(s) > 0.02 && Math.abs(s) < 1)).toBe(true);
  });
});

describe("pair contributions", () => {
  it("keeps a same-rank green far smaller than a same-rank red", () => {
    const veto = pairRelation("liberman", "netanyahu");
    const green = pairRelation("netanyahu", "ohana");
    const redMag = Math.abs(pairContribution(1, 2, veto));
    const greenMag = pairContribution(1, 2, green);
    expect(greenMag).toBeCloseTo(green.s * pairRankWeight(1, 2) * GREEN_EPSILON);
    expect(greenMag / redMag).toBeLessThan(0.2);
    expect(greenMag / redMag).toBeGreaterThan(0);
  });

  it("never fully discounts a sourced veto versus the leader", () => {
    const veto = pairRelation("liberman", "netanyahu");
    const w20 = pairWeight(1, 20, veto);
    expect(w20).toBeCloseTo(2 * 0.25);
    expect(w20).toBeGreaterThan(pairRankWeight(1, 20));
  });
});

describe("cohesion curve", () => {
  it("maps to (0, 1]", () => {
    const clean = scoreCohesion(["ben-gvir", "smotrich", "ohana"]);
    const war = scoreCohesion(["bennett", "deri"]);
    expect(clean.cohesion).toBeGreaterThan(0);
    expect(clean.cohesion).toBeLessThanOrEqual(1);
    expect(war.cohesion).toBeGreaterThan(0);
    expect(war.cohesion).toBeLessThanOrEqual(1);
  });

  it("crushes a 1–2 civil war and ignores 19–20 noise", () => {
    const war = scoreCohesion(["bennett", "deri"]);
    const quiet = scoreCohesion([
      "bennett",
      "lapid",
      "eisenkot",
      "golan",
      "gantz",
      "liberman",
    ]);
    const noiseOnly = pairContribution(19, 20, pairRelation("liberman", "netanyahu"));
    expect(war.cohesion).toBeLessThan(0.4);
    expect(Math.abs(noiseOnly)).toBeLessThan(0.01);
    expect(quiet.cohesion).toBeGreaterThan(war.cohesion);
  });
});
