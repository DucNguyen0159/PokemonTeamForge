import type { PokemonType } from "./shared";

export interface DefensivePokemonMatch {
  pokemonId: number;
  pokemonName: string;
  multiplier: number;
}

export interface DefensiveCoverageEntry {
  type: PokemonType;
  weakCount: number;
  resistCount: number;
  immuneCount: number;
  neutralCount: number;
  affectedPokemon: DefensivePokemonMatch[];
}

export interface DefensiveCoverageSummary {
  majorWeaknesses: PokemonType[];
  strongResistances: PokemonType[];
  immunityTypes: PokemonType[];
}

export interface DefensiveCoverageResult {
  entries: DefensiveCoverageEntry[];
  summary: DefensiveCoverageSummary;
}

export interface OffensiveMoveMatch {
  pokemonId: number;
  pokemonName: string;
  moveId: number;
  moveName: string;
  moveType: PokemonType;
}

export interface OffensiveCoverageEntry {
  targetType: PokemonType;
  superEffectiveMoveTypes: PokemonType[];
  hasCoverage: boolean;
  matchingMoves: OffensiveMoveMatch[];
}

export interface OffensiveCoverageSummary {
  coveredTypes: PokemonType[];
  missingTypes: PokemonType[];
}

export interface OffensiveCoverageResult {
  entries: OffensiveCoverageEntry[];
  summary: OffensiveCoverageSummary;
}

export interface TypeDefenseEntry {
  type: PokemonType;
  multiplier: number;
}
