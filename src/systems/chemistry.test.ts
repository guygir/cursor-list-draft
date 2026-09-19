import { describe, expect, it } from "vitest";
import { PEOPLE } from "../data/pool";
import {
  GREEN_EPSILON,
  pairContribution,
  pairRankWeight,
  pairRelation,
  pairWeight,
  rankWeight,
  relationColor,
  relationColorStops,
  relationOpacity,
  relationStrokeWidth,
  RELATION_S_MAX,
  RELATION_S_MIN,
  scoreCohesion,
  teamRelation,
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

  it("scales edge color with the signed connection, not a 1/0 switch", () => {
    const veto = relationColor(-1);
    const far = relationColor(-0.45);
    const cool = relationColor(-0.15);
    const none = relationColor(0);
    const close = relationColor(0.15);
    expect(new Set([veto, far, cool, none, close]).size).toBe(5);
    expect(veto).toMatch(/rgb\(196, 90, 78\)/);
    expect(none).toMatch(/rgb\(90, 86, 76\)/);
    expect(relationStrokeWidth(-1, 1)).toBeGreaterThan(relationStrokeWidth(-0.2, 1));
    expect(relationStrokeWidth(-1, 1)).toBeGreaterThan(relationStrokeWidth(-1, pairRankWeight(5, 6)) * 3);
    expect(relationStrokeWidth(-1, pairRankWeight(1, 2))).toBeGreaterThan(relationStrokeWidth(0.15, pairRankWeight(1, 2)));
    expect(relationOpacity(-1)).toBeGreaterThan(relationOpacity(-0.2));
    expect(relationOpacity(0)).toBeGreaterThan(0.5);
  });
});

describe("edge color range", () => {
  it("spans veto red through muted to a thin green ceiling", () => {
    const stops = relationColorStops();
    expect(RELATION_S_MIN).toBe(-1);
    expect(RELATION_S_MAX).toBe(0.22);
    expect(stops[0]?.s).toBe(-1);
    expect(stops.at(-1)?.s).toBe(0.22);
    expect(new Set(stops.map((stop) => stop.color)).size).toBe(stops.length);
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

describe("team-weighted side tone", () => {
  it("matches the hub pair when the ticket is only the leader", () => {
    const team = teamRelation(["bennett"], "deri");
    expect(team.s).toBeCloseTo(pairRelation("bennett", "deri").s);
    expect(team.worst?.id).toBe("bennett");
  });

  it("pulls toward the whole ticket, not only the leader", () => {
    const hubOnly = teamRelation(["bennett"], "eisenkot").s;
    const mixed = teamRelation(["bennett", "deri"], "eisenkot").s;
    expect(hubOnly).toBeGreaterThan(0);
    expect(mixed).toBeLessThan(hubOnly);
    expect(mixed).toBeGreaterThan(pairRelation("deri", "eisenkot").s);
  });

  it("keeps a leader veto red even after later green fillers", () => {
    const team = teamRelation(["liberman", "eisenkot"], "netanyahu");
    expect(team.s).toBeLessThan(-0.4);
    expect(team.worst?.id).toBe("liberman");
    expect(team.worst?.relation.kind).toBe("veto");
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
