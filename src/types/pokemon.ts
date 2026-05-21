import type { Ability } from "./ability";
import type { TypeDefenseEntry } from "./coverage";
import type { Move } from "./move";
import type { AlternateForm, AlternateFormsByKind, PokemonFormKind } from "@/lib/pokemon/pokemon-forms";
import type { PokemonType, TeamRole } from "./shared";

export type { AlternateForm, AlternateFormsByKind, PokemonFormKind };

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
  formKind: PokemonFormKind;
  baseSlug?: string | null;
  pokedexDisplayNo: number;
  listSortRank: number;
}

export interface EvolutionStage {
  speciesSlug: string;
  pokemonId: number;
  name: string;
  slug: string;
  spriteNormal: string;
  primaryType: PokemonType;
  secondaryType?: PokemonType | null;
  evolvesTo?: EvolutionStage[];
}

export interface PokemonDetail extends Pokemon {
  formKind?: PokemonFormKind;
  baseSlug?: string | null;
  pokedexDisplayNo?: number;
  evolutionChain?: EvolutionStage[];
  typeDefense?: TypeDefenseEntry[];
  alternateForms?: AlternateForm[];
  alternateFormsByKind?: AlternateFormsByKind;
}
