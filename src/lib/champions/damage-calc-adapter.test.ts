import { describe, expect, it } from "vitest";

import { calculateChampionsDamage } from "@/lib/champions/damage-calc-adapter";

const defaultSp = { hp: 11, atk: 11, def: 11, spa: 11, spd: 11, spe: 11 };

describe("calculateChampionsDamage", () => {
  it("handles status moves without throwing", () => {
    const result = calculateChampionsDamage({
      generation: 9,
      attacker: {
        species: "Hawlucha",
        sp: defaultSp,
      },
      defender: {
        species: "Snorlax",
        sp: defaultSp,
      },
      moveName: "Entrainment",
    });

    expect(result.isNonDamaging).toBe(true);
    expect(result.koText).toBe("This move does not deal damage.");
    expect(result.minDamage).toBe(0);
    expect(result.maxDamage).toBe(0);
  });

  it("returns KO text for damaging moves", () => {
    const result = calculateChampionsDamage({
      generation: 9,
      attacker: {
        species: "Hawlucha",
        sp: { ...defaultSp, atk: 32 },
      },
      defender: {
        species: "Snorlax",
        sp: defaultSp,
      },
      moveName: "Close Combat",
    });

    expect(result.isNonDamaging).toBe(false);
    expect(result.maxDamage).toBeGreaterThan(0);
    expect(result.koText.length).toBeGreaterThan(0);
    expect(result.koText).not.toContain("damage.length");
  });
});
