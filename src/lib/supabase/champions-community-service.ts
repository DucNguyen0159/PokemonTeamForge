"use client";

import { COMMUNITY_LIST_LIMIT } from "@/lib/champions/community-ui";
import { communityDetailToChampionsTeam } from "@/lib/supabase/champions-community-mapper";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { toCommunityBrowseErrorMessage, toFriendlySupabaseMessage } from "@/lib/supabase/errors";
import { resolveAuthenticatedUserId } from "@/lib/supabase/team-service";
import { CHAMPIONS_RULESET_ID } from "@/data/champions";
import type {
  ChampionsCommunityComment,
  ChampionsCommunityFormatFilter,
  ChampionsCommunityPokemonPreview,
  ChampionsCommunitySort,
  ChampionsCommunityTeamDetail,
  ChampionsCommunityTeamSummary,
} from "@/types/champions-community";
import type { ChampionsTeam } from "@/types/champions";

const TEAM_POKEMON_SELECT =
  "slot, pokemon_id, stat_alignment, sp_hp, sp_atk, sp_def, sp_spa, sp_spd, sp_spe, use_mega_by_default, ability_id, item_id, move_1_id, move_2_id, move_3_id, move_4_id";

type CommunityTeamRow = {
  id: string;
  user_id: string;
  name: string;
  mode: "standard" | "champions";
  format_support: "single" | "double" | "both" | null;
  champions_ruleset_id: string | null;
  team_notes: string | null;
  created_at: string;
  updated_at: string;
};

type CommunityListTeamRow = CommunityTeamRow & {
  team_pokemon: CommunityTeamPokemonRow[] | null;
};

