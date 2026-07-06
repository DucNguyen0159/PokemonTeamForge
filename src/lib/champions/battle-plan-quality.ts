import { isLikelyMegaStone } from "@/lib/champions/ruleset-legality";
import {
  getFormatLimits,
  slotTokenToNumber,
  type SlotOption,
} from "@/lib/champions/battle-plan-utils";
import type { ChampionsBattlePlan, ChampionsTeam } from "@/types/champions";
import type { ChampionsLegalityIssue } from "@/lib/champions/legality";

export function evaluateBattlePlanQuality(
  plan: ChampionsBattlePlan,
  team: ChampionsTeam,
  slotOptions: SlotOption[],
): ChampionsLegalityIssue[] {
  const issues: ChampionsLegalityIssue[] = [];
  const occupiedSlots = new Set(
    team.pokemon.filter((slot) => slot.pokemonName.trim()).map((slot) => slot.slot),
  );
  const { selected: selectedLimit, leads: leadLimit } = getFormatLimits(plan.format);
  const availableTokens = new Set(slotOptions.map((option) => option.token));

  const selectedSlots = plan.selectedPokemonIds
    .map(slotTokenToNumber)
    .filter((slot): slot is number => slot !== null);
  const leadSlots = plan.leadPokemonIds
    .map(slotTokenToNumber)
    .filter((slot): slot is number => slot !== null);

  if (selectedSlots.length === 0) {
    issues.push({ severity: "warning", message: `${plan.name}: no Pokémon selected yet.` });
  } else if (selectedSlots.length !== selectedLimit) {
    issues.push({
      severity: "warning",
      message: `${plan.name}: pick ${selectedLimit} Pokémon for ${plan.format === "single" ? "Singles" : "Doubles"}.`,
    });
  }

  if (leadSlots.length === 0) {
    issues.push({ severity: "warning", message: `${plan.name}: no lead Pokémon selected.` });
  } else if (leadSlots.length !== leadLimit) {
    issues.push({
      severity: "warning",
      message: `${plan.name}: pick ${leadLimit} lead Pokémon.`,
    });
  }

  const leadsNotSelected = plan.leadPokemonIds.filter(
    (token) => !plan.selectedPokemonIds.includes(token),
  );
  if (leadsNotSelected.length > 0) {
    issues.push({
      severity: "warning",
      message: `${plan.name}: a lead must also be in the selected group.`,
    });
  }

  const invalidTokens = [...plan.selectedPokemonIds, ...plan.leadPokemonIds].filter(
    (token) => !availableTokens.has(token),
  );
  if (invalidTokens.length > 0) {
    issues.push({
      severity: "warning",
      message: `${plan.name}: references roster slots that are currently empty.`,
    });
  }

  const emptyRoster = occupiedSlots.size < 6;
  if (emptyRoster && selectedSlots.some((slot) => !occupiedSlots.has(slot))) {
    issues.push({
      severity: "warning",
      message: `${plan.name}: fill the roster in Team Builder before finalizing this plan.`,
    });
  }

  if (!plan.winConditionNote?.trim()) {
    issues.push({
      severity: "warning",
      message: `${plan.name}: add a win condition note.`,
    });
  }

  if (!plan.avoidNote?.trim()) {
    issues.push({
      severity: "warning",
      message: `${plan.name}: add an avoid / danger note.`,
    });
  }

  const teamHasMega = team.pokemon.some((slot) => slot.item?.trim() && isLikelyMegaStone(slot.item));
  const selectedHasMega = plan.selectedPokemonIds.some((token) => {
    const slotNumber = slotTokenToNumber(token);
    if (!slotNumber) {
      return false;
    }
    const slot = team.pokemon.find((entry) => entry.slot === slotNumber);
    return Boolean(slot?.item?.trim() && isLikelyMegaStone(slot.item));
  });
  if (teamHasMega && !selectedHasMega) {
    issues.push({
      severity: "warning",
      message: `${plan.name}: roster includes a Mega user that is not in this plan.`,
    });
  }

  return issues;
}
