"use client";

import { getAllChampionsPresetSpeciesSlugs } from "@/data/champions-preset-display";
import { usePokemonSummaries } from "@/hooks/queries/use-pokemon-catalog";

export function ChampionsCatalogWarmup() {
  usePokemonSummaries(getAllChampionsPresetSpeciesSlugs());
  return null;
}