type CommunityTeamPokemonRow = {
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

type CommunityBattlePlanRow = {
  id: string;
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

type CommunityCommentRow = {
  id: string;
  team_id: string;
  user_id: string;
  body: string;
  created_at: string;
  updated_at: string;
};

type ResolvedSlotRefs = {
  pokemonById: Map<number, { name: string; sprite_normal_url: string | null }>;
  abilityById: Map<number, string>;
  itemById: Map<number, string>;
  moveById: Map<number, string>;
};

async function getOptionalUserId(): Promise<string | null> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch {
    return fallback;
  }
}

async function fetchUsernames(userIds: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const unique = Array.from(new Set(userIds.filter(Boolean)));
  if (unique.length === 0) {
    return map;
  }

  try {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username")
      .in("id", unique);
    if (error) {
      return map;
    }
    (data as Array<{ id: string; username: string }> | null)?.forEach((profile) => {
      map.set(profile.id, profile.username);
    });
  } catch {
    return map;
  }

  return map;
}

async function fetchResolvedSlotRefs(rows: CommunityTeamPokemonRow[]): Promise<ResolvedSlotRefs> {
  const supabase = getSupabaseBrowserClient();
  const pokemonIds = Array.from(new Set(rows.map((row) => row.pokemon_id)));
  const abilityIds = Array.from(
    new Set(rows.map((row) => row.ability_id).filter((id): id is number => id !== null)),
  );
  const itemIds = Array.from(
    new Set(rows.map((row) => row.item_id).filter((id): id is number => id !== null)),
  );
  const moveIds = Array.from(
    new Set(
      rows.flatMap((row) => [row.move_1_id, row.move_2_id, row.move_3_id, row.move_4_id]).filter(
        (id): id is number => id !== null,
      ),
    ),
  );

  const pokemonById = new Map<number, { name: string; sprite_normal_url: string | null }>();
  const abilityById = new Map<number, string>();
  const itemById = new Map<number, string>();
  const moveById = new Map<number, string>();

  const [pokemonResult, abilityResult, itemResult, moveResult] = await Promise.all([
    pokemonIds.length > 0
      ? supabase.from("pokemon").select("id, name, sprite_normal_url").in("id", pokemonIds)
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

  (pokemonResult.data as Array<{ id: number; name: string; sprite_normal_url: string | null }> | null)?.forEach(
    (pokemon) => {
      pokemonById.set(pokemon.id, { name: pokemon.name, sprite_normal_url: pokemon.sprite_normal_url });
    },
  );
  (abilityResult.data as Array<{ id: number; name: string }> | null)?.forEach((ability) => {
    abilityById.set(ability.id, ability.name);
  });
  (itemResult.data as Array<{ id: number; name: string }> | null)?.forEach((item) => {
    itemById.set(item.id, item.name);
  });
  (moveResult.data as Array<{ id: number; name: string }> | null)?.forEach((move) => {
    moveById.set(move.id, move.name);
  });

  return { pokemonById, abilityById, itemById, moveById };
}

function mapPokemonRow(
  row: CommunityTeamPokemonRow,
  refs: ResolvedSlotRefs,
): ChampionsCommunityPokemonPreview {
  const pokemonRef = refs.pokemonById.get(row.pokemon_id);
  const moves = [row.move_1_id, row.move_2_id, row.move_3_id, row.move_4_id].map(
    (moveId) => (moveId ? refs.moveById.get(moveId) : "") ?? "",
  );

  return {
    slot: row.slot,
    pokemonId: row.pokemon_id,
    pokemonName: pokemonRef?.name ?? `#${row.pokemon_id}`,
    spriteNormal: pokemonRef?.sprite_normal_url ?? null,
    ability: row.ability_id ? refs.abilityById.get(row.ability_id) ?? "" : "",
    item: row.item_id ? refs.itemById.get(row.item_id) ?? "" : "",
    statAlignment: row.stat_alignment ?? "Serious",
    sp: {
      hp: row.sp_hp ?? 0,
      atk: row.sp_atk ?? 0,
      def: row.sp_def ?? 0,
      spa: row.sp_spa ?? 0,
      spd: row.sp_spd ?? 0,
      spe: row.sp_spe ?? 0,
    },
    moves,
    useMegaByDefault: row.use_mega_by_default ?? false,
  };
}

async function fetchStarCounts(teamIds: string[]): Promise<Map<string, number>> {
  const supabase = getSupabaseBrowserClient();
  const map = new Map<string, number>();
  if (teamIds.length === 0) {
    return map;
  }
  const { data, error } = await supabase
    .from("champions_team_stars")
    .select("team_id")
    .in("team_id", teamIds);
  if (error) {
    throw error;
  }
  (data as Array<{ team_id: string }> | null)?.forEach((row) => {
    map.set(row.team_id, (map.get(row.team_id) ?? 0) + 1);
  });
  return map;
}

async function fetchCommentCounts(teamIds: string[]): Promise<Map<string, number>> {
  const supabase = getSupabaseBrowserClient();
  const map = new Map<string, number>();
  if (teamIds.length === 0) {
    return map;
  }
  const { data, error } = await supabase
    .from("champions_team_comments")
    .select("team_id")
    .in("team_id", teamIds);
  if (error) {
    throw error;
  }
  (data as Array<{ team_id: string }> | null)?.forEach((row) => {
    map.set(row.team_id, (map.get(row.team_id) ?? 0) + 1);
  });
  return map;
}

async function fetchBattlePlanCounts(teamIds: string[]): Promise<Map<string, number>> {
  const supabase = getSupabaseBrowserClient();
  const map = new Map<string, number>();
  if (teamIds.length === 0) {
    return map;
  }
  const { data, error } = await supabase
    .from("champions_battle_plans")
    .select("team_id")
    .in("team_id", teamIds);
  if (error) {
    throw error;
  }
  (data as Array<{ team_id: string }> | null)?.forEach((row) => {
    map.set(row.team_id, (map.get(row.team_id) ?? 0) + 1);
  });
  return map;
}

async function fetchUserStarSet(teamIds: string[], userId: string | null): Promise<Set<string>> {
  const set = new Set<string>();
  if (!userId || teamIds.length === 0) {
    return set;
  }
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("champions_team_stars")
    .select("team_id")
    .in("team_id", teamIds)
    .eq("user_id", userId);
  if (error) {
    throw error;
  }
  (data as Array<{ team_id: string }> | null)?.forEach((row) => {
    set.add(row.team_id);
  });
  return set;
}

function toFormatSupport(
  value: CommunityTeamRow["format_support"],
): "single" | "double" | "both" {
  if (value === "single" || value === "double" || value === "both") {
    return value;
  }
  return "both";
}

export const COMMUNITY_TEAM_NOT_FOUND_MESSAGE = "Community team not found.";

async function fetchBattlePlansForTeam(teamId: string): Promise<CommunityBattlePlanRow[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("champions_battle_plans")
    .select(
      "id, name, format, matchup_label, selected_pokemon_slots, lead_pokemon_slots, backup_pokemon_slots, win_condition_note, avoid_note, general_note",
    )
    .eq("team_id", teamId);
  if (error) {
    throw error;
  }
  return (data ?? []) as CommunityBattlePlanRow[];
}

function mapBattlePlanRow(plan: CommunityBattlePlanRow) {
  return {
    id: plan.id,
    name: plan.name,
    format: plan.format,
    matchupLabel: plan.matchup_label,
    selectedPokemonSlots: plan.selected_pokemon_slots ?? [],
    leadPokemonSlots: plan.lead_pokemon_slots ?? [],
    backupPokemonSlots: plan.backup_pokemon_slots ?? [],
    winConditionNote: plan.win_condition_note,
    avoidNote: plan.avoid_note,
    generalNote: plan.general_note,
  };
}

export async function listCommunityChampionsTeams(options?: {
  sort?: ChampionsCommunitySort;
  format?: ChampionsCommunityFormatFilter;
}): Promise<ChampionsCommunityTeamSummary[]> {
  try {
    const supabase = getSupabaseBrowserClient();
    const userId = await getOptionalUserId();
    const sort = options?.sort ?? "highest";
    const formatFilter = options?.format ?? "all";

    let query = supabase
      .from("teams")
      .select(
        `id, user_id, name, mode, format_support, champions_ruleset_id, team_notes, created_at, updated_at, team_pokemon(${TEAM_POKEMON_SELECT})`,
      )
      .eq("mode", "champions")
      .eq("is_public", true)
      .order("updated_at", { ascending: false })
      .limit(COMMUNITY_LIST_LIMIT);

    if (formatFilter !== "all") {
      query = query.eq("format_support", formatFilter);
    }

    const { data, error } = await query;
    if (error) {
      throw error;
    }

    const rows = (data ?? []) as CommunityListTeamRow[];
    const teamIds = rows.map((row) => row.id);
    const allPokemonRows = rows.flatMap((row) => row.team_pokemon ?? []);

    const refs = await safe(fetchResolvedSlotRefs(allPokemonRows), {
      pokemonById: new Map(),
      abilityById: new Map(),
      itemById: new Map(),
      moveById: new Map(),
    });

    const [starCounts, commentCounts, battlePlanCounts, userStarSet, usernames] = await Promise.all([
      safe(fetchStarCounts(teamIds), new Map<string, number>()),
      safe(fetchCommentCounts(teamIds), new Map<string, number>()),
      safe(fetchBattlePlanCounts(teamIds), new Map<string, number>()),
      safe(fetchUserStarSet(teamIds, userId), new Set<string>()),
      safe(fetchUsernames(rows.map((row) => row.user_id)), new Map<string, string>()),
    ]);

    const mapped: ChampionsCommunityTeamSummary[] = rows.map((row) => {
      const pokemon = [...(row.team_pokemon ?? [])]
        .sort((a, b) => a.slot - b.slot)
        .map((member) => mapPokemonRow(member, refs));

      return {
        id: row.id,
        name: row.name,
        userId: row.user_id,
        publisherUsername: usernames.get(row.user_id) ?? null,
        formatSupport: toFormatSupport(row.format_support),
        rulesetId: row.champions_ruleset_id,
        updatedAt: row.updated_at,
        createdAt: row.created_at,
        pokemon,
        battlePlanCount: battlePlanCounts.get(row.id) ?? 0,
        starCount: starCounts.get(row.id) ?? 0,
        commentCount: commentCounts.get(row.id) ?? 0,
        hasStarred: userStarSet.has(row.id),
      };
    });

    if (sort === "newest") {
      return mapped.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    return mapped.sort(
      (a, b) => b.starCount - a.starCount || b.updatedAt.localeCompare(a.updatedAt),
    );
  } catch (error) {
    throw new Error(
      toCommunityBrowseErrorMessage(error, "Unable to load community teams right now."),
    );
  }
}

export async function getCommunityChampionsTeamById(
  teamId: string,
): Promise<ChampionsCommunityTeamDetail> {
  try {
    const supabase = getSupabaseBrowserClient();
    const userId = await getOptionalUserId();

    const { data, error } = await supabase
      .from("teams")
      .select(
        `id, user_id, name, mode, format_support, champions_ruleset_id, team_notes, created_at, updated_at, team_pokemon(${TEAM_POKEMON_SELECT})`,
      )
      .eq("id", teamId)
      .eq("mode", "champions")
      .eq("is_public", true)
      .maybeSingle();
    if (error) {
      throw error;
    }
    if (!data) {
      throw new Error(COMMUNITY_TEAM_NOT_FOUND_MESSAGE);
    }

    const row = data as CommunityTeamRow & {
      team_pokemon: CommunityTeamPokemonRow[] | null;
    };

    const pokemonRows = row.team_pokemon ?? [];
    const refs = await safe(fetchResolvedSlotRefs(pokemonRows), {
      pokemonById: new Map(),
      abilityById: new Map(),
      itemById: new Map(),
      moveById: new Map(),
    });

    const [starCounts, commentCounts, userStarSet, comments, usernames, battlePlans] =
      await Promise.all([
      safe(fetchStarCounts([row.id]), new Map<string, number>()),
      safe(fetchCommentCounts([row.id]), new Map<string, number>()),
      safe(fetchUserStarSet([row.id], userId), new Set<string>()),
      safe(listCommunityTeamComments(row.id), [] as ChampionsCommunityComment[]),
      safe(fetchUsernames([row.user_id]), new Map<string, string>()),
      safe(fetchBattlePlansForTeam(row.id), [] as CommunityBattlePlanRow[]),
    ]);

    return {
      id: row.id,
      name: row.name,
      userId: row.user_id,
      publisherUsername: usernames.get(row.user_id) ?? null,
      formatSupport: toFormatSupport(row.format_support),
      rulesetId: row.champions_ruleset_id ?? CHAMPIONS_RULESET_ID,
      teamNotes: row.team_notes,
      updatedAt: row.updated_at,
      createdAt: row.created_at,
      pokemon: [...pokemonRows]
        .sort((a, b) => a.slot - b.slot)
        .map((entry) => mapPokemonRow(entry, refs)),
      battlePlanCount: battlePlans.length,
      battlePlans: battlePlans.map(mapBattlePlanRow),
      starCount: starCounts.get(row.id) ?? 0,
      commentCount: commentCounts.get(row.id) ?? 0,
      hasStarred: userStarSet.has(row.id),
      comments,
    };
  } catch (error) {
    if (error instanceof Error && error.message === COMMUNITY_TEAM_NOT_FOUND_MESSAGE) {
      throw error;
    }
    throw new Error(
      toCommunityBrowseErrorMessage(error, "Unable to load this community team right now."),
    );
  }
}

export async function listCommunityTeamComments(
  teamId: string,
): Promise<ChampionsCommunityComment[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("champions_team_comments")
    .select("id, team_id, user_id, body, created_at, updated_at")
    .eq("team_id", teamId)
    .order("created_at", { ascending: false });
  if (error) {
    throw error;
  }

  const rows = (data ?? []) as CommunityCommentRow[];
  const usernames = await safe(
    fetchUsernames(rows.map((row) => row.user_id)),
    new Map<string, string>(),
  );

  return rows.map((row) => ({
    id: row.id,
    teamId: row.team_id,
    userId: row.user_id,
    authorUsername: usernames.get(row.user_id) ?? null,
    body: row.body,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function publishChampionsTeam(teamId: string, isPublic: boolean): Promise<void> {
  try {
    const supabase = getSupabaseBrowserClient();
    const userId = await resolveAuthenticatedUserId();
    const { error } = await supabase
      .from("teams")
      .update({ is_public: isPublic, updated_at: new Date().toISOString() })
      .eq("id", teamId)
      .eq("user_id", userId)
      .eq("mode", "champions");
    if (error) {
      throw error;
    }
  } catch (error) {
    throw new Error(
      toFriendlySupabaseMessage(
        error,
        isPublic ? "Unable to publish this Champions team." : "Unable to unpublish this Champions team.",
      ),
    );
  }
}

export async function toggleCommunityTeamStar(teamId: string): Promise<boolean> {
  try {
    const supabase = getSupabaseBrowserClient();
    const userId = await resolveAuthenticatedUserId();
    const { data: existing, error: selectError } = await supabase
      .from("champions_team_stars")
      .select("team_id, user_id")
      .eq("team_id", teamId)
      .eq("user_id", userId)
      .maybeSingle();
    if (selectError) {
      throw selectError;
    }

    if (existing) {
      const { error: deleteError } = await supabase
        .from("champions_team_stars")
        .delete()
        .eq("team_id", teamId)
        .eq("user_id", userId);
      if (deleteError) {
        throw deleteError;
      }
      return false;
    }

    const { error: insertError } = await supabase
      .from("champions_team_stars")
      .insert({ team_id: teamId, user_id: userId });
    if (insertError) {
      throw insertError;
    }
    return true;
  } catch (error) {
    throw new Error(
      toFriendlySupabaseMessage(error, "Unable to update star right now."),
    );
  }
}

export async function addCommunityTeamComment(teamId: string, body: string): Promise<void> {
  const normalized = body.trim();
  if (!normalized) {
    throw new Error("Comment cannot be empty.");
  }
  try {
    const supabase = getSupabaseBrowserClient();
    const userId = await resolveAuthenticatedUserId();
    const { error } = await supabase
      .from("champions_team_comments")
      .insert({ team_id: teamId, user_id: userId, body: normalized });
    if (error) {
      throw error;
    }
  } catch (error) {
    throw new Error(
      toFriendlySupabaseMessage(error, "Unable to add comment right now."),
    );
  }
}

export async function deleteCommunityTeamComment(commentId: string): Promise<void> {
  try {
    const supabase = getSupabaseBrowserClient();
    const userId = await resolveAuthenticatedUserId();
    const { error } = await supabase
      .from("champions_team_comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", userId);
    if (error) {
      throw error;
    }
  } catch (error) {
    throw new Error(
      toFriendlySupabaseMessage(error, "Unable to delete comment right now."),
    );
  }
}

export async function forkCommunityTeamToDraft(teamId: string): Promise<ChampionsTeam> {
  const detail = await getCommunityChampionsTeamById(teamId);
  return communityDetailToChampionsTeam(detail);
}
