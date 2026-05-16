import { ALL_POKEMON_TYPES } from "@/data/type-chart";
import type {
  OffensiveCoverageEntry,
  OffensiveCoverageResult,
} from "@/types/coverage";
import type { Team } from "@/types/team";

import { getSelectedMovesWithOwners } from "./shared/team-helpers";
import { isSuperEffectiveAgainst } from "./shared/type-effectiveness";

export function calculateOffensiveCoverage(team: Team): OffensiveCoverageResult {
  const selectedMoves = getSelectedMovesWithOwners(team).filter(
    ({ move }) => move.category !== "status",
  );

  const entries: OffensiveCoverageEntry[] = ALL_POKEMON_TYPES.map((targetType) => {
    const matchingMoves = selectedMoves
      .filter(({ move }) => isSuperEffectiveAgainst(move.type, targetType))
      .map(({ pokemonId, pokemonName, move }) => ({
        pokemonId,
        pokemonName,
        moveId: move.id,
        moveName: move.name,
        moveType: move.type,
      }));

    const superEffectiveMoveTypes = Array.from(
      new Set(matchingMoves.map((match) => match.moveType)),
    );

    return {
      targetType,
      superEffectiveMoveTypes,
      coverageCount: matchingMoves.length,
      hasCoverage: matchingMoves.length > 0,
      matchingMoves,
    };
  });

  const summary = {
    coveredTypes: entries.filter((entry) => entry.hasCoverage).map((entry) => entry.targetType),
    missingTypes: entries.filter((entry) => !entry.hasCoverage).map((entry) => entry.targetType),
  };

  return {
    entries,
    summary,
  };
}
