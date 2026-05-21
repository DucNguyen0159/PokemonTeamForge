import { describe, expect, it } from "vitest";

import {
  formatPokedexDisplayNumber,
  getPokemonListNameMeta,
} from "@/lib/pokemon/pokemon-list-display";
import type { PokemonListItem } from "@/types/pokemon";

function listItem(overrides: Partial<PokemonListItem>): PokemonListItem {
  return {
    id: 3,
    name: "Venusaur",
    slug: "venusaur",
    generation: 1,
    region: "kanto",
    primaryType: "grass",
    secondaryType: "poison",
    hp: 80,
    attack: 82,
    defense: 83,
    specialAttack: 100,
    specialDefense: 100,
    speed: 80,
    total: 525,
    spriteNormal: "",
    isLegendaryOrMythical: false,
    isFullyEvolved: true,
    formKind: "default",
    pokedexDisplayNo: 3,
    listSortRank: 30,
    ...overrides,
  };
}

describe("formatPokedexDisplayNumber", () => {
  it("pads display numbers to four digits", () => {
    expect(formatPokedexDisplayNumber(3)).toBe("0003");
    expect(formatPokedexDisplayNumber(80)).toBe("0080");
  });
});

describe("getPokemonListNameMeta", () => {
  it("shows a pill for mega forms", () => {
    expect(
      getPokemonListNameMeta(
        listItem({ slug: "venusaur-mega", name: "Mega Venusaur", formKind: "mega" }),
      ),
    ).toEqual({ showPill: true });
  });

  it("does not show a pill for other or default forms", () => {
    expect(getPokemonListNameMeta(listItem({ formKind: "other" }))).toEqual({ showPill: false });
    expect(getPokemonListNameMeta(listItem({ formKind: "default" }))).toEqual({ showPill: false });
  });
});
