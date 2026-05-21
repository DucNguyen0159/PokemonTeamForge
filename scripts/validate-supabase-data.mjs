/**
 * Validates imported Supabase catalog data against live PokéAPI samples.
 *
 * Usage:
 *   node scripts/validate-supabase-data.mjs
 *   node scripts/validate-supabase-data.mjs --strict
 *   node scripts/validate-supabase-data.mjs --pokemon bulbasaur,pikachu --abilities intimidate,levitate --items leftovers,choice-scarf
 */

import process from "node:process";

import { getSupabaseReadClient, pokeApiGet } from "./lib/import-utils.mjs";
import { FORM_KIND_RANK } from "./lib/pokemon-form-metadata.mjs";

const DEFAULT_POKEMON_SAMPLES = ["bulbasaur", "charizard", "pikachu", "amoonguss", "landorus-therian"];
const DEFAULT_ABILITY_SAMPLES = ["intimidate", "levitate", "drizzle", "regenerator"];
const DEFAULT_ITEM_SAMPLES = ["leftovers", "choice-scarf", "focus-sash", "abomasite"];

function parseArgs(argv = process.argv) {
  const args = {
    strict: false,
    pokemon: DEFAULT_POKEMON_SAMPLES,
    abilities: DEFAULT_ABILITY_SAMPLES,
    items: DEFAULT_ITEM_SAMPLES,
  };

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--strict") {
      args.strict = true;
    } else if (arg === "--pokemon" && argv[index + 1]) {
      args.pokemon = argv[index + 1].split(",").map((entry) => entry.trim()).filter(Boolean);
      index += 1;
    } else if (arg === "--abilities" && argv[index + 1]) {
      args.abilities = argv[index + 1].split(",").map((entry) => entry.trim()).filter(Boolean);
      index += 1;
    } else if (arg === "--items" && argv[index + 1]) {
      args.items = argv[index + 1].split(",").map((entry) => entry.trim()).filter(Boolean);
      index += 1;
    }
  }

  return args;
}

