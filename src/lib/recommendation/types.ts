import type { RecommendationReason } from "@/types/recommendation";
import type { TeamRole, PokemonType } from "@/types/shared";
import type { Team } from "@/types/team";
import type { Pokemon } from "@/types/pokemon";

export interface TeamAnalysis {
  team: Team;
  presentRoles: Set<TeamRole>;
  missingRoles: TeamRole[];
  duplicateRoles: TeamRole[];
  majorWeaknesses: PokemonType[];
  missingCoverage: PokemonType[];
  teamTypeCounts: Map<PokemonType, number>;
}

export interface ScoredCandidate {
  pokemon: Pokemon;
  score: number;
  reasons: RecommendationReason[];
  matchedRoles: TeamRole[];
}

