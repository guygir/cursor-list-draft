import { describe, expect, it } from "vitest";
import { allocateSeats, dhondt, ELECTORAL_THRESHOLD, KNESSET_SEATS } from "./seats";

describe("threshold + Bader–Ofer", () => {
  it("drops lists under 3.25% of effective votes", () => {
    const rows = allocateSeats([
      { id: "big", effectiveVotes: 100 },
      { id: "tiny", effectiveVotes: 3 },
    ]);
    const tiny = rows.find((r) => r.id === "tiny");
    const big = rows.find((r) => r.id === "big");
    expect(3 / 103).toBeLessThan(ELECTORAL_THRESHOLD);
    expect(tiny?.passedThreshold).toBe(false);
    expect(tiny?.seats).toBe(0);
    expect(big?.seats).toBe(KNESSET_SEATS);
  });

  it("allocates exactly 120 seats among lists that pass", () => {
    const rows = allocateSeats([
      { id: "a", effectiveVotes: 40 },
      { id: "b", effectiveVotes: 30 },
      { id: "c", effectiveVotes: 20 },
    ]);
    expect(rows.reduce((sum, r) => sum + r.seats, 0)).toBe(120);
    expect(rows.every((r) => r.passedThreshold)).toBe(true);
  });

  it("uses D'Hondt highest averages", () => {
    expect(dhondt([50, 50], 2)).toEqual([1, 1]);
    const seats = dhondt([100, 50], 3);
    expect(seats[0]).toBe(2);
    expect(seats[1]).toBe(1);
  });
});
