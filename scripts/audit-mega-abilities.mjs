/**
 * Preflight audit for mega-form abilities on PokéAPI.
 * Tests the same fetch path used by import-pokemon-data.mjs (`entry.ability.url`).
 *
 * Usage:
 *   node scripts/audit-mega-abilities.mjs
 *   npm run audit:mega-abilities
 */

import { POKEAPI_BASE_URL, pokeApiGet } from "./lib/import-utils.mjs";

const MEGA_SLUG_PATTERN = /-mega(-[xyz])?$/;

async function listAllPokemonRefs() {
  const refs = [];
  let nextUrl = `${POKEAPI_BASE_URL}/pokemon?limit=2000&offset=0`;

  while (nextUrl) {
    const page = await pokeApiGet(nextUrl);
    refs.push(...page.results);
    nextUrl = page.next;
  }

  return refs;
}

async function testAbilityFetch(url) {
  const response = await fetch(url);
  return {
    url,
    ok: response.ok,
    status: response.status,
  };
}

async function auditMegaForm(ref) {
  let pokemon;
  try {
    pokemon = await pokeApiGet(ref.url);
  } catch (error) {
    return {
      slug: ref.name,
      id: null,
      fetchError: error instanceof Error ? error.message : String(error),
      abilities: [],
    };
  }

  const abilityChecks = await Promise.all(
    pokemon.abilities.map(async (entry) => {
      const importerCheck = await testAbilityFetch(entry.ability.url);
      const slugCheck = await testAbilityFetch(
        `${POKEAPI_BASE_URL}/ability/${entry.ability.name}`,
      );

      return {
        slug: entry.ability.name,
        canonicalUrl: entry.ability.url,
        slot: entry.slot,
        isHidden: entry.is_hidden,
        importerCheck,
        slugCheck,
      };
    }),
  );

  return {
    slug: pokemon.name,
    id: pokemon.id,
    fetchError: null,
    abilities: abilityChecks,
  };
}

async function main() {
  console.log("Fetching PokéAPI Pokémon index...");
  const allRefs = await listAllPokemonRefs();
  const megaRefs = allRefs
    .filter((ref) => MEGA_SLUG_PATTERN.test(ref.name))
    .sort((a, b) => a.name.localeCompare(b.name));

  console.log(`Found ${megaRefs.length} mega forms to audit.\n`);

  const megaResults = [];
  for (const [index, ref] of megaRefs.entries()) {
    const result = await auditMegaForm(ref);
    megaResults.push(result);

    if ((index + 1) % 10 === 0 || index === megaRefs.length - 1) {
      console.log(`Audited ${index + 1}/${megaRefs.length} mega forms...`);
    }
  }

  const importerFailures = [];
  const slugOnlyFailures = [];
  const emptyAbilityMegas = [];
  const pokemonFetchFailures = megaResults.filter((mega) => mega.fetchError);
  const uniqueAbilities = new Map();

  for (const mega of megaResults) {
    if (!mega.fetchError && mega.abilities.length === 0) {
      emptyAbilityMegas.push(mega);
    }

    for (const ability of mega.abilities) {
      uniqueAbilities.set(ability.slug, ability);

      if (!ability.importerCheck.ok) {
        importerFailures.push({
          megaSlug: mega.slug,
          megaId: mega.id,
          abilitySlug: ability.slug,
          canonicalUrl: ability.canonicalUrl,
          status: ability.importerCheck.status,
        });
      } else if (!ability.slugCheck.ok) {
        slugOnlyFailures.push({
          megaSlug: mega.slug,
          abilitySlug: ability.slug,
          canonicalUrl: ability.canonicalUrl,
          slugUrl: ability.slugCheck.url,
          status: ability.slugCheck.status,
        });
      }
    }
  }

  const passingMegas = megaResults.filter(
    (mega) =>
      !mega.fetchError &&
      (mega.abilities.length === 0 || mega.abilities.every((ability) => ability.importerCheck.ok)),
  );

  console.log("\n=== Mega ability preflight audit ===");
  console.log(`Mega forms scanned: ${megaResults.length}`);
  console.log(`Mega forms with Pokémon fetch errors: ${pokemonFetchFailures.length}`);
  console.log(`Mega forms with empty abilities on PokéAPI: ${emptyAbilityMegas.length}`);
  console.log(`Unique abilities on mega forms: ${uniqueAbilities.size}`);
  console.log(`Mega forms ready for import fetch path: ${passingMegas.length}/${megaResults.length}`);
  console.log(`Importer canonical URL failures: ${importerFailures.length}`);
  console.log(`Slug-only failures (canonical ok, slug 404): ${slugOnlyFailures.length}`);

  if (pokemonFetchFailures.length > 0) {
    console.log("\n--- POKÉMON FETCH FAILURES ---");
    for (const mega of pokemonFetchFailures) {
      console.log(`${mega.slug}: ${mega.fetchError}`);
    }
  }

  if (emptyAbilityMegas.length > 0) {
    console.log("\n--- EMPTY ABILITIES ON POKÉAPI (upstream data incomplete) ---");
    for (const mega of emptyAbilityMegas) {
      console.log(`${mega.slug} (id=${mega.id})`);
    }
  }

  if (importerFailures.length > 0) {
    console.log("\n--- IMPORTER FAILURES (entry.ability.url) ---");
    for (const failure of importerFailures) {
      console.log(
        `${failure.megaSlug}: ${failure.abilitySlug} -> ${failure.canonicalUrl} HTTP ${failure.status}`,
      );
    }
  }

  if (slugOnlyFailures.length > 0) {
    console.log("\n--- SLUG-ONLY WARNINGS (import still works via canonical URL) ---");
    for (const failure of slugOnlyFailures) {
      console.log(
        `${failure.megaSlug}: ${failure.abilitySlug} slug ${failure.slugUrl} -> HTTP ${failure.status}`,
      );
    }
  }

  if (importerFailures.length === 0 && pokemonFetchFailures.length === 0) {
    console.log("\nImporter canonical URL checks passed for all mega abilities.");
  }

  console.log("\n--- All mega forms and abilities ---");
  for (const mega of megaResults) {
    if (mega.fetchError) {
      console.log(`${mega.slug}: POKÉMON FETCH FAIL`);
      continue;
    }

    if (mega.abilities.length === 0) {
      console.log(`${mega.slug} (id=${mega.id}): (no abilities on PokéAPI)`);
      continue;
    }

    const abilitySummary = mega.abilities
      .map((ability) => {
        const hidden = ability.isHidden ? " [hidden]" : "";
        const mark = ability.importerCheck.ok ? "ok" : "FAIL";
        const slugNote = ability.importerCheck.ok && !ability.slugCheck.ok ? " [slug-404]" : "";
        return `${ability.slug}${hidden} [${mark}]${slugNote}`;
      })
      .join(", ");
    console.log(`${mega.slug} (id=${mega.id}): ${abilitySummary}`);
  }

  if (importerFailures.length > 0 || pokemonFetchFailures.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
