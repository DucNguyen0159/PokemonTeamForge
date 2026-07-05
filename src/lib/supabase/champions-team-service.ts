"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { toFriendlySupabaseMessage } from "@/lib/supabase/errors";
import { resolveAuthenticatedUserId } from "@/lib/supabase/team-service";
import type { ChampionsBattlePlan, ChampionsPokemon, ChampionsTeam } from "@/types/champions";

type ChampionsTeamRow = {
  id: string;
  user_id: string;
  name: string;
  format: "singles" | "doubles" | "triples";
  is_public: boolean | null;
  created_at: string;
  updated_at: string;
  mode: "standard" | "champions";
  format_support: "single" | "double" | "both" | null;
  champions_ruleset_id: string | null;
  team_notes: string | null;
};

type ChampionsTeamPokemonRow = {
  team_id: string;
  slot: number;
  pokemon_id: number;
  stat_alignment: string | null;
  sp_hp: number | null;
  sp_atk: number | null;
  sp_def: number | null;
  sp_spa: number | null;
  sp_spd: number | null;
  sp_spe: number | null;
  use_mega_by_default: boolean | null;
  ability_id: number | null;
  item_id: number | null;
  move_1_id: number | null;
  move_2_id: number | null;
  move_3_id: number | null;
  move_4_id: number | null;
};

type ChampionsBattlePlanRow = {
  id: string;
  team_id: string;
  name: string;
  format: "single" | "double";
  matchup_label: string;
  selected_pokemon_slots: number[] | null;
  lead_pokemon_slots: number[] | null;
  backup_pokemon_slots: number[] | null;
  win_condition_note: string | null;
  avoid_note: string | null;
  general_note: string | null;
};

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

function slotTokenToNumber(token: string): number | null {
  const normalized = token.trim().toLowerCase();
  const fromToken = normalized.startsWith("slot-") ? Number(normalized.replace("slot-", "")) : Number(normalized);
  if (!Number.isInteger(fromToken) || fromToken < 1 || fromToken > 6) {
    return null;
  }
  return fromToken;
}

function slotsToTokens(slots: number[] | null | undefined): string[] {
  return (slots ?? [])
    .filter((slot) => Number.isInteger(slot) && slot >= 1 && slot <= 6)
    .map((slot) => `slot-${slot}`);
}

function toBattlePlanRows(teamId: string, plans: ChampionsBattlePlan[]) {
  return plans.map((plan) => ({
    id: plan.id,
    team_id: teamId,
    name: plan.name,
    format: plan.format,
    matchup_label: plan.matchupLabel,
    selected_pokemon_slots: plan.selectedPokemonIds
      .map(slotTokenToNumber)
      .filter((slot): slot is number => slot !== null),
    lead_pokemon_slots: plan.leadPokemonIds
      .map(slotTokenToNumber)
      .filter((slot): slot is number => slot !== null),
    backup_pokemon_slots: (plan.backupPokemonIds ?? [])
      .map(slotTokenToNumber)
      .filter((slot): slot is number => slot !== null),
    win_condition_note: plan.winConditionNote ?? null,
    avoid_note: plan.avoidNote ?? null,
    general_note: plan.generalNote ?? null,
  }));
}

function toTeamFormat(formatSupport: ChampionsTeam["formatSupport"]): ChampionsTeam["format"] {
  if (formatSupport === "double") {
    return "doubles";
  }
  if (formatSupport === "both") {
    return "doubles";
  }
  return "singles";
}

function toFormatSupport(
  formatSupport: ChampionsTeamRow["format_support"],
): ChampionsTeam["formatSupport"] {
  if (formatSupport === "double" || formatSupport === "both") {
    return formatSupport;
  }
  return "single";
}

async function lookupIdsByNames(
  supabase: ReturnType<typeof getSupabaseBrowserClient>,
  table: "abilities" | "items" | "moves",
  names: string[],
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  const unique = Array.from(new Set(names.map((name) => name.trim()).filter(Boolean)));
  if (unique.length === 0) {
    return map;
  }
  const { data } = await supabase.from(table).select("id, name").in("name", unique);
  (data as Array<{ id: number; name: string }> | null)?.forEach((entry) => {
    map.set(entry.name, entry.id);
  });
  return map;
}

