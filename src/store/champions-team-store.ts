import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type {
  ChampionsBattlePlan,
  ChampionsFormatSupport,
  ChampionsPokemon,
  ChampionsSpSpread,
  ChampionsTeam,
} from "@/types/champions";
import { CHAMPIONS_RULESET_ID } from "@/data/champions";

const CHAMPIONS_TEAM_STORAGE_KEY = "pokemon-team-forge-champions-current-team";
const SLOT_COUNT = 6;

function createEmptySp(): ChampionsSpSpread {
  return { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
}

function createEmptySlot(slot: number): ChampionsPokemon {
  return {
    id: `slot-${slot}`,
    slot,
    pokemonId: null,
    pokemonName: "",
    ability: "",
    item: "",
    moves: ["", "", "", ""],
    statAlignment: "Serious",
    sp: createEmptySp(),
    megaStone: "",
    useMegaByDefault: false,
  };
}

function createEmptyTeam(): ChampionsTeam {
  return {
    name: "Untitled Champions Team",
    mode: "champions",
    format: "singles",
    formatSupport: "both",
    rulesetId: CHAMPIONS_RULESET_ID,
    pokemon: Array.from({ length: SLOT_COUNT }, (_, index) => createEmptySlot(index + 1)),
    battlePlans: [],
    teamNotes: "",
    isPublic: false,
  };
}

type ChampionsTeamStoreState = {
  team: ChampionsTeam;
  sourcePresetId: string | null;
  sourcePresetName: string | null;
  setTeamName: (name: string) => void;
  setFormatSupport: (formatSupport: ChampionsFormatSupport) => void;
  setFormat: (format: "singles" | "doubles") => void;
  setRulesetId: (rulesetId: string) => void;
  setTeamNotes: (teamNotes: string) => void;
  setPokemonBySlot: (slot: number, payload: { pokemonId: number | null; pokemonName: string }) => void;
  setAbilityBySlot: (slot: number, ability: string) => void;
  setItemBySlot: (slot: number, item: string) => void;
  setMoveBySlot: (slot: number, moveSlot: 1 | 2 | 3 | 4, move: string) => void;
  setStatAlignmentBySlot: (slot: number, statAlignment: string) => void;
  setSpBySlot: (slot: number, stat: keyof ChampionsSpSpread, value: number) => void;
  setMegaStoneBySlot: (slot: number, megaStone: string) => void;
  setUseMegaByDefaultBySlot: (slot: number, enabled: boolean) => void;
  addBattlePlan: (format: "single" | "double") => void;
  addBattlePlanFromTemplate: (template: {
    name: string;
    format: "single" | "double";
    matchupLabel: string;
    winConditionHint: string;
    avoidHint: string;
  }) => void;
  duplicateBattlePlan: (planId: string) => void;
  updateBattlePlan: (planId: string, patch: Partial<ChampionsBattlePlan>) => void;
  removeBattlePlan: (planId: string) => void;
  clearSlot: (slot: number) => void;
  clearTeam: () => void;
  loadTeam: (team: ChampionsTeam) => void;
  setSourcePreset: (sourcePresetId: string | null, sourcePresetName?: string | null) => void;
};

function createPlanId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `plan-${Date.now()}-${Math.floor(Math.random() * 100_000)}`;
}

function updateSlot(
  team: ChampionsTeam,
  slot: number,
  updater: (value: ChampionsPokemon) => ChampionsPokemon,
): ChampionsTeam {
  if (!Number.isInteger(slot) || slot < 1 || slot > SLOT_COUNT) {
    return team;
  }
  return {
    ...team,
    pokemon: team.pokemon.map((entry) => (entry.slot === slot ? updater(entry) : entry)),
  };
}

