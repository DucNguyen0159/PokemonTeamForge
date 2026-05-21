import { describe, expect, it, vi } from "vitest";
import {
  buildPokemonListSearchParams,
  fetchPokemonListFromApi,
} from "@/lib/pokemon/data-access";

describe("pokemon data access", () => {
  it("builds consistent list query params", () => {
    const params = buildPokemonListSearchParams({
      search: "  char  ",
      generation: 9,
      page: 2,
      limit: 60,
      type: "fire",
      ability: "drought",
      sortBy: "total",
      sortDirection: "desc",
    });

    expect(params.get("search")).toBe("char");
    expect(params.get("generation")).toBe("9");
    expect(params.get("type")).toBe("fire");
    expect(params.get("ability")).toBe("drought");
    expect(params.get("page")).toBe("2");
    expect(params.get("limit")).toBe("60");
    expect(params.get("sortBy")).toBe("total");
    expect(params.get("sortDirection")).toBe("desc");
  });

  it("passes hideAlternateForms when enabled", () => {
    const params = buildPokemonListSearchParams({ hideAlternateForms: true });
    expect(params.get("hideAlternateForms")).toBe("true");
  });

  it("returns API list payload without mock-size limits", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          pokemon: Array.from({ length: 25 }, (_, index) => ({
            id: index + 1,
            name: `mon-${index + 1}`,
            slug: `mon-${index + 1}`,
            generation: 1,
            region: "kanto",
            primaryType: "normal",
            secondaryType: null,
            hp: 50,
            attack: 50,
            defense: 50,
            specialAttack: 50,
            specialDefense: 50,
            speed: 50,
            total: 300,
            spriteNormal: "/sprite.png",
            isLegendaryOrMythical: false,
            isFullyEvolved: true,
            formKind: "default",
            pokedexDisplayNo: index + 1,
            listSortRank: (index + 1) * 10,
          })),
          total: 1025,
          page: 1,
          limit: 60,
        },
      }),
    });

    vi.stubGlobal("fetch", fetchMock);
    const payload = await fetchPokemonListFromApi({ search: "a", limit: 60, page: 1 });

    expect(payload.pokemon.length).toBe(25);
    expect(payload.limit).toBe(60);
    expect(payload.total).toBe(1025);
  });
});
