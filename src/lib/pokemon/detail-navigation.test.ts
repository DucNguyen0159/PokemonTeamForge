import { describe, expect, it } from "vitest";

import { pokemonDetailNavigation } from "@/lib/pokemon/detail-navigation";

describe("pokemonDetailNavigation", () => {
  it("returns an abilities back link when arriving from the ability browser", () => {
    expect(
      pokemonDetailNavigation({
        from: "abilities",
        ability: "adaptability",
        abilityName: "Adaptability",
      }),
    ).toEqual({
      primaryHref: "/abilities?ability=adaptability",
      primaryLabel: "Back to Adaptability",
      secondaryHref: "/pokedex",
      secondaryLabel: "Open Pokédex",
    });
  });

  it("returns a filtered Pokédex back link when arriving from a Pokédex ability filter", () => {
    expect(pokemonDetailNavigation({ from: "pokedex", ability: "swift-swim" })).toEqual({
      primaryHref: "/pokedex?ability=swift-swim",
      primaryLabel: "Back to Filtered Pokédex",
      secondaryHref: "/abilities?ability=swift-swim",
      secondaryLabel: "View Ability Detail",
    });
  });

  it("falls back safely for direct or unsafe query values", () => {
    expect(pokemonDetailNavigation({})).toMatchObject({
      primaryHref: "/pokedex",
      primaryLabel: "Back to Pokédex",
      secondaryHref: "/abilities",
    });
    expect(
      pokemonDetailNavigation({
        from: "https://example.com",
        ability: "../bad",
      }),
    ).toMatchObject({
      primaryHref: "/pokedex",
      primaryLabel: "Back to Pokédex",
      secondaryHref: "/abilities",
    });
  });
});
