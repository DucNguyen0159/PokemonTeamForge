import { describe, expect, it } from "vitest";

import {
  SUPPLEMENT_MEGA_STONE_MAPPINGS,
  isMegaStoneCompatibleWithSpecies,
  isMegaStoneItem,
  resolveMegaPokemonSlug,
  resolveMegaPokemonSlugForShowdown,
} from "@/data/champions-mega-stones";

describe("champions-mega-stones", () => {
  it("recognizes curated mega stones and rejects false positives", () => {
    expect(isMegaStoneItem("Raichunite X")).toBe(true);
    expect(isMegaStoneItem("Staraptite")).toBe(true);
    expect(isMegaStoneItem("Eviolite")).toBe(false);
    expect(isMegaStoneItem("Meteorite")).toBe(false);
  });

  it("resolves species-specific X/Y mega forms", () => {
    expect(isMegaStoneCompatibleWithSpecies("Raichu", "Raichunite X")).toBe(true);
    expect(isMegaStoneCompatibleWithSpecies("Raichu", "Raichunite Y")).toBe(true);
    expect(isMegaStoneCompatibleWithSpecies("Pikachu", "Raichunite X")).toBe(false);
    expect(resolveMegaPokemonSlug("Raichu", "raichunite-x")).toBe("raichu-mega-x");
    expect(resolveMegaPokemonSlugForShowdown("Raichu", "Raichunite Y")).toBe("Raichu-Mega-Y");
  });

  it("maps Staraptite naming (not Staraptorite)", () => {
    expect(isMegaStoneCompatibleWithSpecies("Staraptor", "Staraptite")).toBe(true);
    expect(resolveMegaPokemonSlug("Staraptor", "staraptite")).toBe("staraptor-mega");
  });

  it("lists supplement stones without pokeapi catalog flag", () => {
    expect(SUPPLEMENT_MEGA_STONE_MAPPINGS.some((entry) => entry.itemSlug === "eelektrossite")).toBe(true);
    expect(SUPPLEMENT_MEGA_STONE_MAPPINGS.every((entry) => !entry.inPokeApiCatalog)).toBe(true);
  });
});
