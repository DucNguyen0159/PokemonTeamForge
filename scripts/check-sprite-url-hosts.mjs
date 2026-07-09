/**
 * Validates that pokemon.sprite_normal_url values point at hosted Supabase Storage,
 * not hotlinked GitHub PokeAPI sprites (which rate-limit in production).
 *
 * Usage:
 *   npm run check:sprite-hosts
 *   npm run check:sprite-hosts -- --strict
 */

import process from "node:process";

import { getSupabaseReadClient, isHostedPokemonSpriteUrl } from "./lib/import-utils.mjs";

function parseArgs(argv = process.argv) {
  return {
    strict: argv.includes("--strict"),
  };
}

async function main() {
  const args = parseArgs();
  const supabase = getSupabaseReadClient();

  const { data, error } = await supabase
    .from("pokemon")
    .select("id, slug, sprite_normal_url")
    .order("id");

  if (error) {
    throw error;
  }

  const rows = data ?? [];
  const external = rows.filter((row) => row.sprite_normal_url && !isHostedPokemonSpriteUrl(row.sprite_normal_url));
  const missing = rows.filter((row) => !row.sprite_normal_url?.trim());

  console.log(`Checked ${rows.length} Pokemon rows.`);
  console.log(`Hosted sprites: ${rows.length - external.length - missing.length}`);
  console.log(`External (GitHub/PokeAPI hotlink): ${external.length}`);
  console.log(`Missing sprite URL: ${missing.length}`);

  if (external.length > 0) {
    console.log("\nSample external URLs:");
    external.slice(0, 5).forEach((row) => {
      console.log(`  #${row.id} ${row.slug}: ${row.sprite_normal_url}`);
    });
  }

  if (args.strict && (external.length > 0 || missing.length > 0)) {
    console.error("\nSprite host check failed. Run npm run import:pokemon-data to upload sprites.");
    process.exitCode = 1;
    return;
  }

  if (external.length === 0 && missing.length === 0) {
    console.log("\nAll Pokemon sprites are hosted in Supabase Storage.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
