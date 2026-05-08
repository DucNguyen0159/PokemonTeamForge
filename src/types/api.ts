import type { PokemonDetail, PokemonListItem } from "./pokemon";
import type { RecommendationResponse } from "./recommendation";
import type { StrategyTeam } from "./strategy";

export interface ApiError {
  code: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface PokemonListPayload {
  pokemon: PokemonListItem[];
  total: number;
  page: number;
  limit: number;
}

export type PokemonListResponse = ApiResponse<PokemonListPayload>;
export type PokemonDetailResponse = ApiResponse<PokemonDetail>;
export type RecommendationApiResponse = ApiResponse<RecommendationResponse>;
export type StrategyListResponse = ApiResponse<StrategyTeam[]>;
