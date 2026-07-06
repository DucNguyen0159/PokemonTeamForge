import type { ChampionsBattlePlan, ChampionsTeam } from "@/types/champions";
import { isLikelyMegaStone, isMegaStoneCompatibleWithSpecies } from "@/lib/champions/ruleset-legality";

export type ChampionsLegalityIssue = {
  severity: "error" | "warning";
  message: string;
};

function slotTokenToNumber(token: string): number | null {
  const normalized = token.trim().toLowerCase();
  const value = normalized.startsWith("slot-")
    ? Number(normalized.replace("slot-", ""))
    : Number(normalized);
  if (!Number.isInteger(value) || value < 1 || value > 6) {
    return null;
  }
  return value;
}

function hasDuplicate(values: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  values.forEach((value) => {
    const normalized = value.trim().toLowerCase();
    if (!normalized) {
      return;
    }
    if (seen.has(normalized)) {
      duplicates.add(value.trim());
      return;
    }
    seen.add(normalized);
  });
  return [...duplicates];
}

function validateBattlePlan(
  plan: ChampionsBattlePlan,
  availableSlots: Set<number>,
  issues: ChampionsLegalityIssue[],
) {
  const selectedLimit = plan.format === "single" ? 3 : 4;
  const leadLimit = plan.format === "single" ? 1 : 2;

  const selectedSlots = plan.selectedPokemonIds
    .map(slotTokenToNumber)
    .filter((slot): slot is number => slot !== null);
  const leadSlots = plan.leadPokemonIds
    .map(slotTokenToNumber)
    .filter((slot): slot is number => slot !== null);
  const backupSlots = (plan.backupPokemonIds ?? [])
    .map(slotTokenToNumber)
    .filter((slot): slot is number => slot !== null);

  if (selectedSlots.length !== selectedLimit) {
    issues.push({
      severity: "warning",
      message: `${plan.name}: expected ${selectedLimit} selected members for ${plan.format}, found ${selectedSlots.length}.`,
    });
  }

  if (leadSlots.length !== leadLimit) {
    issues.push({
      severity: "warning",
      message: `${plan.name}: expected ${leadLimit} lead member(s), found ${leadSlots.length}.`,
    });
  }

  const invalidTokens = [...selectedSlots, ...leadSlots, ...backupSlots].filter(
    (slot) => !availableSlots.has(slot),
  );
  if (invalidTokens.length > 0) {
    issues.push({
      severity: "warning",
      message: `${plan.name}: references slots that are currently empty.`,
    });
  }
}

export function evaluateChampionsTeamLegality(team: ChampionsTeam): ChampionsLegalityIssue[] {
  const issues: ChampionsLegalityIssue[] = [];
  const occupiedSlots = team.pokemon.filter((slot) => slot.pokemonName.trim().length > 0);
  const occupiedSlotNumbers = new Set<number>(occupiedSlots.map((slot) => slot.slot));

  if (!team.name.trim()) {
    issues.push({ severity: "warning", message: "Team name is empty." });
  }

  const duplicateSpecies = hasDuplicate(occupiedSlots.map((slot) => slot.pokemonName));
  duplicateSpecies.forEach((name) => {
    issues.push({
      severity: "error",
      message: `Duplicate species detected: ${name}. Champions rules disallow duplicate species.`,
    });
  });

  const duplicateItems = hasDuplicate(
    occupiedSlots.map((slot) => slot.item ?? "").filter((item) => item.trim().length > 0),
  );
  duplicateItems.forEach((item) => {
    issues.push({
      severity: "error",
      message: `Duplicate item detected: ${item}. Champions rules disallow duplicate held items.`,
    });
  });

  occupiedSlots.forEach((slot) => {
    const totalSp =
      slot.sp.hp + slot.sp.atk + slot.sp.def + slot.sp.spa + slot.sp.spd + slot.sp.spe;
    if (totalSp > 66) {
      issues.push({
        severity: "error",
        message: `Slot ${slot.slot} (${slot.pokemonName}) exceeds SP limit: ${totalSp}/66.`,
      });
    }
    if (totalSp < 66) {
      issues.push({
        severity: "warning",
        message: `Slot ${slot.slot} (${slot.pokemonName}) has ${66 - totalSp} unallocated SP.`,
      });
    }
    if (!slot.ability.trim()) {
      issues.push({
        severity: "warning",
        message: `Slot ${slot.slot} (${slot.pokemonName}) has no ability selected.`,
      });
    }
    if (slot.moves.filter((move) => move.trim().length > 0).length === 0) {
      issues.push({
        severity: "warning",
        message: `Slot ${slot.slot} (${slot.pokemonName}) has no moves selected.`,
      });
    }
    if (slot.item?.trim() && isLikelyMegaStone(slot.item) && !isMegaStoneCompatibleWithSpecies(slot.pokemonName, slot.item)) {
      issues.push({
        severity: "error",
        message: `Slot ${slot.slot} (${slot.pokemonName}) has incompatible Mega Stone item: ${slot.item}.`,
      });
    }
  });

  team.battlePlans.forEach((plan) => validateBattlePlan(plan, occupiedSlotNumbers, issues));
  return issues;
}
