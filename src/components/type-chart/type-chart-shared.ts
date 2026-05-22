import type { TypeMatchupMultiplier } from "@/lib/calculations/type-matchup-matrix";
import type { PokemonType } from "@/types/shared";

/** Matrix + legend chip styles for a single-type matchup multiplier. */
export function getTypeMatchupCellClassName(multiplier: TypeMatchupMultiplier): string {
  switch (multiplier) {
    case 2:
      return "bg-emerald-600/90 font-semibold text-white";
    case 0.5:
      return "bg-rose-900/85 font-semibold text-rose-50";
    case 0:
      return "bg-zinc-950 font-semibold text-zinc-100";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export const TYPE_MATCHUP_LEGEND_CHIP_CLASS =
  "inline-flex min-w-[1.5rem] justify-center rounded px-1.5 py-0.5 tabular-nums text-xs";

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
