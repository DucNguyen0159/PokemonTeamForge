import type { Ability } from "./ability";
import type { TypeDefenseEntry } from "./coverage";
import type { Move } from "./move";
import type { PokemonType, TeamRole } from "./shared";

export interface PokemonBaseStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
  total: number;
}

export interface Pokemon {
  id: number;
  name: string;
  slug: string;
  generation: number;
  region: string;
  primaryType: PokemonType;
  secondaryType?: PokemonType | null;
  stats: PokemonBaseStats;
  spriteNormal: string;
  spriteShiny?: string | null;
  isLegendaryOrMythical: boolean;
  isFullyEvolved: boolean;
  abilities: Ability[];
  moves: Move[];
  roles: TeamRole[];
}

export interface PokemonListItem {
  id: number;
  name: string;
  slug: string;
  generation: number;
  region: string;
  primaryType: PokemonType;
  secondaryType?: PokemonType | null;
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
  total: number;
  spriteNormal: string;
  isLegendaryOrMythical: boolean;
  isFullyEvolved: boolean;
}

export interface EvolutionStage {
  pokemonId: number;
  name: string;
  slug: string;
  spriteNormal: string;
  evolvesTo?: EvolutionStage[];
}

export interface PokemonDetail extends Pokemon {
  evolutionChain?: EvolutionStage[];
  typeDefense?: TypeDefenseEntry[];
}