export const useChampionsTeamStore = create<ChampionsTeamStoreState>()(
  persist(
    (set) => ({
      team: createEmptyTeam(),
      sourcePresetId: null,
      sourcePresetName: null,
      setTeamName: (name) =>
        set((state) => ({ team: { ...state.team, name: name.trim() || "Untitled Champions Team" } })),
      setFormatSupport: (formatSupport) => set((state) => ({ team: { ...state.team, formatSupport } })),
      setFormat: (format) => set((state) => ({ team: { ...state.team, format } })),
      setRulesetId: (rulesetId) =>
        set((state) => ({ team: { ...state.team, rulesetId: rulesetId.trim() || CHAMPIONS_RULESET_ID } })),
      setTeamNotes: (teamNotes) => set((state) => ({ team: { ...state.team, teamNotes } })),
      setPokemonBySlot: (slot, payload) =>
        set((state) => ({
          team: updateSlot(state.team, slot, (entry) => ({
            ...entry,
            pokemonId: payload.pokemonId,
            pokemonName: payload.pokemonName,
          })),
        })),
      setAbilityBySlot: (slot, ability) =>
        set((state) => ({
          team: updateSlot(state.team, slot, (entry) => ({ ...entry, ability })),
        })),
      setItemBySlot: (slot, item) =>
        set((state) => ({
          team: updateSlot(state.team, slot, (entry) => ({ ...entry, item })),
        })),
      setMoveBySlot: (slot, moveSlot, move) =>
        set((state) => ({
          team: updateSlot(state.team, slot, (entry) => ({
            ...entry,
            moves: entry.moves.map((currentMove, idx) => (idx === moveSlot - 1 ? move : currentMove)),
          })),
        })),
      setStatAlignmentBySlot: (slot, statAlignment) =>
        set((state) => ({
          team: updateSlot(state.team, slot, (entry) => ({ ...entry, statAlignment })),
        })),
      setSpBySlot: (slot, stat, value) =>
        set((state) => ({
          team: updateSlot(state.team, slot, (entry) => ({
            ...entry,
            sp: {
              ...entry.sp,
              [stat]: (() => {
                const requested = Math.max(0, Math.min(32, Math.floor(Number.isFinite(value) ? value : 0)));
                const otherStatsTotal =
                  entry.sp.hp +
                  entry.sp.atk +
                  entry.sp.def +
                  entry.sp.spa +
                  entry.sp.spd +
                  entry.sp.spe -
                  entry.sp[stat];
                const maxAllowedForThisStat = Math.max(0, Math.min(32, 66 - otherStatsTotal));
                return Math.min(requested, maxAllowedForThisStat);
              })(),
            },
          })),
        })),
      setMegaStoneBySlot: (slot, megaStone) =>
        set((state) => ({
          team: updateSlot(state.team, slot, (entry) => ({ ...entry, megaStone })),
        })),
      setUseMegaByDefaultBySlot: (slot, enabled) =>
        set((state) => ({
          team: updateSlot(state.team, slot, (entry) => ({ ...entry, useMegaByDefault: enabled })),
        })),
      addBattlePlan: (format) =>
        set((state) => ({
          team: {
            ...state.team,
            battlePlans: [
              ...state.team.battlePlans,
              {
                id: createPlanId(),
                name: format === "single" ? "New Singles Plan" : "New Doubles Plan",
                format,
                matchupLabel: "Safe Default",
                selectedPokemonIds: [],
                leadPokemonIds: [],
                backupPokemonIds: [],
                winConditionNote: "",
                avoidNote: "",
                generalNote: "",
              },
            ],
          },
        })),
      addBattlePlanFromTemplate: (template) =>
        set((state) => ({
          team: {
            ...state.team,
            battlePlans: [
              ...state.team.battlePlans,
              {
                id: createPlanId(),
                name: template.name,
                format: template.format,
                matchupLabel: template.matchupLabel,
                selectedPokemonIds: [],
                leadPokemonIds: [],
                backupPokemonIds: [],
                winConditionNote: template.winConditionHint,
                avoidNote: template.avoidHint,
                generalNote: "",
              },
            ],
          },
        })),
      duplicateBattlePlan: (planId) =>
        set((state) => {
          const source = state.team.battlePlans.find((plan) => plan.id === planId);
          if (!source) {
            return state;
          }
          return {
            team: {
              ...state.team,
              battlePlans: [
                ...state.team.battlePlans,
                {
                  ...source,
                  id: createPlanId(),
                  name: `${source.name} (Copy)`,
                },
              ],
            },
          };
        }),
      updateBattlePlan: (planId, patch) =>
        set((state) => ({
          team: {
            ...state.team,
            battlePlans: state.team.battlePlans.map((plan) =>
              plan.id === planId ? { ...plan, ...patch } : plan,
            ),
          },
        })),
      removeBattlePlan: (planId) =>
        set((state) => ({
          team: {
            ...state.team,
            battlePlans: state.team.battlePlans.filter((plan) => plan.id !== planId),
          },
        })),
      clearSlot: (slot) =>
        set((state) => ({
          team: updateSlot(state.team, slot, () => createEmptySlot(slot)),
        })),
      clearTeam: () =>
        set(() => ({
          team: createEmptyTeam(),
          sourcePresetId: null,
          sourcePresetName: null,
        })),
      setSourcePreset: (sourcePresetId, sourcePresetName = null) =>
        set(() => ({
          sourcePresetId,
          sourcePresetName: sourcePresetName ?? null,
        })),
      loadTeam: (team) =>
        set((state) => ({
          team: {
            ...createEmptyTeam(),
            ...team,
            mode: "champions",
            pokemon: Array.from({ length: SLOT_COUNT }, (_, index) => {
              const slot = index + 1;
              const existing = team.pokemon.find((entry) => entry.slot === slot);
              return existing
                ? {
                    ...createEmptySlot(slot),
                    ...existing,
                    slot,
                    id: existing.id || `slot-${slot}`,
                    moves: Array.from({ length: 4 }, (_, moveIndex) => existing.moves[moveIndex] ?? ""),
                  }
                : createEmptySlot(slot);
            }),
            battlePlans: Array.isArray(team.battlePlans) ? team.battlePlans : [],
          },
          sourcePresetId: state.sourcePresetId,
          sourcePresetName: state.sourcePresetName,
        })),
    }),
    {
      name: CHAMPIONS_TEAM_STORAGE_KEY,
      storage:
        typeof window === "undefined"
          ? undefined
          : createJSONStorage(() => localStorage),
      partialize: (state) => ({
        team: state.team,
        sourcePresetId: state.sourcePresetId,
        sourcePresetName: state.sourcePresetName,
      }),
    },
  ),
);
