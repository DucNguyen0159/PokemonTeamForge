import type { Ability } from "./ability";
import type { Item } from "./item";
import type { Move } from "./move";
import type { Pokemon } from "./pokemon";
import type { BattleFormat } from "./shared";

export interface SelectedMove {
  slot: 1 | 2 | 3 | 4;
  move: Move | null;
}

export interface TeamPokemon {
  slot: number;
  pokemon: Pokemon | null;
  selectedAbility?: Ability | null;
  selectedItem?: Item | null;
  moves: SelectedMove[];
  isShiny?: boolean;
}

export interface EmptyTeamSlot {
  slot: number;
  pokemon: null;
  selectedAbility: null;
  selectedItem: null;
  moves: SelectedMove[];
  isShiny: false;
}

export interface Team {
  id?: string;
  userId?: string | null;
  name: string;
  format: BattleFormat;
  pokemon: TeamPokemon[];
  isPublic?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
