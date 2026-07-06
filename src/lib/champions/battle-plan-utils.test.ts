import { describe, expect, it } from "vitest";

import {
  getFormatLimits,
  summarizeSpFocus,
  togglePlanSelection,
  toggleToken,
} from "@/lib/champions/battle-plan-utils";
import type { ChampionsBattlePlan } from "@/types/champions";

describe("battle-plan-utils", () => {
  it("returns format limits for singles and doubles", () => {
    expect(getFormatLimits("single")).toEqual({ selected: 3, leads: 1 });
    expect(getFormatLimits("double")).toEqual({ selected: 4, leads: 2 });
  });

  it("removes lead and backup when deselecting a member", () => {
    const plan: ChampionsBattlePlan = {
      id: "plan-1",
      name: "Test",
      format: "double",
      matchupLabel: "vs Rain",
      selectedPokemonIds: ["slot-1", "slot-2"],
      leadPokemonIds: ["slot-1"],
      backupPokemonIds: ["slot-2"],
    };
    const patch = togglePlanSelection(plan, "slot-1");
    expect(patch.selectedPokemonIds).toEqual(["slot-2"]);
    expect(patch.leadPokemonIds).toEqual([]);
    expect(patch.backupPokemonIds).toEqual(["slot-2"]);
  });

  it("summarizes SP focus from highest stats", () => {
    expect(
      summarizeSpFocus({ hp: 32, atk: 0, def: 20, spa: 0, spd: 12, spe: 2 }),
    ).toBe("32 HP / 20 Def / 12 SpD");
  });

  it("respects max selection count", () => {
    expect(toggleToken(["slot-1", "slot-2", "slot-3"], "slot-4", 3)).toEqual([
      "slot-1",
      "slot-2",
      "slot-3",
    ]);
  });
});