function generationNumber(name) {
  const numericSegment = name?.split("-")[1];
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

function evolutionChainNodeForSpecies(chainNode, speciesSlug) {
  if (!chainNode) {
    return null;
  }

  if (chainNode.species?.name === speciesSlug) {
    return chainNode;
  }

  for (const child of chainNode.evolves_to ?? []) {
    const match = evolutionChainNodeForSpecies(child, speciesSlug);
    if (match) {
      return match;
    }
  }

  return null;
}

async function isFullyEvolvedSpecies(rawSpecies) {
  const chainUrl = rawSpecies.evolution_chain?.url;
  if (!chainUrl) {
    return true;
  }

  const rawEvolutionChain = await pokeApiGet(chainUrl);
  const node = evolutionChainNodeForSpecies(rawEvolutionChain.chain, rawSpecies.name);
  return (node?.evolves_to?.length ?? 0) === 0;
}

async function expectedPokemonCore(rawPokemon, rawSpecies) {
  const sortedTypes = [...rawPokemon.types].sort((a, b) => a.slot - b.slot);
  const stats = new Map(rawPokemon.stats.map((entry) => [entry.stat.name, entry.base_stat]));
  const isFullyEvolved = await isFullyEvolvedSpecies(rawSpecies);

  return {
    id: rawPokemon.id,
    slug: rawPokemon.name,
    generation: generationNumber(rawSpecies.generation?.name),
    primary_type: sortedTypes[0]?.type?.name ?? "normal",
    secondary_type: sortedTypes[1]?.type?.name ?? null,
    hp: stats.get("hp") ?? 0,
    attack: stats.get("attack") ?? 0,
    defense: stats.get("defense") ?? 0,
    special_attack: stats.get("special-attack") ?? 0,
    special_defense: stats.get("special-defense") ?? 0,
    speed: stats.get("speed") ?? 0,
    is_legendary: Boolean(rawSpecies.is_legendary),
    is_mythical: Boolean(rawSpecies.is_mythical),
    is_fully_evolved: isFullyEvolved,
  };
}

function compareFields(label, expected, actual, fields) {
  const mismatches = [];
  for (const field of fields) {
    if (expected[field] !== actual[field]) {
      mismatches.push(`${field}: expected ${expected[field]}, got ${actual[field]}`);
    }
  }

  return mismatches.map((message) => `${label} ${message}`);
}

function relatedOne(value) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function countEvolutionStages(stages) {
  let count = 0;

  function walk(stage) {
    count += 1;
    for (const child of stage.evolvesTo ?? []) {
      walk(child);
    }
  }

  for (const root of stages) {
    walk(root);
  }

  return count;
}

function findStageBySlug(stages, slug) {
  const normalized = slug.trim().toLowerCase();

  function walk(stage) {
    if (stage.slug === normalized || stage.speciesSlug === normalized) {
      return stage;
    }

    for (const child of stage.evolvesTo ?? []) {
      const match = walk(child);
      if (match) {
        return match;
      }
    }

    return null;
  }

  for (const root of stages) {
    const match = walk(root);
    if (match) {
      return match;
    }
  }

  return null;
}

async function validateEvolutionChain(supabase, slug, expectations) {
  const { data: pokemon, error: pokemonError } = await supabase
    .from("pokemon")
    .select("id, slug, species_slug, evolution_chain_id")
    .eq("slug", slug)
    .maybeSingle();

  if (pokemonError) {
    return [`evolution ${slug}: Supabase query failed: ${pokemonError.message}`];
  }
  if (!pokemon) {
    return [`evolution ${slug}: missing pokemon row`];
  }

  const issues = [];

  if (!expectations.expectChain) {
    if (pokemon.evolution_chain_id) {
      issues.push(`evolution ${slug}: expected no evolution_chain_id, got ${pokemon.evolution_chain_id}`);
    }
    return issues;
  }

  if (!pokemon.evolution_chain_id) {
    issues.push(`evolution ${slug}: missing evolution_chain_id`);
    return issues;
  }

  const { data: chainRow, error: chainError } = await supabase
    .from("evolution_chains")
    .select("id, chain_json")
    .eq("id", pokemon.evolution_chain_id)
    .maybeSingle();

  if (chainError) {
    issues.push(`evolution ${slug}: chain query failed: ${chainError.message}`);
    return issues;
  }
  if (!chainRow) {
    issues.push(`evolution ${slug}: evolution_chains row ${pokemon.evolution_chain_id} missing`);
    return issues;
  }

  const roots = Array.isArray(chainRow.chain_json) ? chainRow.chain_json : [];
  if (roots.length === 0) {
    issues.push(`evolution ${slug}: chain_json is empty`);
    return issues;
  }

  const stageCount = countEvolutionStages(roots);
  if (stageCount < expectations.minStages) {
    issues.push(
      `evolution ${slug}: expected at least ${expectations.minStages} stages, got ${stageCount}`,
    );
  }

  if (expectations.maxStages && stageCount > expectations.maxStages) {
    issues.push(
      `evolution ${slug}: expected at most ${expectations.maxStages} stages, got ${stageCount}`,
    );
  }

  const currentStage = findStageBySlug(roots, slug);
  if (!currentStage) {
    issues.push(`evolution ${slug}: current species not found in chain_json`);
  }

  if (expectations.rootSlug) {
    const rootSlug = roots[0]?.slug ?? roots[0]?.speciesSlug;
    if (rootSlug !== expectations.rootSlug) {
      issues.push(`evolution ${slug}: expected root ${expectations.rootSlug}, got ${rootSlug}`);
    }
  }

  if (expectations.minBranches && currentStage) {
    const branchCount = currentStage.evolvesTo?.length ?? 0;
    if (branchCount < expectations.minBranches) {
      issues.push(
        `evolution ${slug}: expected at least ${expectations.minBranches} branches, got ${branchCount}`,
      );
    }
  }

  return issues;
}

function abilitySignature(entry) {
  return `${entry.slug}:${entry.is_hidden ? "hidden" : "standard"}`;
}

/**
 * @param {import("@supabase/supabase-js").SupabaseClient} supabase
 * @param {number} displayNo
 * @param {{ required?: Array<{ slug: string, form_kind: string }>, optional?: Array<{ slug: string, form_kind: string }> }} spec
 */
async function validatePokemonFormGroup(supabase, displayNo, spec) {
  const required = spec.required ?? spec;
  const optional = Array.isArray(spec) ? [] : (spec.optional ?? []);
  const label = String(displayNo).padStart(4, "0");
  const { data, error } = await supabase
    .from("pokemon")
    .select("slug, form_kind, pokedex_display_no, list_sort_rank, base_slug")
    .eq("pokedex_display_no", displayNo)
    .order("list_sort_rank", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    return [`forms #${label}: query failed: ${error.message}`];
  }

  const rows = data ?? [];
  const issues = [];

  function validateEntry(expected, isRequired) {
    const match = rows.find((row) => row.slug === expected.slug);
    if (!match) {
      if (isRequired) {
        issues.push(`forms #${label}: missing row for ${expected.slug}`);
      }
      return false;
    }

    if (match.form_kind !== expected.form_kind) {
      issues.push(
        `forms #${label}: ${expected.slug} expected form_kind ${expected.form_kind}, got ${match.form_kind}`,
      );
    }

    if (match.pokedex_display_no !== displayNo) {
      issues.push(
        `forms #${label}: ${expected.slug} expected pokedex_display_no ${displayNo}, got ${match.pokedex_display_no}`,
      );
    }

    const expectedRank = displayNo * 10 + (FORM_KIND_RANK[expected.form_kind] ?? 4);
    if (match.list_sort_rank !== expectedRank) {
      issues.push(
        `forms #${label}: ${expected.slug} expected list_sort_rank ${expectedRank}, got ${match.list_sort_rank}`,
      );
    }

    return true;
  }

  for (const expected of required) {
    validateEntry(expected, true);
  }

  for (const expected of optional) {
    validateEntry(expected, false);
  }

  const presentOptional = optional.filter((entry) => rows.some((row) => row.slug === entry.slug));
  const canonicalOrder = [...required, ...presentOptional];
  const knownSlugs = new Set(canonicalOrder.map((entry) => entry.slug));

  for (const row of rows) {
    if (!knownSlugs.has(row.slug) && ["mega", "gigantamax", "regional", "other"].includes(row.form_kind)) {
      issues.push(
        `forms #${label}: unexpected alternate form ${row.slug} (${row.form_kind}) in display group`,
      );
    }
  }

  const actualOrder = rows
    .filter((row) => knownSlugs.has(row.slug))
    .map((row) => row.slug)
    .join(",");
  const expectedOrder = canonicalOrder.map((entry) => entry.slug).join(",");
  if (actualOrder !== expectedOrder) {
    issues.push(`forms #${label}: expected order ${expectedOrder}, got ${actualOrder}`);
  }

  return issues;
}

async function validateDittoHasNoAlternateForms(supabase) {
  const { data, error } = await supabase
    .from("pokemon")
    .select("slug, form_kind")
    .eq("pokedex_display_no", 132)
    .neq("form_kind", "default");

  if (error) {
    return [`forms ditto: query failed: ${error.message}`];
  }

  if ((data ?? []).length > 0) {
    return [`forms ditto: expected only default form, got ${data.map((row) => row.slug).join(", ")}`];
  }

  return [];
}

async function countTable(supabase, table) {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });

  if (error) {
    throw error;
  }

  return count ?? 0;
}

