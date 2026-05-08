import { create } from "zustand";

import type {
  RecommendationFilters,
  RecommendationResult,
} from "@/types/recommendation";

const defaultRecommendationFilters: RecommendationFilters = {
  excludeLegendaryOrMythical: false,
  region: "all",
  generation: "all",
  type: "all",
  role: "all",
  format: "singles",
  attackTier: "any",
  defenseTier: "any",
  specialAttackTier: "any",
  specialDefenseTier: "any",
  speedTier: "any",
};

type RecommendationStoreState = {
  filters: RecommendationFilters;
  results: RecommendationResult[];
  isLoading: boolean;
  error: string | null;
  setFilters: (filters: Partial<RecommendationFilters>) => void;
  setResults: (results: RecommendationResult[]) => void;
  setIsLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  clearResults: () => void;
};

export const useRecommendationStore = create<RecommendationStoreState>((set) => ({
  filters: defaultRecommendationFilters,
  results: [],
  isLoading: false,
  error: null,
  setFilters: (filters) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...filters,
      },
    })),
  setResults: (results) => set({ results }),
  setIsLoading: (value) => set({ isLoading: value }),
  setError: (message) => set({ error: message }),
  clearResults: () => set({ results: [] }),
}));
