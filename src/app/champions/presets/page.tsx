"use client";

import { ChampionsCatalogWarmup } from "@/components/champions/champions-catalog-warmup";
import { ChampionsPresetExplorer } from "@/components/champions/champions-preset-explorer";

export default function ChampionsPresetsPage() {
  return (
    <>
      <ChampionsCatalogWarmup />
      <ChampionsPresetExplorer />
    </>
  );
}
