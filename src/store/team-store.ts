import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Ability } from "@/types/ability";
import type { Item } from "@/types/item";
import type { Move } from "@/types/move";
import type { Pokemon } from "@/types/pokemon";
import type { BattleFormat } from "@/types/shared";
import type { Team, TeamPokemon } from "@/types/team";

const TEAM_STORAGE_KEY = "pokemon-team-forge-current-team";

const TEAM_SLOT_COUNT = 6;
const MOVE_SLOT_ORDER: Array<1 | 2 | 3 | 4> = [1, 2, 3, 4];
const isValidTeamSlot = (slot: number): boolean =>
  Number.isInteger(slot) && slot >= 1 && slot <= TEAM_SLOT_COUNT;

const createEmptyTeamSlot = (slot: number): TeamPokemon => ({
  slot,
  pokemon: null,
  selectedAbility: null,
  selectedItem: null,
  moves: MOVE_SLOT_ORDER.map((moveSlot) => ({ slot: moveSlot, move: null })),
  isShiny: false,
});

const createEmptyTeam = (format: BattleFormat = "singles"): Team => ({
  name: "Untitled Team",
  format,
  pokemon: Array.from({ length: TEAM_SLOT_COUNT }, (_, index) =>
    createEmptyTeamSlot(index + 1),
  ),
});

const normalizeTeam = (team: Team): Team => {
  const normalizedSlots = Array.from({ length: TEAM_SLOT_COUNT }, (_, index) => {
    const targetSlot = index + 1;
    const incoming = team.pokemon.find((slot) => slot.slot === targetSlot);

    if (!incoming) {
      return createEmptyTeamSlot(targetSlot);
    }

    const moves = MOVE_SLOT_ORDER.map((moveSlot) => {
      const incomingMove = incoming.moves.find((entry) => entry.slot === moveSlot);
      return { slot: moveSlot, move: incomingMove?.move ?? null };
    });

    return {
      slot: targetSlot,
      pokemon: incoming.pokemon ?? null,
      selectedAbility: incoming.selectedAbility ?? null,
      selectedItem: incoming.selectedItem ?? null,
      moves,
      isShiny: incoming.isShiny ?? false,
    };
  });

  return {
    ...team,
    format: team.format ?? "singles",
    pokemon: normalizedSlots,
  };
};

type TeamStoreState = {
  team: Team;
  setFormat: (format: BattleFormat) => void;
  setTeamName: (name: string) => void;
  addPokemon: (slot: number, pokemon: Pokemon) => void;
  removePokemon: (slot: number) => void;
  replacePokemon: (slot: number, pokemon: Pokemon) => void;
  setAbility: (slot: number, ability: Ability | null) => void;
  setItem: (slot: number, item: Item | null) => void;
  setMove: (pokemonSlot: number, moveSlot: 1 | 2 | 3 | 4, move: Move | null) => void;
  clearTeam: () => void;
  loadTeam: (team: Team) => void;
};

const updateSlot = (
  team: Team,
  slot: number,
  updater: (teamSlot: TeamPokemon) => TeamPokemon,
): Team => {
  if (!isValidTeamSlot(slot)) {
    return team;
  }

  return {
    ...team,
    pokemon: team.pokemon.map((teamSlot) =>
      teamSlot.slot === slot ? updater(teamSlot) : teamSlot,
    ),
  };
};

export const useTeamStore = create<TeamStoreState>()(
  persist(
    (set) => ({
      team: createEmptyTeam(),

      setFormat: (format) =>
        set((state) => ({
          team: {
            ...state.team,
            format,
          },
        })),

      setTeamName: (name) =>
        set((state) => ({
          team: {
            ...state.team,
            name: name.trim() || "Untitled Team",
          },
        })),

      addPokemon: (slot, pokemon) =>
        set((state) => ({
          team: updateSlot(state.team, slot, (teamSlot) => ({
            ...teamSlot,
            pokemon,
            selectedAbility: null,
            selectedItem: null,
            moves: MOVE_SLOT_ORDER.map((moveSlot) => ({ slot: moveSlot, move: null })),
          })),
        })),

      removePokemon: (slot) =>
        set((state) => ({
          team: updateSlot(state.team, slot, () => createEmptyTeamSlot(slot)),
        })),

      replacePokemon: (slot, pokemon) =>
        set((state) => ({
          team: updateSlot(state.team, slot, (teamSlot) => ({
            ...teamSlot,
            pokemon,
            selectedAbility: null,
            selectedItem: null,
            moves: MOVE_SLOT_ORDER.map((moveSlot) => ({ slot: moveSlot, move: null })),
          })),
        })),

      setAbility: (slot, ability) =>
        set((state) => ({
          team: updateSlot(state.team, slot, (teamSlot) => ({
            ...teamSlot,
            selectedAbility: ability,
          })),
        })),

      setItem: (slot, item) =>
        set((state) => ({
          team: updateSlot(state.team, slot, (teamSlot) => ({
            ...teamSlot,
            selectedItem: item,
          })),
        })),

      setMove: (pokemonSlot, moveSlot, move) =>
        set((state) => ({
          team: updateSlot(state.team, pokemonSlot, (teamSlot) => ({
            ...teamSlot,
            moves: teamSlot.moves.map((entry) =>
              entry.slot === moveSlot ? { ...entry, move } : entry,
            ),
          })),
        })),

      clearTeam: () =>
        set((state) => ({
          team: createEmptyTeam(state.team.format),
        })),

      loadTeam: (team) =>
        set(() => ({
          team: normalizeTeam(team),
        })),
    }),
    {
      name: TEAM_STORAGE_KEY,
      storage:
        typeof window === "undefined"
          ? undefined
          : createJSONStorage(() => localStorage),
      partialize: (state) => ({ team: state.team }),
      onRehydrateStorage: () => (state) => {
        if (!state) {
          return;
        }
        state.team = normalizeTeam(state.team);
      },
    },
  ),
);
