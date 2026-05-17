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

const STRATEGY_DISPLAY_ORDER = new Map<string, number>(
  [
    "classic-balance",
    "bulky-offense-core",
    "weatherless-offense",
    "rain-tempo",
    "sun-pressure",
    "tailwind-offense",
    "trick-room-bulk",
    "intimidate-cycle",
    "priority-spam",
    "triples-tailwind-lanes",
    "triples-rain-spread",
    "sand-rush",
    "snow-aurora-veil",
    "voltturn-pressure",
    "terrain-control",
    "grassy-terrain-balance",
    "wide-guard-offense",
    "triples-wide-guard-balance",
    "hyper-offense-blitz",
    "screens-setup",
    "sticky-web-offense",
    "hazard-stack-control",
    "setup-spam-ho",
    "doubles-sand-control",
    "doubles-snow-tailwind",
    "triples-sun-spread",
    "triples-sand-lanes",
    "triples-snow-veil",
    "sand-balance",
    "snow-veil",
    "status-spam",
    "semi-stall-shell",
    "psyspam",
    "rainroom",
    "sunroom",
    "tailroom-flex",
    "triples-trick-room-phalanx",
    "triples-redirection-setup",
    "iron-stall",
    "toxic-stall",
    "perish-trap-control",
    "triples-perish-control",
    "beatup-justified",
    "dozogiri",
    "baton-pass-chain",
  ].map((id, index) => [id, index]),
);

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

function sortStrategiesForDisplay<T extends { id: string }>(strategies: T[]): T[] {
  return [...strategies].sort((left, right) => {
    const leftOrder = STRATEGY_DISPLAY_ORDER.get(left.id) ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = STRATEGY_DISPLAY_ORDER.get(right.id) ?? Number.MAX_SAFE_INTEGER;

    return leftOrder - rightOrder || left.id.localeCompare(right.id);
  });
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

  return sortStrategiesForDisplay(
    allSummaries.filter((strategy) => filterStrategyPreset(strategy, query)),
  );
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

  return sortStrategiesForDisplay(
    hydratedAllStrategies.filter((strategy) => filterStrategyPreset(strategy, query)),
  );
}

