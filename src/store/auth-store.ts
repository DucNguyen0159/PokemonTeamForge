import { create } from "zustand";

type AuthStoreState = {
  isAuthenticated: boolean;
  setAuthenticated: (value: boolean) => void;
};

export const useAuthStore = create<AuthStoreState>((set) => ({
  isAuthenticated: false,
  setAuthenticated: (value) => set({ isAuthenticated: value }),
}));
