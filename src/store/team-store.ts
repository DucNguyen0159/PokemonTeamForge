import { create } from "zustand";

type TeamStoreState = {
  format: "singles" | "doubles" | "triples";
  setFormat: (format: TeamStoreState["format"]) => void;
};

export const useTeamStore = create<TeamStoreState>((set) => ({
  format: "singles",
  setFormat: (format) => set({ format }),
}));
