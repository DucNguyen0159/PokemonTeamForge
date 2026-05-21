import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Ability } from "@/types/ability";
import type { Item } from "@/types/item";
import type { Move } from "@/types/move";
import type { Pokemon } from "@/types/pokemon";
import type { BattleFormat } from "@/types/shared";
import { getDefaultAbility } from "@/lib/team/default-ability";
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

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const normalizeFormat = (value: unknown): BattleFormat =>
  value === "doubles" || value === "triples" ? value : "singles";

const normalizeTeam = (team: unknown): Team => {
  if (!isObject(team)) {
    return createEmptyTeam();
  }

  const rawSlots = Array.isArray(team.pokemon)
    ? (team.pokemon as TeamPokemon[])
    : [];

  const normalizedSlots = Array.from({ length: TEAM_SLOT_COUNT }, (_, index) => {
    const targetSlot = index + 1;
    const incoming = rawSlots.find((slot) => slot?.slot === targetSlot);

    if (!incoming) {
      return createEmptyTeamSlot(targetSlot);
    }

    const incomingMoves = Array.isArray(incoming.moves) ? incoming.moves : [];
    const moves = MOVE_SLOT_ORDER.map((moveSlot) => {
      const incomingMove = incomingMoves.find((entry) => entry.slot === moveSlot);
      return { slot: moveSlot, move: incomingMove?.move ?? null };
    });

    return {
      slot: targetSlot,
      pokemon: incoming.pokemon ?? null,
      selectedAbility: incoming.selectedAbility ?? getDefaultAbility(incoming.pokemon ?? null),
      selectedItem: incoming.selectedItem ?? null,
      moves,
      isShiny: incoming.isShiny ?? false,
    };
  });

  return {
    ...team,
    name:
      typeof team.name === "string" && team.name.trim().length > 0
        ? team.name
        : "Untitled Team",
    format: normalizeFormat(team.format),
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

  let didChange = false;
  const pokemon = team.pokemon.map((teamSlot) => {
    if (teamSlot.slot !== slot) {
      return teamSlot;
    }

    const nextSlot = updater(teamSlot);
    didChange = nextSlot !== teamSlot;
    return nextSlot;
  });

  return didChange ? { ...team, pokemon } : team;
};

export const useTeamStore = create<TeamStoreState>()(
  persist(
    (set) => ({
      team: createEmptyTeam(),

      setFormat: (format) =>
        set((state) =>
          state.team.format === format
            ? state
            : {
                team: {
                  ...state.team,
                  format,
                },
              },
        ),

      setTeamName: (name) =>
        set((state) => {
          const nextName = name.trim() || "Untitled Team";
          return state.team.name === nextName
            ? state
            : {
                team: {
                  ...state.team,
                  name: nextName,
                },
              };
        }),

      addPokemon: (slot, pokemon) =>
        set((state) => ({
          team: updateSlot(state.team, slot, (teamSlot) => ({
            ...teamSlot,
            pokemon,
            selectedAbility: getDefaultAbility(pokemon),
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
            selectedAbility: getDefaultAbility(pokemon),
            selectedItem: null,
            moves: MOVE_SLOT_ORDER.map((moveSlot) => ({ slot: moveSlot, move: null })),
          })),
        })),

      setAbility: (slot, ability) =>
        set((state) => {
          const nextTeam = updateSlot(state.team, slot, (teamSlot) =>
            teamSlot.selectedAbility?.id === ability?.id
              ? teamSlot
              : {
                  ...teamSlot,
                  selectedAbility: ability,
                },
          );
          return nextTeam === state.team ? state : { team: nextTeam };
        }),

      setItem: (slot, item) =>
        set((state) => {
          const nextTeam = updateSlot(state.team, slot, (teamSlot) =>
            teamSlot.selectedItem?.id === item?.id
              ? teamSlot
              : {
                  ...teamSlot,
                  selectedItem: item,
                },
          );
          return nextTeam === state.team ? state : { team: nextTeam };
        }),

      setMove: (pokemonSlot, moveSlot, move) =>
        set((state) => {
          const nextTeam = updateSlot(state.team, pokemonSlot, (teamSlot) => {
            const currentMove = teamSlot.moves.find((entry) => entry.slot === moveSlot)?.move;
            if (currentMove?.id === move?.id) {
              return teamSlot;
            }

            return {
              ...teamSlot,
              moves: teamSlot.moves.map((entry) =>
                entry.slot === moveSlot ? { ...entry, move } : entry,
              ),
            };
          });
          return nextTeam === state.team ? state : { team: nextTeam };
        }),

      clearTeam: () =>
        set((state) => ({
          team: createEmptyTeam(state.team.format),
        })),

      loadTeam: (team) =>
        set(() => {
          try {
            return { team: normalizeTeam(team) };
          } catch (error) {
            console.error("[Team Store] Failed to load team", error);
            return { team: createEmptyTeam() };
          }
        }),
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
        try {
          state.team = normalizeTeam(state.team);
        } catch (error) {
          console.error("[Team Store] Failed to recover local team", error);
          state.team = createEmptyTeam();
        }
      },
    },
  ),
);
