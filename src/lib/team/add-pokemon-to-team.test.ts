import { beforeEach, describe, expect, it, vi } from "vitest";

import { fetchPokemonDetailFromApi } from "@/lib/pokemon/data-access";
import { useTeamStore } from "@/store/team-store";
import { addPokemonSlugToTeam, findFirstEmptyTeamSlot } from "@/lib/team/add-pokemon-to-team";

vi.mock("@/lib/pokemon/data-access", () => ({
  fetchPokemonDetailFromApi: vi.fn(),
}));

describe("addPokemonSlugToTeam", () => {
  beforeEach(() => {
    useTeamStore.getState().clearTeam();
    vi.mocked(fetchPokemonDetailFromApi).mockReset();
  });

  it("returns team-full when every slot is occupied", async () => {
    const store = useTeamStore.getState();
    for (let slot = 1; slot <= 6; slot += 1) {
      store.addPokemon(slot, {
        id: slot,
        name: `Mon ${slot}`,
        slug: `mon-${slot}`,
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
        isFullyEvolved: true,
        abilities: [],
        moves: [],
        roles: [],
      });
    }

    const result = await addPokemonSlugToTeam("pikachu");

    expect(result).toEqual({
      ok: false,
      reason: "team-full",
      message: "Your team is full. Open Builder to replace a Pokémon in a slot.",
    });
  });

  it("adds to the first empty slot when detail fetch succeeds", async () => {
    vi.mocked(fetchPokemonDetailFromApi).mockResolvedValue({
      id: 25,
      name: "Pikachu",
      slug: "pikachu",
      generation: 1,
      region: "Kanto",
      primaryType: "electric",
      stats: {
        hp: 35,
        attack: 55,
        defense: 40,
        specialAttack: 50,
        specialDefense: 50,
        speed: 90,
        total: 320,
      },
      spriteNormal: "",
      isLegendaryOrMythical: false,
      isFullyEvolved: false,
      abilities: [],
      moves: [],
      roles: [],
    });

    const result = await addPokemonSlugToTeam("pikachu");

    expect(result).toMatchObject({ ok: true, slot: 1, pokemonName: "Pikachu" });
    expect(findFirstEmptyTeamSlot()).toBe(2);
    expect(useTeamStore.getState().team.pokemon[0]?.pokemon?.slug).toBe("pikachu");
  });
});
