import { FORMAT_RULES } from "@/data/format-rules";
import { MOVE_TAGS } from "@/data/move-tags";
import { calculateTypeEffectiveness, isSuperEffectiveAgainst } from "@/lib/calculations/shared/type-effectiveness";
import type { Pokemon } from "@/types/pokemon";
import type { RecommendationFilters, RecommendationReason } from "@/types/recommendation";
import type { MoveTag } from "@/types/move";
import type { PokemonType, TeamRole } from "@/types/shared";

import { RECOMMENDATION_WEIGHTS } from "../weights/recommendation-weights";
import type { ScoredCandidate, TeamAnalysis } from "../types";
import { statMatchesTier } from "../utils/stat-tier";

type ScoringWeights = Record<keyof typeof RECOMMENDATION_WEIGHTS, number>;

function getFormatAdjustedWeights(format: RecommendationFilters["format"]): ScoringWeights {
  const formatWeights = FORMAT_RULES[format].recommendationWeights;

  return {
    ...RECOMMENDATION_WEIGHTS,
    missingRole: RECOMMENDATION_WEIGHTS.missingRole * formatWeights.missingRole,
    defensiveSynergy: RECOMMENDATION_WEIGHTS.defensiveSynergy * formatWeights.defensiveSynergy,
    offensiveCoverage: RECOMMENDATION_WEIGHTS.offensiveCoverage * formatWeights.offensiveCoverage,
    formatBonus: RECOMMENDATION_WEIGHTS.formatBonus * formatWeights.formatSynergy,
    statTierMatch: RECOMMENDATION_WEIGHTS.statTierMatch * formatWeights.statBalance,
  };
}

function addReason(
  reasons: RecommendationReason[],
  reason: RecommendationReason,
): void {
  reasons.push(reason);
}

function getCandidateTypes(candidate: Pokemon): PokemonType[] {
  return candidate.secondaryType
    ? [candidate.primaryType, candidate.secondaryType]
    : [candidate.primaryType];
}

function getCandidateMoveTags(candidate: Pokemon): Set<MoveTag> {
  const tags = new Set<MoveTag>();

  candidate.moves.forEach((move) => {
    (move.tags ?? []).forEach((tag) => tags.add(tag));
    (MOVE_TAGS[move.slug] ?? []).forEach((tag) => tags.add(tag));
  });

  return tags;
}

function scoreMissingRoles(
  candidate: Pokemon,
  analysis: TeamAnalysis,
  reasons: RecommendationReason[],
  weights: ScoringWeights,
): number {
  const matchedMissing = analysis.missingRoles.filter((role) => candidate.roles.includes(role));

  if (matchedMissing.length === 0) {
    return 0;
  }

  const impact = weights.missingRole * matchedMissing.length;
  addReason(reasons, {
    type: "missing_role",
    message: `Fills missing team role${matchedMissing.length > 1 ? "s" : ""}: ${matchedMissing.join(", ").replaceAll("_", " ")}.`,
    scoreImpact: impact,
  });
  return impact;
}

function scoreDefensiveSynergy(
  candidate: Pokemon,
  analysis: TeamAnalysis,
  reasons: RecommendationReason[],
  weights: ScoringWeights,
): number {
  const candidateTypes = getCandidateTypes(candidate);
  let score = 0;
  let coveredWeaknesses = 0;

  analysis.majorWeaknesses.forEach((type) => {
    const multiplier = calculateTypeEffectiveness(type, candidateTypes);
    if (multiplier === 0 || multiplier < 1) {
      score += weights.defensiveSynergy;
      coveredWeaknesses += 1;
      return;
    }

    if (multiplier > 1) {
      const penalty = RECOMMENDATION_WEIGHTS.duplicateWeaknessPenalty;
      score += penalty;
      addReason(reasons, {
        type: "penalty",
        message: `Adds another ${type} weakness to the team.`,
        scoreImpact: penalty,
      });
    }
  });

  if (coveredWeaknesses > 0) {
    addReason(reasons, {
      type: "defensive_synergy",
      message: `Improves defensive profile against ${coveredWeaknesses} major team weakness${coveredWeaknesses > 1 ? "es" : ""}.`,
      scoreImpact: weights.defensiveSynergy * coveredWeaknesses,
    });
  }

  return score;
}

function scoreOffensiveCoverage(
  candidate: Pokemon,
  analysis: TeamAnalysis,
  reasons: RecommendationReason[],
  weights: ScoringWeights,
): number {
  const candidateMoveTypes = new Set(candidate.moves.map((move) => move.type));
  const improvedCoverage = analysis.missingCoverage.filter((targetType) =>
    Array.from(candidateMoveTypes).some((moveType) => isSuperEffectiveAgainst(moveType, targetType)),
  );

  if (improvedCoverage.length === 0) {
    return 0;
  }

  const impact = improvedCoverage.length * weights.offensiveCoverage;
  addReason(reasons, {
    type: "offensive_coverage",
    message: `Adds pressure into uncovered matchups: ${improvedCoverage.slice(0, 3).join(", ")}${improvedCoverage.length > 3 ? ", ..." : ""}.`,
    scoreImpact: impact,
  });
  return impact;
}

