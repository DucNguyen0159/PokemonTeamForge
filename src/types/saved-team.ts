import type { BattleFormat } from "./shared";

export interface SavedTeamPokemonPreview {
  id: number;
  name: string;
  slug: string;
  spriteNormal: string | null;
  slot: number;
}

export interface SavedTeamSummary {
  id: string;
  name: string;
  format: BattleFormat;
  mode: "standard" | "champions";
  formatSupport?: "single" | "double" | "both" | null;
  rulesetId?: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  filledSlotCount: number;
  pokemonPreviews: SavedTeamPokemonPreview[];
}
