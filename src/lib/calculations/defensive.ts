import { ALL_POKEMON_TYPES } from "@/data/type-chart";
import type {
  DefensiveCoverageEntry,
  DefensiveCoverageResult,
} from "@/types/coverage";
import type { Team } from "@/types/team";

import { getActiveTeamSlots, getPokemonTypes } from "./shared/team-helpers";
import { calculateTypeEffectiveness } from "./shared/type-effectiveness";

export function calculateDefensiveCoverage(team: Team): DefensiveCoverageResult {
  const activeSlots = getActiveTeamSlots(team);
  const weaknessThreshold = Math.max(2, Math.ceil(activeSlots.length / 2));

  const entries: DefensiveCoverageEntry[] = ALL_POKEMON_TYPES.map((attackingType) => {
    const affectedPokemon = activeSlots.map((slot) => ({
      pokemonId: slot.pokemon.id,
      pokemonName: slot.pokemon.name,
      multiplier: calculateTypeEffectiveness(attackingType, getPokemonTypes(slot)),
    }));

    const weakCount = affectedPokemon.filter((entry) => entry.multiplier > 1).length;
    const resistCount = affectedPokemon.filter(
      (entry) => entry.multiplier > 0 && entry.multiplier < 1,
    ).length;
    const immuneCount = affectedPokemon.filter((entry) => entry.multiplier === 0).length;
    const neutralCount = affectedPokemon.filter((entry) => entry.multiplier === 1).length;

    return {
      type: attackingType,
      weakCount,
      resistCount,
      immuneCount,
      neutralCount,
      affectedPokemon,
    };
  });

  const summary = {
    majorWeaknesses: entries
      .filter((entry) => entry.weakCount >= weaknessThreshold)
      .map((entry) => entry.type),
    strongResistances: entries
      .filter((entry) => entry.resistCount + entry.immuneCount >= weaknessThreshold)
      .map((entry) => entry.type),
    immunityTypes: entries
      .filter((entry) => entry.immuneCount > 0)
      .map((entry) => entry.type),
  };

  return {
    entries,
    summary,
  };
}