function scoreFormatBonus(
  candidate: Pokemon,
  filters: RecommendationFilters,
  reasons: RecommendationReason[],
  weights: ScoringWeights,
): number {
  const checklist = FORMAT_RULES[filters.format].checklist;
  const candidateTags = getCandidateMoveTags(candidate);

  const requiredRoleMatches = checklist.requiredRoles.filter((role) => candidate.roles.includes(role));
  const recommendedRoleMatches = checklist.recommendedRoles.filter((role) => candidate.roles.includes(role));
  const requiredTagMatches = checklist.requiredMoveTags.filter((tag) => candidateTags.has(tag));
  const recommendedTagMatches = checklist.recommendedMoveTags.filter((tag) => candidateTags.has(tag));

  const matchCount =
    requiredRoleMatches.length * 2 +
    recommendedRoleMatches.length +
    requiredTagMatches.length * 2 +
    recommendedTagMatches.length;

  if (matchCount === 0) {
    return 0;
  }

  const impact = matchCount * weights.formatBonus;
  addReason(reasons, {
    type: "format_bonus",
    message: `Fits ${filters.format} utility priorities (${requiredRoleMatches.length + recommendedRoleMatches.length} role match${requiredRoleMatches.length + recommendedRoleMatches.length === 1 ? "" : "es"}).`,
    scoreImpact: impact,
  });
  return impact;
}

function scoreStatTierMatch(
  candidate: Pokemon,
  filters: RecommendationFilters,
  reasons: RecommendationReason[],
  weights: ScoringWeights,
): number {
  const requestedTiers = [
    { key: "attackTier", value: candidate.stats.attack },
    { key: "defenseTier", value: candidate.stats.defense },
    { key: "specialAttackTier", value: candidate.stats.specialAttack },
    { key: "specialDefenseTier", value: candidate.stats.specialDefense },
    { key: "speedTier", value: candidate.stats.speed },
  ] as const;

  const matched = requestedTiers.filter((entry) => statMatchesTier(entry.value, filters[entry.key]));
  const strictFiltersCount = requestedTiers.filter((entry) => filters[entry.key] !== "any").length;

  if (strictFiltersCount === 0 || matched.length === 0) {
    return 0;
  }

  const impact = matched.length * weights.statTierMatch;
  addReason(reasons, {
    type: "stat_tier_match",
    message: `Matches ${matched.length}/${strictFiltersCount} requested stat tier filters.`,
    scoreImpact: impact,
  });
  return impact;
}

function scoreAbilitySynergy(
  candidate: Pokemon,
  analysis: TeamAnalysis,
  filters: RecommendationFilters,
  reasons: RecommendationReason[],
  weights: ScoringWeights,
): number {
  const abilitySlugs = candidate.abilities.map((ability) => ability.slug);
  let score = 0;
  const matchedSignals: string[] = [];

  if (abilitySlugs.includes("levitate") && analysis.majorWeaknesses.includes("ground")) {
    score += weights.abilitySynergy;
    matchedSignals.push("Levitate helps with Ground pressure");
  }

  if (
    (filters.format === "doubles" || filters.format === "triples") &&
    abilitySlugs.includes("intimidate")
  ) {
    score += weights.abilitySynergy;
    matchedSignals.push("Intimidate is strong in multi-target formats");
  }

  const hasWeatherAbility = abilitySlugs.some((slug) =>
    ["drizzle", "drought", "sand-stream", "snow-warning"].includes(slug),
  );
  if (hasWeatherAbility || candidate.roles.includes("weather_abuser") || candidate.roles.includes("weather_setter")) {
    score += Math.round(weights.abilitySynergy / 2);
    matchedSignals.push("Weather plan support");
  }

  if (matchedSignals.length > 0) {
    addReason(reasons, {
      type: "ability_synergy",
      message: matchedSignals.join("; ") + ".",
      scoreImpact: score,
    });
  }

  return score;
}

function applyCompositionPenalties(
  candidate: Pokemon,
  analysis: TeamAnalysis,
  reasons: RecommendationReason[],
): number {
  let score = 0;

  candidate.roles.forEach((role: TeamRole) => {
    const roleCount = analysis.team.pokemon.filter((slot) => slot.pokemon?.roles.includes(role)).length;
    if (roleCount >= 2) {
      score += RECOMMENDATION_WEIGHTS.duplicateRolePenalty;
      addReason(reasons, {
        type: "penalty",
        message: `Team already has multiple ${role.replaceAll("_", " ")} roles.`,
        scoreImpact: RECOMMENDATION_WEIGHTS.duplicateRolePenalty,
      });
    }
  });

  const typePenaltyTargets = [candidate.primaryType, candidate.secondaryType].filter(
    (type): type is PokemonType => Boolean(type),
  );
  typePenaltyTargets.forEach((type) => {
    const typeCount = analysis.teamTypeCounts.get(type) ?? 0;
    if (typeCount >= 2) {
      score += RECOMMENDATION_WEIGHTS.duplicateTypePenalty;
      addReason(reasons, {
        type: "penalty",
        message: `Adds another ${type} type on an already stacked team type.`,
        scoreImpact: RECOMMENDATION_WEIGHTS.duplicateTypePenalty,
      });
    }
  });

  return score;
}

export function scoreCandidate(
  candidate: Pokemon,
  analysis: TeamAnalysis,
  filters: RecommendationFilters,
): ScoredCandidate {
  const reasons: RecommendationReason[] = [];
  const weights = getFormatAdjustedWeights(filters.format);
  let score = 0;

  score += scoreMissingRoles(candidate, analysis, reasons, weights);
  score += scoreDefensiveSynergy(candidate, analysis, reasons, weights);
  score += scoreOffensiveCoverage(candidate, analysis, reasons, weights);
  score += scoreFormatBonus(candidate, filters, reasons, weights);
  score += scoreAbilitySynergy(candidate, analysis, filters, reasons, weights);
  score += scoreStatTierMatch(candidate, filters, reasons, weights);
  score += applyCompositionPenalties(candidate, analysis, reasons);

  const sortedReasons = [...reasons].sort((a, b) => b.scoreImpact - a.scoreImpact).slice(0, 5);

  return {
    pokemon: candidate,
    score,
    reasons: sortedReasons,
    matchedRoles: candidate.roles.filter((role) => analysis.missingRoles.includes(role)),
  };
}

