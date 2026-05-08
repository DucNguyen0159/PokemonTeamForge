import type { BattleFormat } from "./shared";

export interface ChecklistMatch {
  pokemonId: number;
  pokemonName: string;
  reason: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  isCompleted: boolean;
  matchedPokemon: ChecklistMatch[];
}

export interface ChecklistSection {
  id: string;
  title: string;
  items: ChecklistItem[];
}

export interface TeamChecklistResult {
  format: BattleFormat;
  sections: ChecklistSection[];
  completionPercentage: number;
}
