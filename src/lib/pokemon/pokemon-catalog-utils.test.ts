import { describe, expect, it } from "vitest";

import {
  buildSummariesBySlugMap,
  mapSummariesBySlot,
  summaryFromListItem,
} from "@/lib/pokemon/pokemon-catalog-utils";
import { normalizeSummarySlugBatch, pokemonKeys } from "@/lib/pokemon/query-keys";
import type { PokemonSummary } from "@/types/pokemon";

describe("pokemon catalog utils", () => {
  it("builds a slug lookup map from summaries", () => {
    const summaries: PokemonSummary[] = [
      {
        id: 25,
        name: "Pikachu",
        slug: "pikachu",
        primaryType: "electric",
        secondaryType: null,
        spriteNormal: "/pikachu.png",
      },
      {
        id: 6,
        name: "Charizard",
        slug: "charizard",
        primaryType: "fire",
        secondaryType: "flying",
        spriteNormal: "/charizard.png",
      },
    ];

    expect(buildSummariesBySlugMap(summaries)).toEqual({
      pikachu: summaries[0],
      charizard: summaries[1],
    });
  });

  it("maps summaries onto roster slots by resolved species name", () => {
    const summariesBySlug = buildSummariesBySlugMap([
      {
        id: 778,
        name: "Mimikyu",
        slug: "mimikyu-disguised",
        primaryType: "ghost",
        secondaryType: "fairy",
        spriteNormal: "/mimikyu.png",
      },
    ]);

    const bySlot = mapSummariesBySlot(
      [
        { slot: 1, pokemonName: "Mimikyu" },
        { slot: 2, pokemonName: "" },
      ],
      summariesBySlug,
      (name) => (name.toLowerCase() === "mimikyu" ? "mimikyu-disguised" : name),
    );

    expect(bySlot[1]?.slug).toBe("mimikyu-disguised");
    expect(bySlot[2]).toBeUndefined();
  });

  it("projects list items into summaries", () => {
    expect(
      summaryFromListItem({
        id: 1,
        name: "Bulbasaur",
        slug: "bulbasaur",
        generation: 1,
        region: "kanto",
        primaryType: "grass",
        secondaryType: "poison",
        hp: 45,
        attack: 49,
        defense: 49,
        specialAttack: 65,
        specialDefense: 65,
        speed: 45,
        total: 318,
        spriteNormal: "/bulbasaur.png",
        isLegendaryOrMythical: false,
        isFullyEvolved: false,
        formKind: "default",
        pokedexDisplayNo: 1,
        listSortRank: 10,
      }),
    ).toEqual({
      id: 1,
      name: "Bulbasaur",
      slug: "bulbasaur",
      primaryType: "grass",
      secondaryType: "poison",
      spriteNormal: "/bulbasaur.png",
    });
  });
});

describe("pokemon query keys", () => {
  it("dedupes and sorts slug batches for stable cache keys", () => {
    expect(normalizeSummarySlugBatch(["zapdos", "moltres", "zapdos", "  Moltres  "])).toEqual([
      "moltres",
      "zapdos",
    ]);
  });

  it("resolves alias slugs in summary keys", () => {
    expect(pokemonKeys.summary("mimikyu")).toEqual(["pokemon", "summary", "mimikyu-disguised"]);
    expect(pokemonKeys.summary("indeedee")).toEqual(["pokemon", "summary", "indeedee-female"]);
  });

  it("builds deterministic batch keys regardless of input order", () => {
    expect(pokemonKeys.summariesBatch(["b", "a", "b"])).toEqual(
      pokemonKeys.summariesBatch(["a", "b"]),
    );
  });
});
