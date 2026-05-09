import "server-only";

import { MOCK_ITEMS } from "@/data/mock-items";
import {
  STRATEGY_TEAM_PRESETS,
  type StrategyTeamPreset,
} from "@/data/strategy-teams";
import { getPokemonByName } from "@/lib/services/pokemon-service";
import {
  hydrateStrategyPresetWithResolvers,
  type StrategyResolvers,
} from "@/lib/services/strategy-hydrator";
import type { DifficultyLevel } from "@/types/shared";
import type { StrategyTeam, StrategyType } from "@/types/strategy";

export interface StrategyQuery {
  strategyType?: StrategyType;
  format?: StrategyTeam["format"];
  difficulty?: DifficultyLevel;
}

const defaultResolvers: StrategyResolvers = {
  resolvePokemon: getPokemonByName,
  resolveItem: (name) => MOCK_ITEMS.find((entry) => entry.name === name) ?? null,
};

export async function hydrateStrategyPreset(
  preset: StrategyTeamPreset,
): Promise<StrategyTeam> {
  return hydrateStrategyPresetWithResolvers(preset, defaultResolvers);
}

export async function getStrategyTeams(query: StrategyQuery = {}): Promise<StrategyTeam[]> {
  const filteredPresets = STRATEGY_TEAM_PRESETS.filter((strategy) => {
    if (query.strategyType && strategy.strategyType !== query.strategyType) {
      return false;
    }

    if (query.format && strategy.format !== query.format) {
      return false;
    }

    if (query.difficulty && strategy.difficulty !== query.difficulty) {
      return false;
    }

    return true;
  });

  const hydrated = await Promise.all(filteredPresets.map((preset) => hydrateStrategyPreset(preset)));
  return hydrated;
}

