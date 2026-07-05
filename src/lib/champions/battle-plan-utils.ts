import type { ChampionsBattlePlan, ChampionsFormat, ChampionsPokemon, ChampionsTeam } from "@/types/champions";

export type SlotOption = {
  token: string;
  label: string;
  slot: ChampionsPokemon;
};

export function slotTokenFromNumber(slot: number): string {
  return `slot-${slot}`;
}

export function slotTokenToNumber(token: string): number | null {
  const normalized = token.trim().toLowerCase();
  const value = normalized.startsWith("slot-")
    ? Number(normalized.replace("slot-", ""))
    : Number(normalized);
  if (!Number.isInteger(value) || value < 1 || value > 6) {
    return null;
  }
  return value;
}

export function getFormatLimits(format: ChampionsFormat) {
  return {
    selected: format === "single" ? 3 : 4,
    leads: format === "single" ? 1 : 2,
  };
}

export function formatLabel(format: ChampionsFormat): string {
  return format === "single" ? "Singles 3v3" : "Doubles 4v4";
}

export function toggleToken(list: string[], token: string, maxCount: number): string[] {
  if (list.includes(token)) {
    return list.filter((value) => value !== token);
  }
  if (list.length >= maxCount) {
    return list;
  }
  return [...list, token];
}

export function buildSlotOptions(team: ChampionsTeam): SlotOption[] {
  return team.pokemon
    .filter((slot) => slot.pokemonName.trim().length > 0)
    .map((slot) => ({
      token: slotTokenFromNumber(slot.slot),
      label: `Slot ${slot.slot}: ${slot.pokemonName}`,
      slot,
    }));
}

export function summarizeSpFocus(sp: ChampionsPokemon["sp"]): string {
  const entries = (
    [
      ["HP", sp.hp],
      ["Atk", sp.atk],
      ["Def", sp.def],
      ["SpA", sp.spa],
      ["SpD", sp.spd],
      ["Spe", sp.spe],
    ] as const
  )
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([label, value]) => `${value} ${label}`);
  return entries.length > 0 ? entries.join(" / ") : "No SP allocated";
}

export function togglePlanSelection(
  plan: ChampionsBattlePlan,
  token: string,
): Partial<ChampionsBattlePlan> {
  const { selected: selectedLimit } = getFormatLimits(plan.format);
  const nextSelected = toggleToken(plan.selectedPokemonIds, token, selectedLimit);
  const wasRemoved = plan.selectedPokemonIds.includes(token) && !nextSelected.includes(token);
  return {
    selectedPokemonIds: nextSelected,
    leadPokemonIds: wasRemoved
      ? plan.leadPokemonIds.filter((entry) => entry !== token)
      : plan.leadPokemonIds,
    backupPokemonIds: wasRemoved
      ? (plan.backupPokemonIds ?? []).filter((entry) => entry !== token)
      : plan.backupPokemonIds,
  };
}

export function togglePlanLead(plan: ChampionsBattlePlan, token: string): Partial<ChampionsBattlePlan> {
  const { leads: leadLimit } = getFormatLimits(plan.format);
  if (!plan.selectedPokemonIds.includes(token)) {
    return {};
  }
  return {
    leadPokemonIds: toggleToken(plan.leadPokemonIds, token, leadLimit),
  };
}

export function togglePlanBackup(plan: ChampionsBattlePlan, token: string): Partial<ChampionsBattlePlan> {
  const { selected: selectedLimit } = getFormatLimits(plan.format);
  if (!plan.selectedPokemonIds.includes(token)) {
    return {};
  }
  return {
    backupPokemonIds: toggleToken(plan.backupPokemonIds ?? [], token, selectedLimit),
  };
}
