import type { PokemonType } from "@/types/shared";

export const TYPE_CHART_ABBREVIATIONS: Record<PokemonType, string> = {
  normal: "NOR",
  fire: "FIR",
  water: "WAT",
  electric: "ELE",
  grass: "GRA",
  ice: "ICE",
  fighting: "FIG",
  poison: "POI",
  ground: "GRO",
  flying: "FLY",
  psychic: "PSY",
  bug: "BUG",
  rock: "ROC",
  ghost: "GHO",
  dragon: "DRA",
  dark: "DAR",
  steel: "STE",
  fairy: "FAI",
};

export function formatTypeLabel(type: PokemonType): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function formatMatchupMultiplier(multiplier: 0 | 0.5 | 1 | 2): string {
  if (multiplier === 0.5) {
    return "½";
  }

  if (multiplier === 1) {
    return "1";
  }

  return String(multiplier);
}
