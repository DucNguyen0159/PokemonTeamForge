/**
 * Imports PokéAPI Pokemon, ability, move, and join data into Supabase.
 *
 * Usage:
 *   node scripts/import-pokemon-data.mjs --dry-run --limit 20
 */

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { parseCommonArgs, pokeApiGet, runImport } from "./lib/import-utils.mjs";

const MAX_MOVES_PER_POKEMON = 200;
const UPSERT_BATCH_SIZE = 500;
const POKEMON_TYPES = new Set([
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
]);

const GENERATION_REGION_MAP = {
  1: "Kanto",
  2: "Johto",
  3: "Hoenn",
  4: "Sinnoh",
  5: "Unova",
  6: "Kalos",
  7: "Alola",
  8: "Galar",
  9: "Paldea",
};

function toTitleCase(input) {
  return String(input)
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getGenerationNumber(generationName) {
  const numericSegment = generationName?.split("-")[1];
  const romanMap = {
    i: 1,
    ii: 2,
    iii: 3,
    iv: 4,
    v: 5,
    vi: 6,
    vii: 7,
    viii: 8,
    ix: 9,
  };

  return romanMap[numericSegment] ?? 0;
}

function pickPokeApiSprite(pokemon, variant) {
  const officialArtwork = pokemon.sprites?.other?.["official-artwork"];
  const home = pokemon.sprites?.other?.home;
  if (variant === "shiny") {
    return officialArtwork?.front_shiny ?? home?.front_shiny ?? pokemon.sprites?.front_shiny ?? "";
  }

  return officialArtwork?.front_default ?? home?.front_default ?? pokemon.sprites?.front_default ?? "";
}

function getEnglishAbilityDescription(ability) {
  const englishEntry = ability.effect_entries?.find((entry) => entry.language?.name === "en");
  return englishEntry?.short_effect || englishEntry?.effect || "No description available.";
}

function getEnglishMoveDescription(move) {
  const effectEntry = move.effect_entries?.find((entry) => entry.language?.name === "en");
  if (effectEntry?.short_effect || effectEntry?.effect) {
    return effectEntry.short_effect || effectEntry.effect;
  }

  const flavorEntry = move.flavor_text_entries?.find((entry) => entry.language?.name === "en");
  return flavorEntry?.flavor_text?.replace(/\s+/g, " ") ?? null;
}

async function loadMoveTags() {
  const filePath = path.join(process.cwd(), "src/data/move-tags.ts");
  const text = await fs.readFile(filePath, "utf8");
  const start = text.indexOf("{", text.indexOf("MOVE_TAGS"));
  const end = text.lastIndexOf("};");

  if (start === -1 || end === -1 || end <= start) {
    return {};
  }

  const objectLiteral = text.slice(start, end + 1);
  return Function(`"use strict"; return (${objectLiteral});`)();
}

function normalizeMoveTagList(moveTags, slug) {
  const tags = moveTags[slug];
  return Array.isArray(tags) ? tags : [];
}

function normalizeMove(rawMove, moveTags) {
  const damageClass = rawMove.damage_class?.name;
  const category = damageClass === "physical" || damageClass === "special" ? damageClass : "status";

  return {
    id: rawMove.id,
    slug: rawMove.name,
    name: toTitleCase(rawMove.name),
    type: POKEMON_TYPES.has(rawMove.type?.name) ? rawMove.type.name : "normal",
    category,
    power: rawMove.power,
    accuracy: rawMove.accuracy,
    pp: rawMove.pp,
    priority: rawMove.priority ?? 0,
    description: getEnglishMoveDescription(rawMove),
    tags: normalizeMoveTagList(moveTags, rawMove.name),
  };
}

function deriveRolesFromStatsAndMoves(stats, moves) {
  const roles = new Set();

  if (stats.attack >= 110) roles.add("physical_attacker");
  if (stats.special_attack >= 110) roles.add("special_attacker");
  if (stats.attack >= 100 && stats.special_attack >= 100) roles.add("mixed_attacker");
  if (stats.defense >= 100) roles.add("physical_wall");
  if (stats.special_defense >= 100) roles.add("special_wall");
  if (stats.hp + stats.defense + stats.special_defense >= 260) roles.add("tank");

  moves.forEach((move) => {
    const tags = move.tags ?? [];
    if (tags.includes("pivot")) roles.add("pivot");
    if (tags.includes("entry_hazard")) roles.add("hazard_setter");
    if (tags.includes("hazard_removal")) roles.add("hazard_remover");
    if (tags.includes("setup")) roles.add("setup_sweeper");
    if (tags.includes("speed_control")) roles.add("speed_control");
    if (tags.includes("status")) roles.add("status_spreader");
    if (tags.includes("priority")) roles.add("priority_user");
    if (tags.includes("trap")) roles.add("trap_user");
    if (tags.includes("redirection")) roles.add("redirection_support");
  });

  if (
    roles.has("pivot") ||
    roles.has("status_spreader") ||
    roles.has("hazard_setter") ||
    roles.has("hazard_remover")
  ) {
    roles.add("support");
  }

  if (roles.has("physical_attacker") && roles.has("setup_sweeper")) {
    roles.add("wallbreaker");
  }

  return Array.from(roles);
}

async function listPokemonRefs(limit) {
  const page = await pokeApiGet("/pokemon?limit=2000&offset=0");
  const refs = page.results ?? [];
  return Number.isFinite(limit) ? refs.slice(0, limit) : refs;
}

function normalizePokemon(rawPokemon, rawSpecies, normalizedMoves) {
  const sortedTypes = [...rawPokemon.types].sort((a, b) => a.slot - b.slot);
  const statsByName = new Map(rawPokemon.stats.map((entry) => [entry.stat.name, entry.base_stat]));
  const hp = statsByName.get("hp") ?? 0;
  const attack = statsByName.get("attack") ?? 0;
  const defense = statsByName.get("defense") ?? 0;
  const specialAttack = statsByName.get("special-attack") ?? 0;
  const specialDefense = statsByName.get("special-defense") ?? 0;
  const speed = statsByName.get("speed") ?? 0;
  const generation = getGenerationNumber(rawSpecies.generation?.name);
  const stats = {
    hp,
    attack,
    defense,
    special_attack: specialAttack,
    special_defense: specialDefense,
    speed,
  };

  return {
    id: rawPokemon.id,
    slug: rawPokemon.name,
    name: toTitleCase(rawPokemon.name),
    species_slug: rawPokemon.species?.name ?? rawPokemon.name,
    generation,
    region: GENERATION_REGION_MAP[generation] ?? "Unknown",
    primary_type: sortedTypes[0]?.type?.name ?? "normal",
    secondary_type: sortedTypes[1]?.type?.name ?? null,
    ...stats,
    is_legendary: Boolean(rawSpecies.is_legendary),
    is_mythical: Boolean(rawSpecies.is_mythical),
    sprite_normal_url: pickPokeApiSprite(rawPokemon, "normal"),
    sprite_shiny_url: pickPokeApiSprite(rawPokemon, "shiny") || null,
    roles: deriveRolesFromStatsAndMoves(stats, normalizedMoves),
    source_updated_at: null,
  };
}

function normalizeAbility(rawAbility) {
  return {
    id: rawAbility.id,
    slug: rawAbility.name,
    name: toTitleCase(rawAbility.name),
    description: getEnglishAbilityDescription(rawAbility),
  };
}

function uniqueById(rows) {
  return Array.from(new Map(rows.map((row) => [row.id, row])).values());
}

function uniqueByComposite(rows, keyFn) {
  return Array.from(new Map(rows.map((row) => [keyFn(row), row])).values());
}

async function fetchWithCache(cache, path) {
  if (cache.has(path)) {
    return cache.get(path);
  }

  const value = await pokeApiGet(path);
  cache.set(path, value);
  return value;
}

async function buildPokemonImportRows(ref, caches, moveTags) {
  const rawPokemon = await pokeApiGet(ref.url);
  const rawSpecies = await fetchWithCache(caches.species, `/pokemon-species/${rawPokemon.species.name}`);

  const rawAbilities = await Promise.all(
    rawPokemon.abilities.map((entry) =>
      fetchWithCache(caches.abilities, `/ability/${entry.ability.name}`),
    ),
  );
  const abilityRows = rawAbilities.map(normalizeAbility);
  const pokemonAbilityRows = rawPokemon.abilities.map((entry, index) => {
    const ability = rawAbilities.find((rawAbility) => rawAbility.name === entry.ability.name);
    return {
      pokemon_id: rawPokemon.id,
      ability_id: ability?.id ?? 0,
      slot: index + 1,
      is_hidden: Boolean(entry.is_hidden),
    };
  }).filter((row) => row.ability_id > 0);

  const moveNames = rawPokemon.moves
    .map((entry) => entry.move.name)
    .slice(0, MAX_MOVES_PER_POKEMON);
  const rawMoves = await Promise.all(
    moveNames.map((moveName) => fetchWithCache(caches.moves, `/move/${moveName}`)),
  );
  const moveRows = rawMoves.map((move) => normalizeMove(move, moveTags));
  const pokemonMoveRows = moveRows.map((move) => ({
    pokemon_id: rawPokemon.id,
    move_id: move.id,
  }));
  const pokemonRow = normalizePokemon(rawPokemon, rawSpecies, moveRows);

  return {
    pokemonRows: [pokemonRow],
    abilityRows,
    pokemonAbilityRows,
    moveRows,
    pokemonMoveRows,
  };
}

async function upsertInBatches(supabase, table, rows, options = {}) {
  if (rows.length === 0) {
    return;
  }

  for (let index = 0; index < rows.length; index += UPSERT_BATCH_SIZE) {
    const chunk = rows.slice(index, index + UPSERT_BATCH_SIZE);
    const { error } = await supabase.from(table).upsert(chunk, options);
    if (error) {
      throw error;
    }
  }
}

async function insertInBatches(supabase, table, rows) {
  if (rows.length === 0) {
    return;
  }

  for (let index = 0; index < rows.length; index += UPSERT_BATCH_SIZE) {
    const chunk = rows.slice(index, index + UPSERT_BATCH_SIZE);
    const { error } = await supabase.from(table).insert(chunk);
    if (error) {
      throw error;
    }
  }
}

async function deleteJoinsForPokemon(supabase, table, pokemonIds) {
  for (let index = 0; index < pokemonIds.length; index += UPSERT_BATCH_SIZE) {
    const chunk = pokemonIds.slice(index, index + UPSERT_BATCH_SIZE);
    const { error } = await supabase.from(table).delete().in("pokemon_id", chunk);
    if (error) {
      throw error;
    }
  }
}

async function main() {
  const args = parseCommonArgs(process.argv);

  await runImport("pokemon", args, async ({ supabase }) => {
    const refs = await listPokemonRefs(args.limit);
    const moveTags = await loadMoveTags();
    const caches = {
      species: new Map(),
      abilities: new Map(),
      moves: new Map(),
    };
    const aggregate = {
      pokemonRows: [],
      abilityRows: [],
      pokemonAbilityRows: [],
      moveRows: [],
      pokemonMoveRows: [],
    };

    for (const [index, ref] of refs.entries()) {
      const rows = await buildPokemonImportRows(ref, caches, moveTags);
      aggregate.pokemonRows.push(...rows.pokemonRows);
      aggregate.abilityRows.push(...rows.abilityRows);
      aggregate.pokemonAbilityRows.push(...rows.pokemonAbilityRows);
      aggregate.moveRows.push(...rows.moveRows);
      aggregate.pokemonMoveRows.push(...rows.pokemonMoveRows);

      if ((index + 1) % 10 === 0 || index === refs.length - 1) {
        console.log(`Prepared ${index + 1}/${refs.length} Pokemon.`);
      }
    }

    aggregate.abilityRows = uniqueById(aggregate.abilityRows);
    aggregate.moveRows = uniqueById(aggregate.moveRows);
    aggregate.pokemonAbilityRows = uniqueByComposite(
      aggregate.pokemonAbilityRows,
      (row) => `${row.pokemon_id}:${row.ability_id}`,
    );
    aggregate.pokemonMoveRows = uniqueByComposite(
      aggregate.pokemonMoveRows,
      (row) => `${row.pokemon_id}:${row.move_id}`,
    );
    const pokemonIds = aggregate.pokemonRows.map((row) => row.id);

    if (args.dryRun) {
      console.log(
        `[dry-run] Prepared ${aggregate.pokemonRows.length} Pokemon, ${aggregate.abilityRows.length} abilities, ${aggregate.moveRows.length} moves, ${aggregate.pokemonAbilityRows.length} Pokemon abilities, and ${aggregate.pokemonMoveRows.length} Pokemon moves.`,
      );
    } else {
      await upsertInBatches(supabase, "abilities", aggregate.abilityRows, { onConflict: "id" });
      await upsertInBatches(supabase, "moves", aggregate.moveRows, { onConflict: "id" });
      await upsertInBatches(supabase, "pokemon", aggregate.pokemonRows, { onConflict: "id" });
      await deleteJoinsForPokemon(supabase, "pokemon_abilities", pokemonIds);
      await deleteJoinsForPokemon(supabase, "pokemon_moves", pokemonIds);
      await insertInBatches(supabase, "pokemon_abilities", aggregate.pokemonAbilityRows);
      await insertInBatches(supabase, "pokemon_moves", aggregate.pokemonMoveRows);

      console.log(
        `Imported ${aggregate.pokemonRows.length} Pokemon, ${aggregate.abilityRows.length} abilities, and ${aggregate.moveRows.length} moves.`,
      );
    }

    return {
      rowsProcessed: aggregate.pokemonRows.length,
      metadata: {
        refsFound: refs.length,
        pokemonCount: aggregate.pokemonRows.length,
        abilityCount: aggregate.abilityRows.length,
        moveCount: aggregate.moveRows.length,
        pokemonAbilityCount: aggregate.pokemonAbilityRows.length,
        pokemonMoveCount: aggregate.pokemonMoveRows.length,
      },
    };
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
