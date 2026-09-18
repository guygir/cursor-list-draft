import { describe, expect, it } from "vitest";
import { satelliteLayout } from "./tree";

describe("constellation rings", () => {
  it("keeps six satellites on one ring so seven nodes are a hexagon", () => {
    const seven = satelliteLayout(6);
    expect(seven.inner).toBe(6);
    expect(seven.outer).toBe(0);
  });

  it("puts ten nodes on two rings, six then three", () => {
    const ten = satelliteLayout(9);
    expect(ten.inner).toBe(6);
    expect(ten.outer).toBe(3);
  });
});
