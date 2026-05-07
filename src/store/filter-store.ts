import { create } from "zustand";

type FilterStoreState = {
  search: string;
  setSearch: (value: string) => void;
};

export const useFilterStore = create<FilterStoreState>((set) => ({
  search: "",
  setSearch: (value) => set({ search: value }),
}));
