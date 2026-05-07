import { create } from "zustand";

type RecommendationStoreState = {
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
};

export const useRecommendationStore = create<RecommendationStoreState>((set) => ({
  isLoading: false,
  setIsLoading: (value) => set({ isLoading: value }),
}));
