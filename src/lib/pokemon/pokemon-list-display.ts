import type { PokemonListItem } from "@/types/pokemon";

export function formatPokedexDisplayNumber(displayNo: number): string {
  return String(displayNo).padStart(4, "0");
}

export function getPokemonListNameMeta(pokemon: PokemonListItem): {
  showPill: boolean;
} {
  if (pokemon.formKind === "default" || pokemon.formKind === "other") {
    return { showPill: false };
  }

  return { showPill: true };
}
