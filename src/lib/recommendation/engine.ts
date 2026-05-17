import { FORMAT_RULES } from "@/data/format-rules";
import { calculateDefensiveCoverage, calculateOffensiveCoverage } from "@/lib/calculations";
import { toPokemonListItem } from "@/lib/normalizers/normalize-pokemon";
import { getPokemonRecommendationPool } from "@/lib/services/pokemon-service";
import { getStrategyTeams } from "@/lib/services/strategy-service";
import type {
  RecommendationRequest,
  RecommendationResponse,
  RecommendationResult,
} from "@/types/recommendation";
import type { Pokemon } from "@/types/pokemon";
import type { PokemonType, TeamRole } from "@/types/shared";
import type { TeamPokemon } from "@/types/team";

import { filterCandidates } from "./filters/filter-candidates";
import { rankRecommendations } from "./ranking/rank-recommendations";
import { scoreCandidate } from "./scoring/score-candidate";
import type { TeamAnalysis } from "./types";

const DEFAULT_RESULT_COUNT = 8;
const RESULT_CACHE_TTL_MS = 1000 * 60 * 2;
const RESULT_CACHE_MAX_ENTRIES = 100;

const recommendationResultCache = new Map<string, { expiresAt: number; data: RecommendationResponse }>();

function buildRoleCounts(roles: TeamRole[]): Map<TeamRole, number> {
  return roles.reduce((map, role) => {
    map.set(role, (map.get(role) ?? 0) + 1);
    return map;
  }, new Map<TeamRole, number>());
}

function buildTypeCounts(types: PokemonType[]): Map<PokemonType, number> {
  return types.reduce((map, type) => {
    map.set(type, (map.get(type) ?? 0) + 1);
    return map;
  }, new Map<PokemonType, number>());
}

function teamSlotCacheKey(slot: TeamPokemon) {
  const pokemon = slot.pokemon;
  return {
    slot: slot.slot,
    pokemon: pokemon
      ? {
          slug: pokemon.slug,
          primaryType: pokemon.primaryType,
          secondaryType: pokemon.secondaryType ?? null,
          roles: [...pokemon.roles].sort(),
          stats: pokemon.stats,
        }
      : null,
    ability: slot.selectedAbility?.slug ?? null,
    item: slot.selectedItem?.slug ?? null,
    moves: slot.moves.map((entry) => ({
      slot: entry.slot,
      move: entry.move?.slug ?? null,
    })),
  };
}

function recommendationCacheKey(request: RecommendationRequest): string {
  return JSON.stringify({
    filters: request.filters,
    team: {
      format: request.team.format,
      pokemon: request.team.pokemon.map(teamSlotCacheKey),
    },
  });
}

function getCachedRecommendation(key: string): RecommendationResponse | null {
  const cached = recommendationResultCache.get(key);
  if (!cached) {
    return null;
  }

  if (cached.expiresAt <= Date.now()) {
    recommendationResultCache.delete(key);
    return null;
  }

  return cached.data;
}

function setCachedRecommendation(key: string, data: RecommendationResponse): void {
  if (recommendationResultCache.size >= RESULT_CACHE_MAX_ENTRIES) {
    const firstKey = recommendationResultCache.keys().next().value;
    if (firstKey) {
      recommendationResultCache.delete(firstKey);
    }
  }

  recommendationResultCache.set(key, {
    expiresAt: Date.now() + RESULT_CACHE_TTL_MS,
    data,
  });
}

function analyzeTeam(request: RecommendationRequest): TeamAnalysis {
  const { team, filters } = request;
  const activePokemon = team.pokemon
    .map((slot) => slot.pokemon)
    .filter((pokemon): pokemon is NonNullable<typeof pokemon> => Boolean(pokemon));

  const allRoles = activePokemon.flatMap((pokemon) => pokemon.roles);
  const roleCounts = buildRoleCounts(allRoles);

  const allTypes = activePokemon.flatMap((pokemon) =>
    pokemon.secondaryType ? [pokemon.primaryType, pokemon.secondaryType] : [pokemon.primaryType],
  );
  const teamTypeCounts = buildTypeCounts(allTypes);

  const formatChecklist = FORMAT_RULES[filters.format].checklist;
  const requiredRoles = [...formatChecklist.requiredRoles, ...formatChecklist.recommendedRoles];
  const uniqueRequiredRoles = Array.from(new Set(requiredRoles));

  const presentRoles = new Set(allRoles);
  const missingRoles = uniqueRequiredRoles.filter((role) => !presentRoles.has(role));
  const duplicateRoles = Array.from(roleCounts.entries())
    .filter(([, count]) => count >= 2)
    .map(([role]) => role);

  const defensiveCoverage = calculateDefensiveCoverage(team);
  const offensiveCoverage = calculateOffensiveCoverage(team);

  return {
    team,
    presentRoles,
    missingRoles,
    duplicateRoles,
    majorWeaknesses: defensiveCoverage.summary.majorWeaknesses,
    missingCoverage: offensiveCoverage.summary.missingTypes,
    teamTypeCounts,
  };
}

function toRecommendationResult(scored: ReturnType<typeof scoreCandidate>): RecommendationResult {
  return {
    pokemon: toPokemonListItem(scored.pokemon),
    score: Math.round(scored.score),
    reasons: scored.reasons,
    matchedRoles: scored.matchedRoles,
  };
}

function generateRecommendationsWithPool(
  request: RecommendationRequest,
  pool: Pokemon[],
): RecommendationResponse {
  const analysis = analyzeTeam(request);
  const candidates = filterCandidates(pool, request.filters, request.team);

  const scored = candidates.map((candidate) => scoreCandidate(candidate, analysis, request.filters));
  const ranked = rankRecommendations(scored);

  const limit = Math.min(DEFAULT_RESULT_COUNT, ranked.length);
  const minimum = ranked.length >= 5 ? 5 : ranked.length;
  const selectedCount = Math.max(limit, minimum);

  return {
    results: ranked.slice(0, selectedCount).map(toRecommendationResult),
    analyzedAt: new Date().toISOString(),
  };
}

export function generateRecommendations(request: RecommendationRequest): RecommendationResponse {
  return generateRecommendationsWithPool(request, []);
}

export async function generateRecommendationsFromSharedSource(
  request: RecommendationRequest,
): Promise<RecommendationResponse> {
  const cacheKey = recommendationCacheKey(request);
  const cached = getCachedRecommendation(cacheKey);
  if (cached) {
    return cached;
  }

  const supabasePool = await getPokemonRecommendationPool();
  if (supabasePool.length > 0) {
    const response = generateRecommendationsWithPool(request, supabasePool);
    setCachedRecommendation(cacheKey, response);
    return response;
  }

  const strategyTeams = await getStrategyTeams();
  const candidateMap = new Map(
    strategyTeams
      .flatMap((strategy) => strategy.pokemon.map((slot) => slot.pokemon))
      .map((pokemon) => [pokemon.slug, pokemon] as const),
  );

  const response = generateRecommendationsWithPool(request, Array.from(candidateMap.values()));
  setCachedRecommendation(cacheKey, response);
  return response;
}

