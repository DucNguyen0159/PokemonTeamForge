import { describe, expect, it } from "vitest";

import { getDefaultAbility } from "@/lib/team/default-ability";
import type { Ability } from "@/types/ability";
import type { Pokemon } from "@/types/pokemon";

function ability(id: number, name: string, isHidden = false): Ability {
  return {
    id,
    name,
    slug: name.toLowerCase().replace(/\s+/g, "-"),
    description: `${name} effect`,
    isHidden,
  };
}

function pokemonWithAbilities(abilities: Ability[]): Pokemon {
  return {
    id: 1,
    name: "Test",
    slug: "test",
    generation: 1,
    region: "Kanto",
    primaryType: "normal",
    stats: {
      hp: 50,
      attack: 50,
      defense: 50,
      specialAttack: 50,
      specialDefense: 50,
      speed: 50,
      total: 300,
    },
    spriteNormal: "",
    isLegendaryOrMythical: false,
    isFullyEvolved: false,
    abilities,
    moves: [],
    roles: [],
  };
}

describe("getDefaultAbility", () => {
  it("returns null when there are no abilities", () => {
    expect(getDefaultAbility(pokemonWithAbilities([]))).toBeNull();
  });

  it("returns the only ability when there is one", () => {
    const only = ability(1, "Blaze");
    expect(getDefaultAbility(pokemonWithAbilities([only]))).toBe(only);
  });

  it("prefers the first non-hidden ability when multiple exist", () => {
    const overgrow = ability(1, "Overgrow");
    const chlorophyll = ability(2, "Chlorophyll", true);
    expect(getDefaultAbility(pokemonWithAbilities([overgrow, chlorophyll]))).toBe(overgrow);
  });

  it("falls back to the first ability when all are hidden", () => {
    const first = ability(1, "Pressure", true);
    const second = ability(2, "Unnerve", true);
    expect(getDefaultAbility(pokemonWithAbilities([first, second]))).toBe(first);
  });
});