async function validatePokemon(supabase, slug) {
  const rawPokemon = await pokeApiGet(`/pokemon/${slug}`);
  const rawSpecies = await pokeApiGet(`/pokemon-species/${rawPokemon.species.name}`);
  const expected = await expectedPokemonCore(rawPokemon, rawSpecies);

  const { data, error } = await supabase
    .from("pokemon")
    .select("*")
    .eq("slug", expected.slug)
    .maybeSingle();

  if (error) {
    return [`pokemon ${slug}: Supabase query failed: ${error.message}`];
  }
  if (!data) {
    return [`pokemon ${slug}: missing from Supabase`];
  }

  const issues = compareFields(`pokemon ${slug}:`, expected, data, [
    "id",
    "slug",
    "generation",
    "primary_type",
    "secondary_type",
    "hp",
    "attack",
    "defense",
    "special_attack",
    "special_defense",
    "speed",
    "is_legendary",
    "is_mythical",
    "is_fully_evolved",
  ]);

  const expectedAbilities = rawPokemon.abilities
    .map((entry) => ({
      slug: entry.ability?.name,
      is_hidden: Boolean(entry.is_hidden),
    }))
    .filter((entry) => entry.slug)
    .sort((a, b) => abilitySignature(a).localeCompare(abilitySignature(b)));

  const { data: abilityRows, error: abilityError } = await supabase
    .from("pokemon_abilities")
    .select("is_hidden, abilities:ability_id(slug)")
    .eq("pokemon_id", data.id);

  if (abilityError) {
    issues.push(`pokemon ${slug}: ability relationship query failed: ${abilityError.message}`);
    return issues;
  }

  const actualAbilities = (abilityRows ?? [])
    .map((entry) => {
      const ability = relatedOne(entry.abilities);
      return ability?.slug
        ? {
            slug: ability.slug,
            is_hidden: Boolean(entry.is_hidden),
          }
        : null;
    })
    .filter(Boolean)
    .sort((a, b) => abilitySignature(a).localeCompare(abilitySignature(b)));

  if (JSON.stringify(expectedAbilities) !== JSON.stringify(actualAbilities)) {
    issues.push(
      `pokemon ${slug}: ability relationships expected ${expectedAbilities
        .map(abilitySignature)
        .join(", ")}, got ${actualAbilities.map(abilitySignature).join(", ")}`,
    );
  }

  return issues;
}