async function slotRowsFromTeamWithIds(teamId: string, pokemon: ChampionsPokemon[]) {
  const supabase = getSupabaseBrowserClient();
  const filled = pokemon.filter((slot) => slot.pokemonId);
  const abilityNames = filled.map((slot) => slot.ability).filter(Boolean);
  const itemNames = filled.map((slot) => slot.item ?? "").filter(Boolean);
  const moveNames = filled.flatMap((slot) => slot.moves).filter(Boolean);

  const [abilities, items, moves] = await Promise.all([
    lookupIdsByNames(supabase, "abilities", abilityNames),
    lookupIdsByNames(supabase, "items", itemNames),
    lookupIdsByNames(supabase, "moves", moveNames),
  ]);

  return filled.map((slot) => ({
    team_id: teamId,
    slot: slot.slot,
    pokemon_id: slot.pokemonId as number,
    stat_alignment: slot.statAlignment || null,
    sp_hp: slot.sp.hp,
    sp_atk: slot.sp.atk,
    sp_def: slot.sp.def,
    sp_spa: slot.sp.spa,
    sp_spd: slot.sp.spd,
    sp_spe: slot.sp.spe,
    use_mega_by_default: slot.useMegaByDefault ?? false,
    ability_id: slot.ability.trim() ? abilities.get(slot.ability.trim()) ?? null : null,
    item_id: slot.item?.trim() ? items.get(slot.item.trim()) ?? null : null,
    move_1_id: slot.moves[0]?.trim() ? moves.get(slot.moves[0].trim()) ?? null : null,
    move_2_id: slot.moves[1]?.trim() ? moves.get(slot.moves[1].trim()) ?? null : null,
    move_3_id: slot.moves[2]?.trim() ? moves.get(slot.moves[2].trim()) ?? null : null,
    move_4_id: slot.moves[3]?.trim() ? moves.get(slot.moves[3].trim()) ?? null : null,
  }));
}

