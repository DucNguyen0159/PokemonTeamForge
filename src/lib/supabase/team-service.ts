"use client";

import { MOCK_ITEMS } from "@/data/mock-items";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { toFriendlySupabaseMessage } from "@/lib/supabase/errors";
import type { BattleFormat } from "@/types/shared";
import type { SavedTeamSummary } from "@/types/saved-team";
import type { Team, TeamPokemon } from "@/types/team";
import type { PokemonDetail } from "@/types/pokemon";

type TeamRow = {
  id: string;
  user_id: string;
  name: string;
  format: string;
  is_public: boolean | null;
  created_at: string;
  updated_at: string;
};

type TeamPokemonRow = {
  id: string;
  team_id: string;
  slot: number;
  pokemon_id: number;
  ability_id: number | null;
  item_id: number | null;
  move_1_id: number | null;
  move_2_id: number | null;
  move_3_id: number | null;
  move_4_id: number | null;
  is_shiny: boolean | null;
};

type TeamWithPokemonRows = TeamRow & {
  team_pokemon: TeamPokemonRow[] | null;
};

const TEAM_SLOT_COUNT = 6;

function toBattleFormat(format: string | null | undefined): BattleFormat {
  if (format === "doubles" || format === "triples") {
    return format;
  }
  return "singles";
}

function createEmptySlot(slot: number): TeamPokemon {
  return {
    slot,
    pokemon: null,
    selectedAbility: null,
    selectedItem: null,
    moves: [1, 2, 3, 4].map((moveSlot) => ({
      slot: moveSlot as 1 | 2 | 3 | 4,
      move: null,
    })),
    isShiny: false,
  };
}

function createEmptyTeam(format: BattleFormat): Team {
  return {
    name: "Untitled Team",
    format,
    pokemon: Array.from({ length: TEAM_SLOT_COUNT }, (_, index) =>
      createEmptySlot(index + 1),
    ),
  };
}

async function fetchPokemonById(id: number): Promise<PokemonDetail | null> {
  const response = await fetch(`/api/pokemon/${id}`);
  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    success: boolean;
    data?: PokemonDetail;
  };

  if (!payload.success || !payload.data) {
    return null;
  }

  return payload.data;
}

async function ensureAuthenticatedUserId(): Promise<string> {
  const supabase = getSupabaseBrowserClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Please sign in to manage saved teams.");
  }

  return user.id;
}

