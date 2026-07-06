/**
 * Seeds 10 public Champions community teams for local/dev browse QA.
 *
 * Usage:
 *   node scripts/seed-champions-community.mjs
 *   node scripts/seed-champions-community.mjs --wipe
 *   node scripts/seed-champions-community.mjs --dry-run
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { getSupabaseAdminClient } from "./lib/import-utils.mjs";
import {
  COMMUNITY_SEED_MARKER,
  COMMUNITY_SEED_MEMBERS,
  COMMUNITY_SEED_PUBLISHERS,
  COMMUNITY_SEED_TEAMS,
} from "./lib/champions-community-seed-data.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const USER_CACHE_PATH = join(__dirname, ".champions-community-seed-users.json");
const CHAMPIONS_RULESET_ID = "regulation-m-a";

const POKEMON_SLUG_ALIASES = {
  mimikyu: "mimikyu-disguised",
  indeedee: "indeedee-female",
  "rotom-wash": "rotom-wash",
  "ninetales-alola": "ninetales-alola",
};

function parseArgs(argv) {
  return {
    dryRun: argv.includes("--dry-run"),
    wipe: argv.includes("--wipe"),
    force: argv.includes("--force"),
  };
}

function resolvePokemonSlug(input) {
  const normalized = input.trim().toLowerCase().replace(/\s+/g, "-");
  return POKEMON_SLUG_ALIASES[normalized] ?? normalized;
}

function toTeamFormat(formatSupport) {
  if (formatSupport === "double") {
    return "doubles";
  }
  return "singles";
}

function loadUserCache() {
  if (!existsSync(USER_CACHE_PATH)) {
    return { publishers: {}, members: {} };
  }
  try {
    const parsed = JSON.parse(readFileSync(USER_CACHE_PATH, "utf8"));
    let members = parsed.members ?? {};
    if (Array.isArray(parsed.starrers)) {
      members = {};
      parsed.starrers.forEach((entry, index) => {
        const memberDef = COMMUNITY_SEED_MEMBERS[index];
        if (entry?.id && memberDef) {
          members[memberDef.key] = entry;
        }
      });
    }
    return {
      publishers: parsed.publishers ?? {},
      members,
    };
  } catch {
    return { publishers: {}, members: {} };
  }
}

function saveUserCache(cache) {
  writeFileSync(USER_CACHE_PATH, `${JSON.stringify(cache, null, 2)}\n`, "utf8");
}

async function findUserIdByUsername(supabase, username) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();
  if (error) {
    throw error;
  }
  return data?.id ?? null;
}

async function ensureSeedUser(supabase, bucket, key, { email, username }) {
  const cached = bucket[key];
  if (cached?.id) {
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: cached.id,
      username,
    });
    if (profileError) {
      throw profileError;
    }
    bucket[key] = { id: cached.id, username, email };
    return cached.id;
  }

  const existingId = await findUserIdByUsername(supabase, username);
  if (existingId) {
    bucket[key] = { id: existingId, username, email };
    return existingId;
  }

  const password = `PtfSeed-${username}-2026!`;
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username, community_seed: true },
  });

  if (error) {
    throw new Error(`Unable to create seed user ${username}: ${error.message}`);
  }

  const userId = data.user.id;
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: userId,
    username,
  });
  if (profileError) {
    throw profileError;
  }

  bucket[key] = { id: userId, username, email };
  return userId;
}

async function ensurePublishers(supabase, cache) {
  const publishers = {};
  for (const publisher of COMMUNITY_SEED_PUBLISHERS) {
    publishers[publisher.key] = await ensureSeedUser(
      supabase,
      cache.publishers,
      publisher.key,
      publisher,
    );
  }
  return publishers;
}

async function ensureCommunityMembers(supabase, cache) {
  const memberIds = [];
  for (const member of COMMUNITY_SEED_MEMBERS) {
    const userId = await ensureSeedUser(supabase, cache.members, member.key, member);
    memberIds.push(userId);
  }
  return memberIds;
}

async function lookupPokemonIds(supabase, speciesNames) {
  const slugs = speciesNames.map(resolvePokemonSlug);
  const { data, error } = await supabase
    .from("pokemon")
    .select("id, slug, name")
    .in("slug", slugs);
  if (error) {
    throw error;
  }

  const bySlug = new Map((data ?? []).map((row) => [row.slug, row.id]));
  const missing = slugs.filter((slug) => !bySlug.has(slug));
  if (missing.length > 0) {
    throw new Error(`Missing pokemon in database: ${missing.join(", ")}`);
  }

  return bySlug;
}

function lookupVariants(name) {
  const trimmed = name.trim();
  const variants = new Set([trimmed]);
  if (trimmed.includes("-")) {
    variants.add(trimmed.replace(/-/g, " "));
  }
  if (trimmed.includes("'")) {
    variants.add(trimmed.replace(/'/g, ""));
  }
  return Array.from(variants);
}

async function lookupIdsByNames(supabase, table, names) {
  const unique = Array.from(new Set(names.map((name) => name.trim()).filter(Boolean)));
  const map = new Map();
  if (unique.length === 0) {
    return map;
  }

  const { data, error } = await supabase.from(table).select("id, name").in("name", unique);
  if (error) {
    throw error;
  }

  for (const row of data ?? []) {
    map.set(row.name, row.id);
  }

  const missing = unique.filter((name) => !map.has(name));
  for (const name of missing) {
    let matchedId = null;
    for (const variant of lookupVariants(name)) {
      const { data: match, error: matchError } = await supabase
        .from(table)
        .select("id, name")
        .ilike("name", variant)
        .limit(1)
        .maybeSingle();
      if (matchError) {
        throw matchError;
      }
      if (match) {
        matchedId = match.id;
        break;
      }
    }
    if (matchedId) {
      map.set(name, matchedId);
    }
  }

  const stillMissing = unique.filter((name) => !map.has(name));
  if (stillMissing.length > 0) {
    throw new Error(`Missing ${table} rows: ${stillMissing.join(", ")}`);
  }

  return map;
}

async function listExistingSeedTeams(supabase) {
  const { data, error } = await supabase
    .from("teams")
    .select("id, name")
    .eq("mode", "champions")
    .like("team_notes", `${COMMUNITY_SEED_MARKER}%`);
  if (error) {
    throw error;
  }
  return data ?? [];
}

async function wipeSeedTeams(supabase) {
  const existing = await listExistingSeedTeams(supabase);
  if (existing.length === 0) {
    console.log("No existing community seed teams to remove.");
    return;
  }

  const ids = existing.map((team) => team.id);
  const { error } = await supabase.from("teams").delete().in("id", ids);
  if (error) {
    throw error;
  }
  console.log(`Removed ${existing.length} community seed team(s).`);
}

function buildStarAssignments(starrerIds) {
  const assignments = new Map();
  let offset = 0;
  const counts = COMMUNITY_SEED_TEAMS.map(() => 3 + Math.floor(Math.random() * 10));

  for (let index = counts.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [counts[index], counts[swapIndex]] = [counts[swapIndex], counts[index]];
  }

  for (const team of COMMUNITY_SEED_TEAMS) {
    const count = Math.min(counts.shift() ?? 3, starrerIds.length);
    const userIds = [];
    for (let index = 0; index < count; index += 1) {
      userIds.push(starrerIds[(offset + index) % starrerIds.length]);
    }
    offset += count;
    assignments.set(team.key, userIds);
  }

  return assignments;
}

async function insertRowsOrWarn(supabase, table, rows, label) {
  if (!rows || (Array.isArray(rows) && rows.length === 0)) {
    return true;
  }

  const { error } = await supabase.from(table).insert(rows);
  if (error) {
    if (error.code === "42501") {
      console.warn(
        `Skipped ${label}: missing grants on ${table}. Re-run supabase/champions-community-grants.sql in Supabase.`,
      );
      return false;
    }
    throw error;
  }
  return true;
}

function resolveBattlePlanFormat(teamDef) {
  const format = teamDef.battlePlan?.format;
  if (format === "single" || format === "double") {
    return format;
  }
  return teamDef.formatSupport === "single" ? "single" : "double";
}

const SEED_TIMESTAMP_RANGE = {
  startMs: Date.parse("2026-06-20T00:00:00.000Z"),
  endMs: Date.parse("2026-07-05T23:59:59.999Z"),
};

function randomMsInRange(minMs, maxMs) {
  if (maxMs <= minMs) {
    return minMs;
  }
  return minMs + Math.floor(Math.random() * (maxMs - minMs + 1));
}

function buildTeamSeedTimestamps() {
  const { startMs, endMs } = SEED_TIMESTAMP_RANGE;
  const createdMs = randomMsInRange(startMs, endMs);
  const updatedMs = randomMsInRange(createdMs, endMs);
  return {
    createdMs,
    updatedMs,
    created_at: new Date(createdMs).toISOString(),
    updated_at: new Date(updatedMs).toISOString(),
  };
}

function buildCommentTimestamp(teamCreatedMs, teamUpdatedMs, index, total) {
  if (total <= 1) {
    return new Date(randomMsInRange(teamCreatedMs, teamUpdatedMs)).toISOString();
  }

  const span = teamUpdatedMs - teamCreatedMs;
  const baseMs = teamCreatedMs + Math.floor((span * index) / (total - 1));
  const jitterMs = Math.floor(Math.random() * 2 * 60 * 60 * 1000) - 60 * 60 * 1000;
  const clampedMs = Math.min(teamUpdatedMs, Math.max(teamCreatedMs, baseMs + jitterMs));
  return new Date(clampedMs).toISOString();
}

async function main() {
  const args = parseArgs(process.argv);
  const supabase = args.dryRun ? null : getSupabaseAdminClient();
  const cache = loadUserCache();

  if (!args.dryRun) {
    const existing = await listExistingSeedTeams(supabase);
    if (existing.length > 0 && !args.force && !args.wipe) {
      console.log(
        `Found ${existing.length} existing community seed team(s). Use --wipe to replace or --force to add more.`,
      );
      process.exit(0);
    }
    if (args.wipe) {
      await wipeSeedTeams(supabase);
    }
  }

  const allSpecies = COMMUNITY_SEED_TEAMS.flatMap((team) => team.pokemon.map((slot) => slot.species));
  const allAbilities = COMMUNITY_SEED_TEAMS.flatMap((team) => team.pokemon.map((slot) => slot.ability));
  const allItems = COMMUNITY_SEED_TEAMS.flatMap((team) => team.pokemon.map((slot) => slot.item));
  const allMoves = COMMUNITY_SEED_TEAMS.flatMap((team) => team.pokemon.flatMap((slot) => slot.moves));

  if (args.dryRun) {
    console.log(`[dry-run] Would seed ${COMMUNITY_SEED_TEAMS.length} community teams.`);
    console.log(`[dry-run] Publishers: ${COMMUNITY_SEED_PUBLISHERS.map((entry) => entry.username).join(", ")}`);
    console.log(`[dry-run] Members: ${COMMUNITY_SEED_MEMBERS.map((entry) => entry.username).join(", ")}`);
    console.log(`[dry-run] Pokemon slots: ${allSpecies.length}, unique species: ${new Set(allSpecies).size}`);
    return;
  }

  const publishers = await ensurePublishers(supabase, cache);
  const members = await ensureCommunityMembers(supabase, cache);
  saveUserCache(cache);

  const pokemonBySlug = await lookupPokemonIds(supabase, allSpecies);
  const [abilities, items, moves] = await Promise.all([
    lookupIdsByNames(supabase, "abilities", allAbilities),
    lookupIdsByNames(supabase, "items", allItems),
    lookupIdsByNames(supabase, "moves", allMoves),
  ]);

  const starAssignments = buildStarAssignments(members);

  for (const teamDef of COMMUNITY_SEED_TEAMS) {
    const publisherId = publishers[teamDef.publisherKey];
    const starUserIds = starAssignments.get(teamDef.key) ?? [];
    const teamNotes = `${COMMUNITY_SEED_MARKER} Dev browse filler — safe to delete.`;
    const teamTimestamps = buildTeamSeedTimestamps();

    const { data: teamRow, error: teamError } = await supabase
      .from("teams")
      .insert({
        user_id: publisherId,
        name: teamDef.name,
        format: toTeamFormat(teamDef.formatSupport),
        mode: "champions",
        format_support: teamDef.formatSupport,
        champions_ruleset_id: CHAMPIONS_RULESET_ID,
        team_notes: teamNotes,
        is_public: true,
        created_at: teamTimestamps.created_at,
        updated_at: teamTimestamps.updated_at,
      })
      .select("id")
      .single();

    if (teamError || !teamRow) {
      throw teamError ?? new Error(`Unable to create team ${teamDef.name}`);
    }

    const slotRows = teamDef.pokemon.map((slot, index) => {
      const slug = resolvePokemonSlug(slot.species);
      return {
        team_id: teamRow.id,
        slot: index + 1,
        pokemon_id: pokemonBySlug.get(slug),
        stat_alignment: slot.statAlignment,
        sp_hp: slot.sp.hp,
        sp_atk: slot.sp.atk,
        sp_def: slot.sp.def,
        sp_spa: slot.sp.spa,
        sp_spd: slot.sp.spd,
        sp_spe: slot.sp.spe,
        use_mega_by_default: slot.useMegaByDefault ?? false,
        ability_id: abilities.get(slot.ability) ?? null,
        item_id: items.get(slot.item) ?? null,
        move_1_id: moves.get(slot.moves[0]) ?? null,
        move_2_id: moves.get(slot.moves[1]) ?? null,
        move_3_id: moves.get(slot.moves[2]) ?? null,
        move_4_id: moves.get(slot.moves[3]) ?? null,
      };
    });

    const { error: slotError } = await supabase.from("team_pokemon").insert(slotRows);
    if (slotError) {
      throw slotError;
    }

    if (teamDef.battlePlan) {
      await insertRowsOrWarn(
        supabase,
        "champions_battle_plans",
        {
          team_id: teamRow.id,
          name: teamDef.battlePlan.name,
          format: resolveBattlePlanFormat(teamDef),
          matchup_label: teamDef.battlePlan.name,
          selected_pokemon_slots: [1, 2, 3],
          lead_pokemon_slots: [1],
          backup_pokemon_slots: [2, 3],
          win_condition_note: teamDef.battlePlan.winConditionNote,
          avoid_note: teamDef.battlePlan.avoidNote,
          general_note: "",
          created_at: teamTimestamps.created_at,
          updated_at: teamTimestamps.updated_at,
        },
        `${teamDef.name} battle plan`,
      );
    }

    const starsInserted = await insertRowsOrWarn(
      supabase,
      "champions_team_stars",
      starUserIds.map((userId) => ({
        team_id: teamRow.id,
        user_id: userId,
      })),
      `${teamDef.name} stars`,
    );

    if (teamDef.comments?.length) {
      await insertRowsOrWarn(
        supabase,
        "champions_team_comments",
        teamDef.comments.map((body, index) => {
          const createdAt = buildCommentTimestamp(
            teamTimestamps.createdMs,
            teamTimestamps.updatedMs,
            index,
            teamDef.comments.length,
          );
          return {
            team_id: teamRow.id,
            user_id: members[(index + 2) % members.length],
            body,
            created_at: createdAt,
            updated_at: createdAt,
          };
        }),
        `${teamDef.name} comments`,
      );
    }

    console.log(
      `Seeded ${teamDef.name} (${starsInserted ? starUserIds.length : 0} stars)`,
    );
  }

  console.log(`Done. Seeded ${COMMUNITY_SEED_TEAMS.length} public Champions community teams.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
