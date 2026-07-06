import { slotSpTotal } from "@/lib/champions/sp-budget";
import type { ChampionsPokemon } from "@/types/champions";

export type SlotCompletionStatus = "empty" | "partial" | "complete";

export function getSlotCompletionStatus(slot: ChampionsPokemon): SlotCompletionStatus {
  if (!slot.pokemonName.trim()) {
    return "empty";
  }
  const moveCount = slot.moves.filter((move) => move.trim().length > 0).length;
  const spTotal = slotSpTotal(slot.sp);
  const hasAbility = Boolean(slot.ability.trim());
  const isComplete =
    moveCount === 4 && spTotal === 66 && hasAbility && Boolean(slot.item?.trim());
  if (isComplete) {
    return "complete";
  }
  return "partial";
}

export const SLOT_COMPLETION_LABEL: Record<Exclude<SlotCompletionStatus, "empty">, string> = {
  partial: "Incomplete",
  complete: "Ready",
};