async function validateAbility(supabase, slug) {
  const rawAbility = await pokeApiGet(`/ability/${slug}`);
  const { data, error } = await supabase
    .from("abilities")
    .select("id, slug, name, description")
    .eq("slug", rawAbility.name)
    .maybeSingle();

  if (error) {
    return [`ability ${slug}: Supabase query failed: ${error.message}`];
  }
  if (!data) {
    return [`ability ${slug}: missing from Supabase`];
  }

  const issues = compareFields(`ability ${slug}:`, {
    id: rawAbility.id,
    slug: rawAbility.name,
  }, data, ["id", "slug"]);

  if (!data.name) {
    issues.push(`ability ${slug}: name is missing`);
  }
  if (!data.description) {
    issues.push(`ability ${slug}: description is missing`);
  }

  return issues;
}

async function validateItem(supabase, slug) {
  const rawItem = await pokeApiGet(`/item/${slug}`);
  const { data, error } = await supabase
    .from("items")
    .select("id, slug, name, category, icon_url")
    .eq("slug", rawItem.name)
    .maybeSingle();

  if (error) {
    return [`item ${slug}: Supabase query failed: ${error.message}`];
  }
  if (!data) {
    return [`item ${slug}: missing from Supabase`];
  }

  const mismatches = compareFields(`item ${slug}:`, {
    id: rawItem.id,
    slug: rawItem.name,
    category: rawItem.category?.name ?? null,
  }, data, ["id", "slug", "category"]);

  if (!data.icon_url && rawItem.sprites?.default) {
    mismatches.push(`item ${slug}: icon_url is missing`);
  }

  return mismatches;
}