export async function loadChampionsTeamById(
  teamId: string,
  trustedUserId?: string | null,
): Promise<ChampionsTeam> {
  try {
    const supabase = getSupabaseBrowserClient();
    const userId = await resolveAuthenticatedUserId(trustedUserId);
    const { data, error } = await supabase
      .from("teams")
      .select(
        "id, user_id, name, format, is_public, created_at, updated_at, mode, format_support, champions_ruleset_id, team_notes, team_pokemon(team_id, slot, pokemon_id, stat_alignment, sp_hp, sp_atk, sp_def, sp_spa, sp_spd, sp_spe, use_mega_by_default, ability_id, item_id, move_1_id, move_2_id, move_3_id, move_4_id), champions_battle_plans(id, team_id, name, format, matchup_label, selected_pokemon_slots, lead_pokemon_slots, backup_pokemon_slots, win_condition_note, avoid_note, general_note)",
      )
      .eq("id", teamId)
      .eq("user_id", userId)
      .eq("mode", "champions")
      .maybeSingle();

    if (error) {
      throw error;
    }
    if (!data) {
      throw new Error("Champions team not found.");
    }

    const teamRow = data as ChampionsTeamRow & {
      team_pokemon: ChampionsTeamPokemonRow[] | null;
      champions_battle_plans: ChampionsBattlePlanRow[] | null;
    };
    const teamPokemonRows = teamRow.team_pokemon ?? [];
    const pokemonIds = Array.from(new Set(teamPokemonRows.map((entry) => entry.pokemon_id)));
    const abilityIds = Array.from(
      new Set(teamPokemonRows.map((entry) => entry.ability_id).filter((id): id is number => id !== null)),
    );
    const itemIds = Array.from(
      new Set(teamPokemonRows.map((entry) => entry.item_id).filter((id): id is number => id !== null)),
    );
    const moveIds = Array.from(
      new Set(
        teamPokemonRows
          .flatMap((entry) => [entry.move_1_id, entry.move_2_id, entry.move_3_id, entry.move_4_id])
          .filter((id): id is number => id !== null),
      ),
    );

    const [pokemonData, abilityData, itemData, moveData] = await Promise.all([
      pokemonIds.length > 0
        ? supabase.from("pokemon").select("id, name").in("id", pokemonIds)
        : Promise.resolve({ data: [], error: null }),
      abilityIds.length > 0
        ? supabase.from("abilities").select("id, name").in("id", abilityIds)
        : Promise.resolve({ data: [], error: null }),
      itemIds.length > 0
        ? supabase.from("items").select("id, name").in("id", itemIds)
        : Promise.resolve({ data: [], error: null }),
      moveIds.length > 0
        ? supabase.from("moves").select("id, name").in("id", moveIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    const pokemonNameById = new Map<number, string>();
    (pokemonData.data as Array<{ id: number; name: string }> | null)?.forEach((pokemon) => {
      pokemonNameById.set(pokemon.id, pokemon.name);
    });
    const abilityNameById = new Map<number, string>();
    (abilityData.data as Array<{ id: number; name: string }> | null)?.forEach((ability) => {
      abilityNameById.set(ability.id, ability.name);
    });
    const itemNameById = new Map<number, string>();
    (itemData.data as Array<{ id: number; name: string }> | null)?.forEach((item) => {
      itemNameById.set(item.id, item.name);
    });
    const moveNameById = new Map<number, string>();
    (moveData.data as Array<{ id: number; name: string }> | null)?.forEach((move) => {
      moveNameById.set(move.id, move.name);
    });

    const pokemon = Array.from({ length: 6 }, (_, index) => {
      const slot = index + 1;
      const existing = teamPokemonRows.find((entry) => entry.slot === slot);
      if (!existing) {
        return createEmptySlot(slot);
      }
      return {
        ...createEmptySlot(slot),
        pokemonId: existing.pokemon_id,
        pokemonName: pokemonNameById.get(existing.pokemon_id) ?? `#${existing.pokemon_id}`,
        ability: existing.ability_id ? abilityNameById.get(existing.ability_id) ?? "" : "",
        item: existing.item_id ? itemNameById.get(existing.item_id) ?? "" : "",
        moves: [
          existing.move_1_id ? moveNameById.get(existing.move_1_id) ?? "" : "",
          existing.move_2_id ? moveNameById.get(existing.move_2_id) ?? "" : "",
          existing.move_3_id ? moveNameById.get(existing.move_3_id) ?? "" : "",
          existing.move_4_id ? moveNameById.get(existing.move_4_id) ?? "" : "",
        ],
        statAlignment: existing.stat_alignment ?? "Serious",
        sp: {
          hp: existing.sp_hp ?? 0,
          atk: existing.sp_atk ?? 0,
          def: existing.sp_def ?? 0,
          spa: existing.sp_spa ?? 0,
          spd: existing.sp_spd ?? 0,
          spe: existing.sp_spe ?? 0,
        },
        useMegaByDefault: existing.use_mega_by_default ?? false,
      };
    });

    const battlePlans: ChampionsBattlePlan[] = (teamRow.champions_battle_plans ?? []).map((plan) => ({
      id: plan.id,
      name: plan.name,
      format: plan.format,
      matchupLabel: plan.matchup_label,
      selectedPokemonIds: slotsToTokens(plan.selected_pokemon_slots),
      leadPokemonIds: slotsToTokens(plan.lead_pokemon_slots),
      backupPokemonIds: slotsToTokens(plan.backup_pokemon_slots),
      winConditionNote: plan.win_condition_note ?? "",
      avoidNote: plan.avoid_note ?? "",
      generalNote: plan.general_note ?? "",
    }));

    return {
      id: teamRow.id,
      userId: teamRow.user_id,
      name: teamRow.name,
      mode: "champions",
      format: teamRow.format === "doubles" ? "doubles" : "singles",
      formatSupport: toFormatSupport(teamRow.format_support),
      rulesetId: teamRow.champions_ruleset_id ?? "regulation-m-a",
      teamNotes: teamRow.team_notes ?? "",
      battlePlans,
      pokemon,
      isPublic: teamRow.is_public ?? false,
      createdAt: teamRow.created_at,
      updatedAt: teamRow.updated_at,
    };
  } catch (error) {
    throw new Error(
      toFriendlySupabaseMessage(error, "Unable to load this Champions team right now."),
    );
  }
}

export async function saveChampionsTeam(
  team: ChampionsTeam,
  trustedUserId?: string | null,
): Promise<ChampionsTeam> {
  try {
    const supabase = getSupabaseBrowserClient();
    const userId = await resolveAuthenticatedUserId(trustedUserId);

    const { data: createdTeam, error: teamError } = await supabase
      .from("teams")
      .insert({
        user_id: userId,
        name: team.name.trim() || "Untitled Champions Team",
        format: toTeamFormat(team.formatSupport),
        mode: "champions",
        format_support: team.formatSupport,
        champions_ruleset_id: team.rulesetId,
        team_notes: team.teamNotes ?? null,
        is_public: false,
      })
      .select(
        "id, user_id, name, format, is_public, created_at, updated_at, mode, format_support, champions_ruleset_id, team_notes",
      )
      .single();

    if (teamError || !createdTeam) {
      throw teamError ?? new Error("Unable to create Champions team.");
    }

    const slotRows = await slotRowsFromTeamWithIds(createdTeam.id, team.pokemon);
    if (slotRows.length > 0) {
      const { error: slotError } = await supabase.from("team_pokemon").insert(slotRows);
      if (slotError) {
        throw slotError;
      }
    }

    const planRows = toBattlePlanRows(createdTeam.id, team.battlePlans);
    if (planRows.length > 0) {
      const { error: planError } = await supabase
        .from("champions_battle_plans")
        .insert(planRows);
      if (planError) {
        throw planError;
      }
    }

    return {
      ...team,
      id: createdTeam.id,
      userId: createdTeam.user_id,
      isPublic: createdTeam.is_public ?? false,
      createdAt: createdTeam.created_at,
      updatedAt: createdTeam.updated_at,
    };
  } catch (error) {
    throw new Error(
      toFriendlySupabaseMessage(error, "Unable to save your Champions team right now."),
    );
  }
}

export async function updateChampionsTeam(
  teamId: string,
  team: ChampionsTeam,
  trustedUserId?: string | null,
): Promise<void> {
  try {
    const supabase = getSupabaseBrowserClient();
    const userId = await resolveAuthenticatedUserId(trustedUserId);

    const { error: teamError } = await supabase
      .from("teams")
      .update({
        name: team.name.trim() || "Untitled Champions Team",
        format: toTeamFormat(team.formatSupport),
        format_support: team.formatSupport,
        champions_ruleset_id: team.rulesetId,
        team_notes: team.teamNotes ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", teamId)
      .eq("user_id", userId)
      .eq("mode", "champions");

    if (teamError) {
      throw teamError;
    }

    const { error: deleteError } = await supabase
      .from("team_pokemon")
      .delete()
      .eq("team_id", teamId);
    if (deleteError) {
      throw deleteError;
    }

    const slotRows = await slotRowsFromTeamWithIds(teamId, team.pokemon);
    if (slotRows.length > 0) {
      const { error: slotError } = await supabase.from("team_pokemon").insert(slotRows);
      if (slotError) {
        throw slotError;
      }
    }

    const { error: deletePlanError } = await supabase
      .from("champions_battle_plans")
      .delete()
      .eq("team_id", teamId);
    if (deletePlanError) {
      throw deletePlanError;
    }

    const planRows = toBattlePlanRows(teamId, team.battlePlans);
    if (planRows.length > 0) {
      const { error: planError } = await supabase
        .from("champions_battle_plans")
        .insert(planRows);
      if (planError) {
        throw planError;
      }
    }
  } catch (error) {
    throw new Error(
      toFriendlySupabaseMessage(error, "Unable to update this Champions team right now."),
    );
  }
}
