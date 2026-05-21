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
      pokedexReturnStored: false,
    });
  });

  it("returns a filtered Pokédex back link when arriving from a Pokédex ability filter", () => {
    expect(
      pokemonDetailNavigation({
        from: "pokedex",
        pokedexReturn: { ability: "swift-swim" },
      }),
    ).toEqual({
      primaryHref: "/pokedex?ability=swift-swim",
      primaryLabel: "Back to Filtered Pokédex",
      secondaryHref: "/abilities?ability=swift-swim",
      secondaryLabel: "View Ability Detail",
      pokedexReturnStored: false,
    });
  });

  it("reconstructs full Pokédex explorer state on back navigation", () => {
    expect(
      pokemonDetailNavigation({
        from: "pokedex",
        pokedexReturn: {
          view: "table",
          q: "eevee",
          sortBy: "total",
          sortDirection: "desc",
          generation: 1,
          type: "normal",
        },
      }),
    ).toEqual({
      primaryHref: "/pokedex?view=table&q=eevee&sort=total&dir=desc&gen=1&type=normal",
      primaryLabel: "Back to Filtered Pokédex",
      secondaryHref: "/abilities",
      secondaryLabel: "Open Abilities",
      pokedexReturnStored: false,
    });
  });

  it("uses session-storage fallback marker for stored Pokédex returns", () => {
    expect(
      pokemonDetailNavigation({
        from: "pokedex",
        pokedexReturnStored: true,
        pokedexReturn: { q: "long-search" },
      }),
    ).toMatchObject({
      primaryHref: "/pokedex",
      primaryLabel: "Back to Filtered Pokédex",
      pokedexReturnStored: true,
    });
  });

  it("returns builder navigation placeholder for phase 5", () => {
    expect(pokemonDetailNavigation({ from: "builder" })).toEqual({
      primaryHref: "/builder",
      primaryLabel: "Back to Builder",
      secondaryHref: "/pokedex",
      secondaryLabel: "Open Pokédex",
      pokedexReturnStored: false,
    });
  });

  it("falls back safely for direct or unsafe query values", () => {
    expect(pokemonDetailNavigation({})).toMatchObject({
      primaryHref: "/pokedex",
      primaryLabel: "Back to Pokédex",
      secondaryHref: "/abilities",
      pokedexReturnStored: false,
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
      pokedexReturnStored: false,
    });
  });
});
