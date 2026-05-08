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
    let weakCount = 0;
    let resistCount = 0;
    let immuneCount = 0;
    let neutralCount = 0;

    const affectedPokemon = activeSlots.map((slot) => {
      const multiplier = calculateTypeEffectiveness(attackingType, getPokemonTypes(slot));

      if (multiplier > 1) {
        weakCount += 1;
      } else if (multiplier === 0) {
        immuneCount += 1;
      } else if (multiplier < 1) {
        resistCount += 1;
      } else {
        neutralCount += 1;
      }

      return {
        pokemonId: slot.pokemon.id,
        pokemonName: slot.pokemon.name,
        multiplier,
      };
    });

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
