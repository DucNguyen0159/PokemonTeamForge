import { describe, expect, it } from "vitest";

import {
  ABILITY_TAG_DEFINITION_BY_ID,
  ABILITY_TAG_DEFINITIONS,
  abilityTagsForSlug,
} from "@/data/ability-tags";
import { HIDDEN_ABILITY_LABEL } from "@/types/ability";

describe("ability tag metadata", () => {
  it("defines battle-focused ability tag labels", () => {
    expect(ABILITY_TAG_DEFINITIONS.length).toBeGreaterThanOrEqual(12);
    expect(ABILITY_TAG_DEFINITION_BY_ID.get("weather")?.label).toBe("Weather");
    expect(ABILITY_TAG_DEFINITION_BY_ID.get("immunity")?.label).toBe("Immunity");
  });

  it("maps important battle abilities to useful tags", () => {
    expect(abilityTagsForSlug("intimidate")).toEqual(
      expect.arrayContaining(["switching", "defense_boost", "utility"]),
    );
    expect(abilityTagsForSlug("levitate")).toEqual(["immunity"]);
    expect(abilityTagsForSlug("swift-swim")).toEqual(
      expect.arrayContaining(["weather", "speed_control"]),
    );
    expect(abilityTagsForSlug("regenerator")).toEqual(
      expect.arrayContaining(["healing", "switching"]),
    );
  });

  it("uses explicit hidden ability wording", () => {
    expect(HIDDEN_ABILITY_LABEL).toBe("(hidden)");
  });
});