function mapTeamRowToSummary(row: TeamRow): SavedTeamSummary {
  return {
    id: row.id,
    name: row.name,
    format: toBattleFormat(row.format),
    isPublic: row.is_public ?? false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowsFromTeam(teamId: string, team: Team): Omit<TeamPokemonRow, "id">[] {
  return team.pokemon
    .filter((slot) => slot.pokemon)
    .map((slot) => ({
      team_id: teamId,
      slot: slot.slot,
      pokemon_id: slot.pokemon!.id,
      ability_id: slot.selectedAbility?.id ?? null,
      item_id: slot.selectedItem?.id ?? null,
      move_1_id: slot.moves.find((move) => move.slot === 1)?.move?.id ?? null,
      move_2_id: slot.moves.find((move) => move.slot === 2)?.move?.id ?? null,
      move_3_id: slot.moves.find((move) => move.slot === 3)?.move?.id ?? null,
      move_4_id: slot.moves.find((move) => move.slot === 4)?.move?.id ?? null,
      is_shiny: slot.isShiny ?? false,
    }));
}

async function hydrateTeam(row: TeamWithPokemonRows): Promise<Team> {
  const baseTeam = createEmptyTeam(toBattleFormat(row.format));
  const teamRows = row.team_pokemon ?? [];

  const pokemonBySlot = new Map<
    number,
    {
      detail: PokemonDetail | null;
      row: TeamPokemonRow;
    }
  >();

  const detailEntries = await Promise.all(
    teamRows.map(async (teamPokemon) => ({
      teamPokemon,
      detail: await fetchPokemonById(teamPokemon.pokemon_id),
    })),
  );

  detailEntries.forEach((entry) => {
    pokemonBySlot.set(entry.teamPokemon.slot, {
      detail: entry.detail,
      row: entry.teamPokemon,
    });
  });

  const hydratedSlots = baseTeam.pokemon.map((slot) => {
    const hydrated = pokemonBySlot.get(slot.slot);
    if (!hydrated || !hydrated.detail) {
      return slot;
    }

    const detail = hydrated.detail;
    const rowData = hydrated.row;

    return {
      ...slot,
      pokemon: detail,
      selectedAbility:
        detail.abilities.find((ability) => ability.id === rowData.ability_id) ??
        null,
      selectedItem:
        MOCK_ITEMS.find((item) => item.id === rowData.item_id) ?? null,
      moves: [
        {
          slot: 1 as const,
          move:
            detail.moves.find((entry) => entry.id === rowData.move_1_id) ?? null,
        },
        {
          slot: 2 as const,
          move:
            detail.moves.find((entry) => entry.id === rowData.move_2_id) ?? null,
        },
        {
          slot: 3 as const,
          move:
            detail.moves.find((entry) => entry.id === rowData.move_3_id) ?? null,
        },
        {
          slot: 4 as const,
          move:
            detail.moves.find((entry) => entry.id === rowData.move_4_id) ?? null,
        },
      ],
      isShiny: rowData.is_shiny ?? false,
    };
  });

  return {
    ...baseTeam,
    id: row.id,
    userId: row.user_id,
    name: row.name,
    format: toBattleFormat(row.format),
    isPublic: row.is_public ?? false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    pokemon: hydratedSlots,
  };
}

export async function listUserTeams(): Promise<SavedTeamSummary[]> {
  try {
    const supabase = getSupabaseBrowserClient();
    await ensureAuthenticatedUserId();
    const { data, error } = await supabase
      .from("teams")
      .select("id, user_id, name, format, is_public, created_at, updated_at")
      .order("updated_at", { ascending: false });

    if (error) {
      throw error;
    }

    return (data as TeamRow[]).map(mapTeamRowToSummary);
  } catch (error) {
    throw new Error(
      toFriendlySupabaseMessage(error, "Unable to load your saved teams."),
    );
  }
}

export async function loadSavedTeamById(teamId: string): Promise<Team> {
  try {
    const supabase = getSupabaseBrowserClient();
    await ensureAuthenticatedUserId();
    const { data, error } = await supabase
      .from("teams")
      .select(
        "id, user_id, name, format, is_public, created_at, updated_at, team_pokemon(id, team_id, slot, pokemon_id, ability_id, item_id, move_1_id, move_2_id, move_3_id, move_4_id, is_shiny)",
      )
      .eq("id", teamId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error("Team not found.");
    }

    return await hydrateTeam(data as TeamWithPokemonRows);
  } catch (error) {
    throw new Error(
      toFriendlySupabaseMessage(error, "Unable to load this team right now."),
    );
  }
}

export async function saveTeam(team: Team): Promise<SavedTeamSummary> {
  try {
    const supabase = getSupabaseBrowserClient();
    const userId = await ensureAuthenticatedUserId();

    const { data: createdTeam, error: teamError } = await supabase
      .from("teams")
      .insert({
        user_id: userId,
        name: team.name.trim() || "Untitled Team",
        format: team.format,
        is_public: false,
      })
      .select("id, user_id, name, format, is_public, created_at, updated_at")
      .single();

    if (teamError || !createdTeam) {
      throw teamError ?? new Error("Unable to create team.");
    }

    const teamRows = rowsFromTeam(createdTeam.id, team);
    if (teamRows.length > 0) {
      const { error: teamPokemonError } = await supabase
        .from("team_pokemon")
        .insert(teamRows);

      if (teamPokemonError) {
        throw teamPokemonError;
      }
    }

    return mapTeamRowToSummary(createdTeam as TeamRow);
  } catch (error) {
    throw new Error(
      toFriendlySupabaseMessage(error, "Unable to save your team right now."),
    );
  }
}

export async function updateSavedTeam(teamId: string, team: Team): Promise<void> {
  try {
    const supabase = getSupabaseBrowserClient();
    await ensureAuthenticatedUserId();

    const { error: teamError } = await supabase
      .from("teams")
      .update({
        name: team.name.trim() || "Untitled Team",
        format: team.format,
        updated_at: new Date().toISOString(),
      })
      .eq("id", teamId);

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

    const rows = rowsFromTeam(teamId, team);
    if (rows.length > 0) {
      const { error: insertError } = await supabase.from("team_pokemon").insert(rows);

      if (insertError) {
        throw insertError;
      }
    }
  } catch (error) {
    throw new Error(
      toFriendlySupabaseMessage(error, "Unable to update this saved team."),
    );
  }
}

export async function renameSavedTeam(
  teamId: string,
  name: string,
): Promise<void> {
  const normalizedName = name.trim() || "Untitled Team";

  try {
    const supabase = getSupabaseBrowserClient();
    await ensureAuthenticatedUserId();

    const { error } = await supabase
      .from("teams")
      .update({
        name: normalizedName,
        updated_at: new Date().toISOString(),
      })
      .eq("id", teamId);

    if (error) {
      throw error;
    }
  } catch (error) {
    throw new Error(
      toFriendlySupabaseMessage(error, "Unable to rename this team right now."),
    );
  }
}

export async function deleteSavedTeam(teamId: string): Promise<void> {
  try {
    const supabase = getSupabaseBrowserClient();
    await ensureAuthenticatedUserId();
    const { error } = await supabase.from("teams").delete().eq("id", teamId);

    if (error) {
      throw error;
    }
  } catch (error) {
    throw new Error(
      toFriendlySupabaseMessage(error, "Unable to delete this saved team."),
    );
  }
}
