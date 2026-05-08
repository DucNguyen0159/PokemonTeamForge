import type { Ability } from "./ability";
import type { Item } from "./item";
import type { Move } from "./move";
import type { Pokemon } from "./pokemon";
import type { BattleFormat, DifficultyLevel, TeamRole } from "./shared";

export type StrategyType =
  | "rain"
  | "sun"
  | "sand"
  | "snow"
  | "trick_room"
  | "tailwind"
  | "monotype"
  | "stall"
  | "balance"
  | "hyper_offense"
  | "bulky_offense"
  | "intimidate_core"
  | "trap";

export interface StrategyTeamPokemon {
  slot: number;
  pokemon: Pokemon;
  ability: Ability;
  item: Item;
  moves: Move[];
  role: TeamRole;
  explanation: string;
}

export interface StrategyTeam {
  id: string;
  name: string;
  slug: string;
  strategyType: StrategyType;
  format: BattleFormat;
  difficulty: DifficultyLevel;
  tags: string[];
  shortDescription: string;
  pokemon: StrategyTeamPokemon[];
  createdAt?: string;
  updatedAt?: string;
}

export interface StrategyFilters {
  strategyType: StrategyType | "all";
  format: BattleFormat | "all";
  difficulty: DifficultyLevel | "all";
}
