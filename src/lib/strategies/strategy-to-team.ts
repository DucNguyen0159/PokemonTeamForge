import type { StrategyTeam } from "@/types/strategy";
import type { Team } from "@/types/team";

export function strategyTeamToBuilderTeam(strategy: StrategyTeam): Team {
  const emptySlots: Team["pokemon"] = Array.from({ length: 6 }, (_, index) => ({
    slot: index + 1,
    pokemon: null,
    selectedAbility: null,
    selectedItem: null,
    moves: [1, 2, 3, 4].map((moveSlot) => ({
      slot: moveSlot as 1 | 2 | 3 | 4,
      move: null,
    })),
    isShiny: false,
  }));

  strategy.pokemon.slice(0, 6).forEach((entry, index) => {
    emptySlots[index] = {
      ...emptySlots[index],
      pokemon: entry.pokemon,
      selectedAbility: entry.ability,
      selectedItem: entry.item,
      moves: [1, 2, 3, 4].map((slotNumber) => ({
        slot: slotNumber as 1 | 2 | 3 | 4,
        move: entry.moves[slotNumber - 1] ?? null,
      })),
    };
  });

  return {
    name: strategy.name,
    format: strategy.format,
    pokemon: emptySlots,
  };
}

