import { describe, expect, it } from "vitest";
import { ASPECT_IDS, ASPECT_PIP_COLOR } from "./aspects";

describe("aspect pip colors", () => {
  it("gives each axis its own yellow shade", () => {
    expect(ASPECT_IDS.every((id) => ASPECT_PIP_COLOR[id])).toBe(true);
    expect(new Set(ASPECT_IDS.map((id) => ASPECT_PIP_COLOR[id])).size).toBe(ASPECT_IDS.length);
  });
});
