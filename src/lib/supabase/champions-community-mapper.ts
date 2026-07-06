import { CHAMPIONS_RULESET_ID } from "@/data/champions";
import type {
  ChampionsCommunityPokemonPreview,
  ChampionsCommunityTeamDetail,
} from "@/types/champions-community";
import type { ChampionsBattlePlan, ChampionsPokemon, ChampionsTeam } from "@/types/champions";

function slotsToTokens(slots: number[]): string[] {
  return slots
    .filter((slot) => Number.isInteger(slot) && slot >= 1 && slot <= 6)
    .map((slot) => `slot-${slot}`);
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
    sp: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
    megaStone: "",
    useMegaByDefault: false,
  };
}

function previewToSlot(member: ChampionsCommunityPokemonPreview): ChampionsPokemon {
  return {
    ...createEmptySlot(member.slot),
    pokemonId: member.pokemonId,
    pokemonName: member.pokemonName,
    ability: member.ability ?? "",
    item: member.item ?? "",
    moves: member.moves ?? ["", "", "", ""],
    statAlignment: member.statAlignment ?? "Serious",
    sp: member.sp ?? { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
    useMegaByDefault: member.useMegaByDefault ?? false,
  };
}

export function communityDetailToChampionsTeam(detail: ChampionsCommunityTeamDetail): ChampionsTeam {
  const pokemon = Array.from({ length: 6 }, (_, index) => {
    const slot = index + 1;
    const member = detail.pokemon.find((entry) => entry.slot === slot);
    return member ? previewToSlot(member) : createEmptySlot(slot);
  });

  const battlePlans: ChampionsBattlePlan[] = detail.battlePlans.map((plan) => ({
    id: crypto.randomUUID(),
    name: plan.name,
    format: plan.format,
    matchupLabel: plan.matchupLabel,
    selectedPokemonIds: slotsToTokens(plan.selectedPokemonSlots),
    leadPokemonIds: slotsToTokens(plan.leadPokemonSlots),
    backupPokemonIds: slotsToTokens(plan.backupPokemonSlots),
    winConditionNote: plan.winConditionNote ?? "",
    avoidNote: plan.avoidNote ?? "",
    generalNote: plan.generalNote ?? "",
  }));

  return {
    name: `${detail.name} (Fork)`,
    mode: "champions",
    format: detail.formatSupport === "double" ? "doubles" : "singles",
    formatSupport: detail.formatSupport,
    rulesetId: detail.rulesetId ?? CHAMPIONS_RULESET_ID,
    teamNotes: detail.teamNotes ?? "",
    pokemon,
    battlePlans,
    isPublic: false,
  };
}
