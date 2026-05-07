import { create } from "zustand";

type UiStoreState = {
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
};

export const useUiStore = create<UiStoreState>((set) => ({
  isSidebarOpen: true,
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
}));
