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

const STRATEGY_CACHE_TTL_MS = 1000 * 60 * 5;
let hydratedStrategiesCache: { expiresAt: number; data: StrategyTeam[] } | null = null;

function normalizeLookupToken(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const defaultResolvers: StrategyResolvers = {
  resolvePokemon: getPokemonByName,
  resolveItem: (name) => {
    const requested = normalizeLookupToken(name);
    return (
      MOCK_ITEMS.find(
        (entry) =>
          normalizeLookupToken(entry.name) === requested ||
          normalizeLookupToken(entry.slug) === requested,
      ) ?? null
    );
  },
};

export async function hydrateStrategyPreset(
  preset: StrategyTeamPreset,
): Promise<StrategyTeam> {
  return hydrateStrategyPresetWithResolvers(preset, defaultResolvers);
}

export async function getStrategyTeams(query: StrategyQuery = {}): Promise<StrategyTeam[]> {
  const now = Date.now();
  let hydratedAllStrategies: StrategyTeam[];
  if (hydratedStrategiesCache && hydratedStrategiesCache.expiresAt > now) {
    hydratedAllStrategies = hydratedStrategiesCache.data;
  } else {
    const hydratedResults = await Promise.allSettled(
      STRATEGY_TEAM_PRESETS.map((preset) => hydrateStrategyPreset(preset)),
    );

    hydratedAllStrategies = hydratedResults
      .filter((result): result is PromiseFulfilledResult<StrategyTeam> => result.status === "fulfilled")
      .map((result) => result.value);

    hydratedResults
      .filter((result): result is PromiseRejectedResult => result.status === "rejected")
      .forEach((result) => {
        console.error("[Strategy Preset] Failed to hydrate preset:", result.reason);
      });

    hydratedStrategiesCache = {
      expiresAt: now + STRATEGY_CACHE_TTL_MS,
      data: hydratedAllStrategies,
    };
  }

  return hydratedAllStrategies.filter((strategy) => {
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
}

