import { fetchPokemonDetailFromApi } from "@/lib/pokemon/data-access";
import { useTeamStore } from "@/store/team-store";
import type { Pokemon } from "@/types/pokemon";

export type AddPokemonToTeamResult =
  | { ok: true; slot: number; pokemonName: string }
  | { ok: false; reason: "team-full" | "fetch-failed"; message: string };

export function findFirstEmptyTeamSlot(): number | null {
  return useTeamStore.getState().team.pokemon.find((entry) => !entry.pokemon)?.slot ?? null;
}

export async function addPokemonSlugToTeam(
  slug: string,
  addPokemon: (slot: number, pokemon: Pokemon) => void = useTeamStore.getState().addPokemon,
): Promise<AddPokemonToTeamResult> {
  const slot = findFirstEmptyTeamSlot();

  if (!slot) {
    return {
      ok: false,
      reason: "team-full",
      message: "Your team is full. Open Builder to replace a Pokémon in a slot.",
    };
  }

  try {
    const detail = await fetchPokemonDetailFromApi(slug);
    addPokemon(slot, detail);
    return { ok: true, slot, pokemonName: detail.name };
  } catch (error) {
    return {
      ok: false,
      reason: "fetch-failed",
      message: error instanceof Error ? error.message : "Could not add Pokémon.",
    };
  }
}
