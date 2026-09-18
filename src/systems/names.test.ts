import { describe, expect, it } from "vitest";
import {
  isForbiddenPartyName,
  mulberry32,
  PARTY_WORD_BANK,
  randomPartyName,
  sanitizeDisplayName,
  uniquePartyNames,
} from "./names";

describe("invented party names", () => {
  it("stays deterministic for a seed and never uses a real party brand", () => {
    const a = uniquePartyNames(4, mulberry32(7));
    const b = uniquePartyNames(4, mulberry32(7));
    expect(a).toEqual(b);
    expect(new Set(a).size).toBe(4);
    for (const name of a) {
      expect(isForbiddenPartyName(name)).toBe(false);
      const [left, right] = name.split(" ");
      expect(PARTY_WORD_BANK).toContain(left);
      expect(PARTY_WORD_BANK).toContain(right);
    }
  });

  it("avoids a taken pair and strips markup", () => {
    const taken = new Set<string>();
    const first = randomPartyName(() => 0.1, taken);
    taken.add(first);
    const second = randomPartyName(() => 0.1, taken);
    expect(second).not.toBe(first);
    expect(sanitizeDisplayName("  <ליכוד>  ")).toBe("ליכוד");
    expect(isForbiddenPartyName("הליכוד החדש")).toBe(true);
  });
});
