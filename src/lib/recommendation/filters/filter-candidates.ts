import { FORMAT_RULES } from "@/data/format-rules";
import { MOVE_TAGS } from "@/data/move-tags";
import type { Pokemon } from "@/types/pokemon";
import type { RecommendationFilters } from "@/types/recommendation";
import type { MoveTag } from "@/types/move";
import type { TeamRole } from "@/types/shared";
import type { Team } from "@/types/team";

import { statMatchesTier } from "../utils/stat-tier";

function hasAnyRole(pokemon: Pokemon, roles: TeamRole[]): boolean {
  return roles.some((role) => pokemon.roles.includes(role));
}

function hasAnyMoveTag(pokemon: Pokemon, tags: MoveTag[]): boolean {
  return pokemon.moves.some((move) => {
    const staticTags = MOVE_TAGS[move.slug] ?? [];
    const intrinsicTags = move.tags ?? [];
    const allTags = [...staticTags, ...intrinsicTags];
    return tags.some((tag) => allTags.includes(tag));
  });
}

function isFormatCompatible(pokemon: Pokemon, format: RecommendationFilters["format"]): boolean {
  const rules = FORMAT_RULES[format].checklist;
  return (
    hasAnyRole(pokemon, rules.requiredRoles) ||
    hasAnyRole(pokemon, rules.recommendedRoles) ||
    hasAnyMoveTag(pokemon, rules.requiredMoveTags) ||
    hasAnyMoveTag(pokemon, rules.recommendedMoveTags)
  );
}

function applyFilter(
  candidates: Pokemon[],
  predicate: (candidate: Pokemon) => boolean,
): Pokemon[] {
  return candidates.filter(predicate);
}

export function filterCandidates(
  allPokemon: Pokemon[],
  filters: RecommendationFilters,
  team: Team,
): Pokemon[] {
  const teamSlugs = new Set(
    team.pokemon
      .map((slot) => slot.pokemon?.slug)
      .filter((slug): slug is string => Boolean(slug)),
  );

  let candidates = applyFilter(allPokemon, (candidate) => !teamSlugs.has(candidate.slug));

  if (filters.excludeLegendaryOrMythical) {
    candidates = applyFilter(candidates, (candidate) => !candidate.isLegendaryOrMythical);
  }

  if (filters.region !== "all") {
    const targetRegion = filters.region.toLowerCase();
    candidates = applyFilter(
      candidates,
      (candidate) => candidate.region.toLowerCase() === targetRegion,
    );
  }

  if (filters.generation !== "all") {
    candidates = applyFilter(candidates, (candidate) => candidate.generation === filters.generation);
  }

  if (filters.type !== "all") {
    candidates = applyFilter(
      candidates,
      (candidate) =>
        candidate.primaryType === filters.type || candidate.secondaryType === filters.type,
    );
  }

  if (filters.role !== "all") {
    const selectedRole: TeamRole = filters.role;
    candidates = applyFilter(candidates, (candidate) => candidate.roles.includes(selectedRole));
  }

  candidates = applyFilter(candidates, (candidate) => {
    const { stats } = candidate;
    return (
      statMatchesTier(stats.attack, filters.attackTier) &&
      statMatchesTier(stats.defense, filters.defenseTier) &&
      statMatchesTier(stats.specialAttack, filters.specialAttackTier) &&
      statMatchesTier(stats.specialDefense, filters.specialDefenseTier) &&
      statMatchesTier(stats.speed, filters.speedTier)
    );
  });

  const formatCompatible = applyFilter(candidates, (candidate) =>
    isFormatCompatible(candidate, filters.format),
  );

  return formatCompatible.length >= 5 ? formatCompatible : candidates;
}

