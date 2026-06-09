import { describe, expect, it } from "vitest";

import { buildGmaxPreviewRows } from "./gmax-preview";

describe("buildGmaxPreviewRows", () => {
  it("maps damaging moves to max moves for gigantamax", () => {
    const result = buildGmaxPreviewRows("blastoise-gmax", [
      {
        slot: 1,
        move: {
          id: 1,
          name: "Surf",
          slug: "surf",
          type: "water",
          category: "special",
          priority: 0,
        },
      },
      { slot: 2, move: null },
      { slot: 3, move: null },
      { slot: 4, move: null },
    ]);

    expect(result.isGigantamax).toBe(true);
    expect(result.signatureMove?.moveName).toBe("G-Max Cannonade");
    expect(result.rows[0]?.resultMoveName).toBe("G-Max Cannonade");
  });

  it("maps status moves to Max Guard", () => {
    const result = buildGmaxPreviewRows("blastoise-gmax", [
      {
        slot: 1,
        move: {
          id: 2,
          name: "Protect",
          slug: "protect",
          type: "normal",
          category: "status",
          priority: 4,
        },
      },
      { slot: 2, move: null },
      { slot: 3, move: null },
      { slot: 4, move: null },
    ]);

    expect(result.rows[0]?.resultMoveName).toBe("Max Guard");
    expect(result.rows[0]?.resultMoveType).toBeUndefined();
  });

  it("returns non-gmax state for non-gigantamax forms", () => {
    const result = buildGmaxPreviewRows("blastoise-mega", [
      { slot: 1, move: null },
      { slot: 2, move: null },
      { slot: 3, move: null },
      { slot: 4, move: null },
    ]);

    expect(result.isGigantamax).toBe(false);
    expect(result.signatureMove).toBeNull();
  });
});
