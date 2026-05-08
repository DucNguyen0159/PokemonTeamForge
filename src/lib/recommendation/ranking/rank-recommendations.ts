import type { ScoredCandidate } from "../types";

export function rankRecommendations(candidates: ScoredCandidate[]): ScoredCandidate[] {
  return [...candidates].sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }

    return left.pokemon.name.localeCompare(right.pokemon.name);
  });
}

