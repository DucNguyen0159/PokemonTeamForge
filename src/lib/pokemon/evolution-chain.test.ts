import { describe, expect, it } from "vitest";

import {
  buildEvolutionRootsFromPokeApiChain,
  countEvolutionStages,
  findStageBySlug,
  getDisplayEvolutionChain,
  parseEvolutionChainId,
  parseStoredEvolutionChain,
} from "@/lib/pokemon/evolution-chain";
import type { EvolutionStage } from "@/types/pokemon";

const BULBASAUR_CHAIN: EvolutionStage[] = [
  {
    speciesSlug: "bulbasaur",
    pokemonId: 1,
    name: "Bulbasaur",
    slug: "bulbasaur",
    spriteNormal: "/sprites/bulbasaur.png",
    primaryType: "grass",
    secondaryType: "poison",
    evolvesTo: [
      {
        speciesSlug: "ivysaur",
        pokemonId: 2,
        name: "Ivysaur",
        slug: "ivysaur",
        spriteNormal: "/sprites/ivysaur.png",
        primaryType: "grass",
        secondaryType: "poison",
        evolvesTo: [
          {
            speciesSlug: "venusaur",
            pokemonId: 3,
            name: "Venusaur",
            slug: "venusaur",
            spriteNormal: "/sprites/venusaur.png",
            primaryType: "grass",
            secondaryType: "poison",
            evolvesTo: [],
          },
        ],
      },
    ],
  },
];

const EEVEE_POKEAPI_ROOT = {
  species: { name: "eevee" },
  evolves_to: [
    { species: { name: "vaporeon" }, evolves_to: [] },
    { species: { name: "jolteon" }, evolves_to: [] },
    { species: { name: "flareon" }, evolves_to: [] },
  ],
};

describe("parseEvolutionChainId", () => {
  it("extracts chain id from PokeAPI url", () => {
    expect(parseEvolutionChainId("https://pokeapi.co/api/v2/evolution-chain/67/")).toBe(67);
    expect(parseEvolutionChainId(null)).toBeNull();
  });
});

describe("parseStoredEvolutionChain", () => {
  it("returns valid stored roots", () => {
    expect(parseStoredEvolutionChain(BULBASAUR_CHAIN)).toHaveLength(1);
    expect(parseStoredEvolutionChain({ invalid: true })).toEqual([]);
  });
});

describe("findStageBySlug", () => {
  it("finds nested stages by slug or species slug", () => {
    expect(findStageBySlug(BULBASAUR_CHAIN, "ivysaur")?.name).toBe("Ivysaur");
    expect(findStageBySlug(BULBASAUR_CHAIN, "missing")).toBeNull();
  });
});

describe("getDisplayEvolutionChain", () => {
  it("returns stored roots unchanged", () => {
    expect(getDisplayEvolutionChain(BULBASAUR_CHAIN)).toEqual(BULBASAUR_CHAIN);
  });
});

describe("countEvolutionStages", () => {
  it("counts all nodes in a tree", () => {
    expect(countEvolutionStages(BULBASAUR_CHAIN)).toBe(3);
  });
});

describe("buildEvolutionRootsFromPokeApiChain", () => {
  it("builds branching roots with resolved metadata", () => {
    const metaBySpecies = new Map([
      [
        "eevee",
        {
          pokemonId: 133,
          name: "Eevee",
          slug: "eevee",
          spriteNormal: "/eevee.png",
          primaryType: "normal" as const,
          secondaryType: null,
        },
      ],
      [
        "vaporeon",
        {
          pokemonId: 134,
          name: "Vaporeon",
          slug: "vaporeon",
          spriteNormal: "/vaporeon.png",
          primaryType: "water" as const,
          secondaryType: null,
        },
      ],
    ]);

    const roots = buildEvolutionRootsFromPokeApiChain(EEVEE_POKEAPI_ROOT, (slug) => metaBySpecies.get(slug) ?? null);

    expect(roots).toHaveLength(1);
    expect(roots[0]?.slug).toBe("eevee");
    expect(roots[0]?.evolvesTo).toHaveLength(3);
    expect(countEvolutionStages(roots)).toBe(4);
  });
});
