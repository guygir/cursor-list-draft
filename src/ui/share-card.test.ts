import { describe, expect, it } from "vitest";
import { shareCaption } from "./share-card";

describe("share caption", () => {
  it("uses the mandates + party + game + link sentence", () => {
    const caption = shareCaption(11, "רכס חרמון", "https://example.test/play");
    expect(caption.text).toBe(
      "I got 11 mandates with my party רכס חרמון on הרשימה! Come try for yourself: https://example.test/play",
    );
  });
});
