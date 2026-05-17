import type { PokemonDetail, PokemonListItem } from "./pokemon";
import type { Item } from "./item";
import type { RecommendationResponse } from "./recommendation";
import type { StrategyTeam, StrategyTeamSummary } from "./strategy";

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

export interface ItemListPayload {
  items: Item[];
  total: number;
}

export type PokemonListResponse = ApiResponse<PokemonListPayload>;
export type PokemonDetailResponse = ApiResponse<PokemonDetail>;
export type ItemListResponse = ApiResponse<ItemListPayload>;
export type RecommendationApiResponse = ApiResponse<RecommendationResponse>;
export type StrategyListResponse = ApiResponse<StrategyTeamSummary[]>;
export type StrategyDetailResponse = ApiResponse<StrategyTeam>;
