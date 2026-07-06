import { describe, expect, it } from "vitest";

import { getSlotCompletionStatus } from "@/lib/champions/slot-completion";
import { getSlotFieldErrors } from "@/lib/champions/legality-anchors";
import type { ChampionsLegalityIssue } from "@/lib/champions/legality";
import type { ChampionsPokemon } from "@/types/champions";

const baseSlot: ChampionsPokemon = {
  id: "s1",
  slot: 1,
  pokemonId: 1,
  pokemonName: "Pikachu",
  ability: "Static",
  item: "Light Ball",
  moves: ["Thunderbolt", "Volt Switch", "Protect", "Fake Out"],
  statAlignment: "Timid",
  sp: { hp: 2, atk: 0, def: 0, spa: 32, spd: 0, spe: 32 },
};

describe("getSlotCompletionStatus", () => {
  it("marks a full legal spread as complete", () => {
    expect(getSlotCompletionStatus(baseSlot)).toBe("complete");
  });

  it("marks missing moves as partial", () => {
    expect(
      getSlotCompletionStatus({ ...baseSlot, moves: ["Thunderbolt", "", "", ""] }),
    ).toBe("partial");
  });
});

describe("getSlotFieldErrors", () => {
  it("maps SP issues to sp field", () => {
    const issues: ChampionsLegalityIssue[] = [
      { severity: "error", message: "Slot 1: SP limit exceeded (70/66)." },
    ];
    expect(getSlotFieldErrors(issues, 1).has("sp")).toBe(true);
  });
});
