import type { PokemonDetail, PokemonListItem } from "./pokemon";
import type { RecommendationResponse } from "./recommendation";

export interface ApiError {
  code: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export type PokemonListResponse = ApiResponse<PokemonListItem[]>;
export type PokemonDetailResponse = ApiResponse<PokemonDetail>;
export type RecommendationApiResponse = ApiResponse<RecommendationResponse>;
