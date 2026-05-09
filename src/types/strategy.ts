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
  | "hyper_offense"
  | "bulky_offense"
  | "balance"
  | "stall"
  | "semi_stall"
  | "hazard_stack"
  | "screens"
  | "baton_pass"
  | "voltturn"
  | "webs"
  | "terrain"
  | "weatherless_offense"
  | "setup_spam"
  | "perish_trap"
  | "sunroom"
  | "rainroom"
  | "sand_balance"
  | "snow_veil"
  | "toxic_stall"
  | "status_spam"
  | "priority_spam"
  | "beatup_justified"
  | "psyspam"
  | "dozogiri"
  | "monotype";

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
