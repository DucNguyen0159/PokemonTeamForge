import { create } from "zustand";

import type { StrategyType } from "@/types/strategy";
import type {
  BattleFormat,
  DifficultyLevel,
  PokemonType,
  TeamRole,
} from "@/types/shared";

type PokedexFilters = {
  search: string;
  type: PokemonType | "all";
  generation: number | "all";
  region: string | "all";
  sortBy: "id" | "name" | "total";
  sortDirection: "asc" | "desc";
};

type StrategyFilters = {
  search: string;
  strategyType: StrategyType | "all";
  format: BattleFormat | "all";
  difficulty: DifficultyLevel | "all";
};

type FilterStoreState = {
  pokedexFilters: PokedexFilters;
  strategyFilters: StrategyFilters;
  setPokedexFilters: (filters: Partial<PokedexFilters>) => void;
  setStrategyFilters: (filters: Partial<StrategyFilters>) => void;
  setGlobalSearch: (value: string) => void;
  setGlobalType: (value: PokemonType | "all") => void;
  setGlobalGeneration: (value: number | "all") => void;
  setGlobalRegion: (value: string | "all") => void;
  setGlobalRole: (value: TeamRole | "all") => void;
  globalRole: TeamRole | "all";
  resetFilters: () => void;
};

const defaultPokedexFilters: PokedexFilters = {
  search: "",
  type: "all",
  generation: "all",
  region: "all",
  sortBy: "id",
  sortDirection: "asc",
};

const defaultStrategyFilters: StrategyFilters = {
  search: "",
  strategyType: "all",
  format: "all",
  difficulty: "all",
};

export const useFilterStore = create<FilterStoreState>((set) => ({
  pokedexFilters: defaultPokedexFilters,
  strategyFilters: defaultStrategyFilters,
  globalRole: "all",

  setPokedexFilters: (filters) =>
    set((state) => ({
      pokedexFilters: {
        ...state.pokedexFilters,
        ...filters,
      },
    })),

  setStrategyFilters: (filters) =>
    set((state) => ({
      strategyFilters: {
        ...state.strategyFilters,
        ...filters,
      },
    })),

  setGlobalSearch: (value) =>
    set((state) => ({
      pokedexFilters: { ...state.pokedexFilters, search: value },
      strategyFilters: { ...state.strategyFilters, search: value },
    })),

  setGlobalType: (value) =>
    set((state) => ({
      pokedexFilters: { ...state.pokedexFilters, type: value },
    })),

  setGlobalGeneration: (value) =>
    set((state) => ({
      pokedexFilters: { ...state.pokedexFilters, generation: value },
    })),

  setGlobalRegion: (value) =>
    set((state) => ({
      pokedexFilters: { ...state.pokedexFilters, region: value },
    })),

  setGlobalRole: (value) => set({ globalRole: value }),

  resetFilters: () =>
    set({
      pokedexFilters: defaultPokedexFilters,
      strategyFilters: defaultStrategyFilters,
      globalRole: "all",
    }),
}));
