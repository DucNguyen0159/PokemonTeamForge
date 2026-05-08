import type { PokemonListItem } from "./pokemon";
import type {
  BattleFormat,
  PokemonType,
  StatTier,
  TeamRole,
} from "./shared";
import type { Team } from "./team";

export interface RecommendationFilters {
  excludeLegendaryOrMythical: boolean;
  region: string | "all";
  generation: number | "all";
  type: PokemonType | "all";
  role: TeamRole | "all";
  format: BattleFormat;
  attackTier: StatTier;
  defenseTier: StatTier;
  specialAttackTier: StatTier;
  specialDefenseTier: StatTier;
  speedTier: StatTier;
}

export interface RecommendationRequest {
  team: Team;
  filters: RecommendationFilters;
}

export interface RecommendationReason {
  type:
    | "defensive_synergy"
    | "offensive_coverage"
    | "missing_role"
    | "ability_synergy"
    | "format_bonus"
    | "stat_tier_match"
    | "penalty";
  message: string;
  scoreImpact: number;
}

export interface RecommendationResult {
  pokemon: PokemonListItem;
  score: number;
  reasons: RecommendationReason[];
  matchedRoles: TeamRole[];
}

export interface RecommendationResponse {
  results: RecommendationResult[];
  analyzedAt: string;
}