async function main() {
  const args = parseArgs(process.argv);
  let supabase;

  try {
    supabase = getSupabaseReadClient();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`Validation skipped: ${message}`);
    if (args.strict) {
      process.exitCode = 1;
    }
    return;
  }

  const tables = [
    "pokemon",
    "abilities",
    "moves",
    "pokemon_abilities",
    "pokemon_moves",
    "items",
    "evolution_chains",
  ];
  const counts = {};
  const issues = [];
  let hasTableReadError = false;

  for (const table of tables) {
    try {
      counts[table] = await countTable(supabase, table);
    } catch (error) {
      issues.push(`table ${table}: ${error instanceof Error ? error.message : String(error)}`);
      counts[table] = 0;
      hasTableReadError = true;
    }
  }

  console.log("Supabase row counts:");
  for (const table of tables) {
    console.log(`  ${table}: ${counts[table]}`);
  }

  if (hasTableReadError) {
    issues.push("Supabase catalog schema is not ready. Run supabase/app-data.sql and supabase/app-storage.sql first.");
  } else if (counts.pokemon === 0 || counts.items === 0) {
    issues.push("Supabase catalog data appears empty. Run imports before strict validation.");
  }

  if (issues.length > 0) {
    console.log("Supabase data validation found setup issues:");
    issues.forEach((issue) => console.log(`  - ${issue}`));
    if (args.strict) {
      process.exitCode = 1;
    }
    return;
  }

  for (const slug of args.pokemon) {
    issues.push(...await validatePokemon(supabase, slug));
  }

  issues.push(
    ...(await validateEvolutionChain(supabase, "bulbasaur", {
      expectChain: true,
      rootSlug: "bulbasaur",
      minStages: 3,
    })),
  );
  issues.push(
    ...(await validateEvolutionChain(supabase, "eevee", {
      expectChain: true,
      rootSlug: "eevee",
      minStages: 4,
      minBranches: 3,
    })),
  );
  issues.push(
    ...(await validateEvolutionChain(supabase, "ditto", {
      expectChain: true,
      rootSlug: "ditto",
      minStages: 1,
      maxStages: 1,
    })),
  );

  issues.push(
    ...(await validatePokemonFormGroup(supabase, 3, {
      required: [
        { slug: "venusaur", form_kind: "default" },
        { slug: "venusaur-mega", form_kind: "mega" },
        { slug: "venusaur-gmax", form_kind: "gigantamax" },
      ],
    })),
  );
  issues.push(
    ...(await validatePokemonFormGroup(supabase, 6, {
      required: [
        { slug: "charizard", form_kind: "default" },
        { slug: "charizard-mega-x", form_kind: "mega" },
        { slug: "charizard-mega-y", form_kind: "mega" },
        { slug: "charizard-gmax", form_kind: "gigantamax" },
      ],
    })),
  );
  issues.push(
    ...(await validatePokemonFormGroup(supabase, 80, {
      required: [
        { slug: "slowbro", form_kind: "default" },
        { slug: "slowbro-mega", form_kind: "mega" },
        { slug: "slowbro-galar", form_kind: "regional" },
      ],
      optional: [{ slug: "slowbro-gmax", form_kind: "gigantamax" }],
    })),
  );
  issues.push(...(await validateDittoHasNoAlternateForms(supabase)));

  for (const slug of args.abilities) {
    issues.push(...await validateAbility(supabase, slug));
  }

  for (const slug of args.items) {
    issues.push(...await validateItem(supabase, slug));
  }

  if (issues.length === 0) {
    console.log("Supabase data validation passed.");
    return;
  }

  console.log("Supabase data validation found issues:");
  issues.forEach((issue) => console.log(`  - ${issue}`));

  if (args.strict) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
