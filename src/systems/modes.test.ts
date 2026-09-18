import { describe, expect, it } from "vitest";
import { getPerson } from "../data/pool";
import { pairRelation } from "./chemistry";
import {
  dailyHubId,
  dailySeed,
  decodeCustomCode,
  encodeCustomCode,
  ensureCustomLeader,
  makeCustomLeader,
  nearestSlate,
  sanitizeLeaderName,
} from "./modes";

describe("create-leader codes", () => {
  it("round-trips a Mandat-style ?c= code", () => {
    const spec = {
      nameHe: "איתי",
      slateId: "democrats" as const,
      aspects: { bibi: 0.15, judicial: 0.2, service: 0.3, security: 0.7, economy: 0.4 },
    };
    const code = encodeCustomCode(spec);
    expect(code.startsWith("democrats_")).toBe(true);
    expect(code.endsWith("_איתי")).toBe(true);
    const back = decodeCustomCode(code);
    expect(back?.nameHe).toBe("איתי");
    expect(back?.slateId).toBe("democrats");
    expect(back?.aspects.bibi).toBeCloseTo(0.15, 1);
    expect(back?.aspects.security).toBeCloseTo(0.7, 1);
  });

  it("registers an invented hub without putting them in the published pool", () => {
    const person = makeCustomLeader({
      nameHe: "איתי",
      slateId: nearestSlate({ bibi: 0.15, judicial: 0.18, service: 0.15, security: 0.48, economy: 0.74 }),
      aspects: { bibi: 0.15, judicial: 0.18, service: 0.15, security: 0.48, economy: 0.74 },
    });
    expect(person.identitySource.note).toBe("invented-leader");
    expect(getPerson(person.id).nameHe).toBe("איתי");
    expect(person.draw).toBe(0.7);
    const again = ensureCustomLeader(encodeCustomCode({
      nameHe: person.nameHe,
      aspects: person.aspects,
      slateId: person.slateId,
    }));
    expect(again?.id).toBe(person.id);
  });

  it("paints invented same-slate as a cell, not a real faction seat", () => {
    const hub = makeCustomLeader({
      nameHe: "נועה",
      slateId: "democrats",
      aspects: { bibi: 0.15, judicial: 0.18, service: 0.15, security: 0.48, economy: 0.74 },
    });
    const rel = pairRelation(hub.id, "golan");
    expect(rel.reasonHe).toMatch(/משבצת|מומצא/);
    expect(rel.reasonHe).not.toMatch(/אותה מפלגה ב־2026/);
  });

  it("rejects empty names and strips markup", () => {
    expect(sanitizeLeaderName("  <בנט>  ")).toBe("בנט");
    expect(sanitizeLeaderName("")).toBe("");
  });
});

describe("daily hub", () => {
  it("is deterministic for a date", () => {
    expect(dailyHubId("2026-09-18")).toBe(dailyHubId("2026-09-18"));
    expect(dailySeed("2026-09-18")).not.toBe(dailySeed("2026-09-19"));
    expect(getPerson(dailyHubId("2026-09-18")).listSlot).toBe(1);
  });
});
