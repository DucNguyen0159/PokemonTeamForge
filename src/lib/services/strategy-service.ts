import "server-only";

import {
  STRATEGY_TEAM_PRESETS,
  type StrategyTeamPreset,
} from "@/data/strategy-teams";
import { getItemByName } from "@/lib/services/item-service";
import { getPokemonByName, getPokemonListItemsBySlugs } from "@/lib/services/pokemon-service";
import {
  hydrateStrategyPresetWithResolvers,
  type StrategyResolvers,
} from "@/lib/services/strategy-hydrator";
import type { DifficultyLevel } from "@/types/shared";
import type { StrategyTeam, StrategyTeamSummary, StrategyType } from "@/types/strategy";

export interface StrategyQuery {
  strategyType?: StrategyType;
  format?: StrategyTeam["format"];
  difficulty?: DifficultyLevel;
}

const STRATEGY_CACHE_TTL_MS = 1000 * 60 * 5;
const STRATEGY_SUMMARY_CACHE_TTL_MS = 1000 * 60 * 15;
let hydratedStrategiesCache: { expiresAt: number; data: StrategyTeam[] } | null = null;
let strategySummaryCache: { expiresAt: number; data: StrategyTeamSummary[] } | null = null;

const defaultResolvers: StrategyResolvers = {
  resolvePokemon: getPokemonByName,
  resolveItem: getItemByName,
};

export async function hydrateStrategyPreset(
  preset: StrategyTeamPreset,
): Promise<StrategyTeam> {
  return hydrateStrategyPresetWithResolvers(preset, defaultResolvers);
}

function filterStrategyPreset(
  preset: Pick<StrategyTeamPreset, "strategyType" | "format" | "difficulty">,
  query: StrategyQuery,
): boolean {
  if (query.strategyType && preset.strategyType !== query.strategyType) {
    return false;
  }

  if (query.format && preset.format !== query.format) {
    return false;
  }

  if (query.difficulty && preset.difficulty !== query.difficulty) {
    return false;
  }

  return true;
}

export async function getStrategyTeamSummaries(
  query: StrategyQuery = {},
): Promise<StrategyTeamSummary[]> {
  const now = Date.now();
  let allSummaries: StrategyTeamSummary[];

  if (strategySummaryCache && strategySummaryCache.expiresAt > now) {
    allSummaries = strategySummaryCache.data;
  } else {
    const slugs = STRATEGY_TEAM_PRESETS.flatMap((preset) =>
      preset.pokemon.slice(0, 6).map((slot) => slot.pokemonSlug),
    );
    const pokemonListItems = await getPokemonListItemsBySlugs(slugs);
    const pokemonBySlug = new Map(pokemonListItems.map((pokemon) => [pokemon.slug, pokemon]));

    allSummaries = STRATEGY_TEAM_PRESETS.map((preset) => ({
      id: preset.id,
      name: preset.name,
      slug: preset.slug,
      strategyType: preset.strategyType,
      format: preset.format,
      difficulty: preset.difficulty,
      tags: preset.tags,
      shortDescription: preset.shortDescription,
      pokemon: preset.pokemon
        .slice(0, 6)
        .map((slot) => {
          const pokemon = pokemonBySlug.get(slot.pokemonSlug);
          if (!pokemon) {
            console.error("[Strategy Summary] Missing Pokemon:", slot.pokemonSlug);
            return null;
          }

          return {
            slot: slot.slot,
            pokemon,
            role: slot.role,
            explanation: slot.explanation,
          };
        })
        .filter((slot): slot is StrategyTeamSummary["pokemon"][number] => Boolean(slot)),
    }));

    strategySummaryCache = {
      expiresAt: now + STRATEGY_SUMMARY_CACHE_TTL_MS,
      data: allSummaries,
    };
  }

  return allSummaries.filter((strategy) => filterStrategyPreset(strategy, query));
}

export async function getStrategyTeamByIdOrSlug(idOrSlug: string): Promise<StrategyTeam | null> {
  const preset = STRATEGY_TEAM_PRESETS.find(
    (entry) => entry.id === idOrSlug || entry.slug === idOrSlug,
  );

  if (!preset) {
    return null;
  }

  return hydrateStrategyPreset(preset);
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

  return hydratedAllStrategies.filter((strategy) => filterStrategyPreset(strategy, query));
}

