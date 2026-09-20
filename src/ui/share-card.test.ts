import { describe, expect, it } from "vitest";
import { fitShareGraph, shareCaption } from "./share-card";

describe("share caption", () => {
  it("uses the mandates + party + game + link sentence", () => {
    const caption = shareCaption(11, "רכס חרמון", "https://example.test/play");
    expect(caption.text).toBe(
      "I got 11 mandates with my party רכס חרמון on הרשימה! Come try for yourself: https://example.test/play",
    );
  });
});

describe("share graph fit", () => {
  it("spreads a ten-node polygon across most of the rect", () => {
    const box = { x: 40, y: 500, w: 1000, h: 500 };
    const points = fitShareGraph(box, 10);
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const span = Math.min(box.w, box.h);
    expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(span * 0.55);
    expect(Math.max(...ys) - Math.min(...ys)).toBeGreaterThan(span * 0.55);
    expect(Math.min(...xs)).toBeGreaterThan(box.x);
    expect(Math.max(...xs)).toBeLessThan(box.x + box.w);
  });
});
