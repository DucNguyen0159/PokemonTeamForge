/**
 * Copies hosted sprites from base species rows onto form variants with empty artwork.
 * Safe to re-run; only updates pokemon rows missing sprite_normal_url.
 *
 * Usage:
 *   npm run fix:missing-sprites
 *   npm run fix:missing-sprites -- --dry-run
 */

import process from "node:process";

import {
  copyHostedPokemonSprite,
  getSupabaseAdminClient,
  isHostedPokemonSpriteUrl,
} from "./lib/import-utils.mjs";

function parseArgs(argv = process.argv) {
  return {
    dryRun: argv.includes("--dry-run"),
  };
}

async function listPokemonMissingSprites(supabase) {
  const rows = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("pokemon")
      .select("id, slug, species_slug, sprite_normal_url")
      .order("id")
      .range(from, from + 999);

    if (error) {
      throw error;
    }

    if (!data?.length) {
      break;
    }

    rows.push(...data.filter((row) => !row.sprite_normal_url?.trim()));
    if (data.length < 1000) {
      break;
    }
    from += 1000;
  }

  return rows;
}

async function getSpeciesSpriteSource(supabase, speciesSlug, excludeSlug) {
  const { data, error } = await supabase
    .from("pokemon")
    .select("slug, sprite_normal_url")
    .eq("species_slug", speciesSlug)
    .order("id");

  if (error) {
    throw error;
  }

  const candidates = (data ?? []).filter(
    (row) =>
      row.slug !== excludeSlug &&
      row.sprite_normal_url &&
      isHostedPokemonSpriteUrl(row.sprite_normal_url),
  );

  return (
    candidates.find((row) => row.slug === speciesSlug) ??
    candidates.find((row) => !row.slug.includes("-")) ??
    candidates[0] ??
    null
  );
}

async function main() {
  const args = parseArgs();
  const supabase = getSupabaseAdminClient();
  const missingRows = await listPokemonMissingSprites(supabase);

  if (missingRows.length === 0) {
    console.log("No Pokemon rows are missing sprite_normal_url.");
    return;
  }

  console.log(`Found ${missingRows.length} Pokemon without sprites.`);

  let fixed = 0;
  let skipped = 0;

  for (const row of missingRows) {
    const source = await getSpeciesSpriteSource(supabase, row.species_slug, row.slug);
    if (!source) {
      console.warn(`  [skip] #${row.id} ${row.slug}: no hosted sprite found for species ${row.species_slug}`);
      skipped += 1;
      continue;
    }

    if (args.dryRun) {
      console.log(`  [dry-run] #${row.id} ${row.slug} <- ${source.slug}`);
      fixed += 1;
      continue;
    }

    const hostedUrl = await copyHostedPokemonSprite(supabase, {
      fromSlug: source.slug,
      toSlug: row.slug,
    });

    const { error } = await supabase
      .from("pokemon")
      .update({ sprite_normal_url: hostedUrl })
      .eq("id", row.id);

    if (error) {
      throw error;
    }

    console.log(`  [fixed] #${row.id} ${row.slug} <- ${source.slug}`);
    fixed += 1;
  }

  console.log(`Done. Fixed ${fixed}, skipped ${skipped}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
