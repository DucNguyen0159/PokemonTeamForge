import { create } from "zustand";

type UiStoreState = {
  isSidebarOpen: boolean;
  isMobileMenuOpen: boolean;
  isCommandPaletteOpen: boolean;
  isImportModalOpen: boolean;
  isExportModalOpen: boolean;
  theme: "dark" | "light" | "system";
  setSidebarOpen: (isOpen: boolean) => void;
  toggleSidebar: () => void;
  setMobileMenuOpen: (isOpen: boolean) => void;
  toggleMobileMenu: () => void;
  setCommandPaletteOpen: (isOpen: boolean) => void;
  setImportModalOpen: (isOpen: boolean) => void;
  setExportModalOpen: (isOpen: boolean) => void;
  setTheme: (theme: UiStoreState["theme"]) => void;
  closeAllOverlays: () => void;
};

export const useUiStore = create<UiStoreState>((set) => ({
  isSidebarOpen: true,
  isMobileMenuOpen: false,
  isCommandPaletteOpen: false,
  isImportModalOpen: false,
  isExportModalOpen: false,
  theme: "dark",
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setMobileMenuOpen: (isOpen) => set({ isMobileMenuOpen: isOpen }),
  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  setCommandPaletteOpen: (isOpen) => set({ isCommandPaletteOpen: isOpen }),
  setImportModalOpen: (isOpen) => set({ isImportModalOpen: isOpen }),
  setExportModalOpen: (isOpen) => set({ isExportModalOpen: isOpen }),
  setTheme: (theme) => set({ theme }),
  closeAllOverlays: () =>
    set({
      isMobileMenuOpen: false,
      isCommandPaletteOpen: false,
      isImportModalOpen: false,
      isExportModalOpen: false,
    }),
}));
