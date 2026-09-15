import { describe, expect, it } from "vitest";
import type { DraftList, PersonId } from "../data/types";
import { scoreCohesion } from "./chemistry";
import { placeList, splitNeighborhoodMass } from "./demand";
import { resolveElection } from "./resolve";

function list(id: string, picks: PersonId[], draftOrder = 0): DraftList {
  return {
    id,
    labelHe: id,
    labelEn: id,
    picks,
    isPlayer: id === "player",
    draftOrder,
  };
}

describe("toy scenarios", () => {
  it("clean small: high cohesion, small hill, few seats", () => {
    const clean = list("player", ["ben-gvir", "smotrich", "ohana"]);
    const wideHill = list("cpu-1", ["bennett", "lapid", "eisenkot"], 1);
    const result = resolveElection([clean, wideHill]);
    const player = result.lists.find((r) => r.list.id === "player")!;
    const rival = result.lists.find((r) => r.list.id === "cpu-1")!;

    expect(player.cohesion).toBeGreaterThan(0.8);
    expect(player.neighborhood.id).toBe("hard-right");
    expect(player.massRaw).toBe(14);
    expect(player.seats).toBeGreaterThan(0);
    expect(player.seats).toBeLessThan(rival.seats);
    expect(player.seats).toBeLessThan(40);
  });

  it("wide mess: Bennett 1 + Deri 2 crushes conversion", () => {
    const mess = list("player", ["bennett", "deri", "gantz"]);
    const clean = list("cpu-1", ["ben-gvir", "smotrich", "ohana"], 1);
    const chemistry = scoreCohesion(mess.picks);
    const result = resolveElection([mess, clean]);
    const player = result.lists.find((r) => r.list.id === "player")!;

    expect(chemistry.pairs.some((p) => p.i === 1 && p.j === 2 && p.s === -1)).toBe(true);
    expect(player.cohesion).toBeLessThan(0.4);
    expect(player.effectiveVotes).toBeLessThan(player.massAfterSplit * player.hubDraw * 0.35);
    expect(result.why.en.toLowerCase()).toMatch(/civil war|veto/);
  });

  it("clone hill: Bennett-centric and Eisenkot-centric split change-camp", () => {
    const player = list("player", ["bennett", "lapid", "golan"]);
    const cpu = list("cpu-1", ["eisenkot", "gantz"], 1);
    const a = placeList(player);
    const b = placeList(cpu);
    expect(a.neighborhood.id).toBe("change-camp");
    expect(b.neighborhood.id).toBe("change-camp");

    const split = splitNeighborhoodMass([a, b]);
    expect(split[0]?.massAfterSplit).toBeCloseTo(16);
    expect(split[1]?.massAfterSplit).toBeCloseTo(16);

    const result = resolveElection([player, cpu]);
    const p = result.lists.find((r) => r.list.id === "player")!;
    const c = result.lists.find((r) => r.list.id === "cpu-1")!;
    expect(p.splitWith).toContain("cpu-1");
    expect(p.massAfterSplit).toBeLessThan(p.massRaw);
    expect(c.massAfterSplit).toBeLessThan(c.massRaw);
    expect(result.why.en.toLowerCase()).toMatch(/clon|split|neighborhood|hill/);
  });

  it("veto poster: Liberman 1 + Netanyahu high cracks credibility", () => {
    const poster = list("player", ["liberman", "netanyahu", "ohana"]);
    const clean = list("cpu-1", ["bennett", "lapid", "eisenkot"], 1);
    const result = resolveElection([poster, clean]);
    const player = result.lists.find((r) => r.list.id === "player")!;

    expect(player.cohesion).toBeLessThan(0.4);
    expect(player.pairs.some((p) => p.relation.isSourcedVeto && p.i === 1)).toBe(true);
    expect(player.effectiveVotes).toBeLessThan(
      result.lists.find((r) => r.list.id === "cpu-1")!.effectiveVotes,
    );
    expect(result.why.he).toMatch(/וטו|מלחמת אזרחים/);
  });
});
