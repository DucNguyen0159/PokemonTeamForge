/**
 * Validates Mega Stone catalog consistency between champions-mega-stones.ts, SQL backfill, and live APIs.
 *
 * Usage:
 *   node scripts/check-mega-stone-consistency.mjs
 *   node scripts/check-mega-stone-consistency.mjs --strict
 *   node scripts/check-mega-stone-consistency.mjs --base-url http://localhost:3000
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = path.resolve(import.meta.dirname, "..");
const MAPPING_FILE = path.join(ROOT, "src/data/champions-mega-stones.ts");
const SQL_FILE = path.join(ROOT, "supabase/champions-mega-stones.sql");

function parseArgs(argv = process.argv) {
  const args = { strict: false, baseUrl: process.env.CHECK_BASE_URL ?? "http://localhost:3000" };
  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--strict") {
      args.strict = true;
    } else if (arg === "--base-url" && argv[index + 1]) {
      args.baseUrl = argv[index + 1];
      index += 1;
    }
  }
  return args;
}

function extractQuotedValues(content, fieldName) {
  const pattern = new RegExp(`${fieldName}:\\s*"([^"]+)"`, "g");
  return [...content.matchAll(pattern)].map((match) => match[1]);
}

function unique(values) {
  return [...new Set(values)];
}

function readMappingCatalog() {
  const content = fs.readFileSync(MAPPING_FILE, "utf8");
  const supplementContent = content
    .split("\n")
    .filter((line) => !line.includes("inPokeApiCatalog: true"))
    .join("\n");
  const itemSlugs = unique(extractQuotedValues(content, "itemSlug"));
  const megaPokemonSlugs = unique(extractQuotedValues(content, "megaPokemonSlug"));
  const supplementSlugs = unique(extractQuotedValues(supplementContent, "itemSlug"));
  const supplementMegaSlugs = unique(extractQuotedValues(supplementContent, "megaPokemonSlug"));
  return { itemSlugs, megaPokemonSlugs, supplementSlugs, supplementMegaSlugs };
}

function readSqlSupplementSlugs() {
  const content = fs.readFileSync(SQL_FILE, "utf8");
  return unique([...content.matchAll(/\(\d+,\s*'([^']+)'/g)].map((match) => match[1]));
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${url}`);
  }
  return response.json();
}

/** The list endpoint caps `limit` at 100, so verify each mega form via targeted search instead. */
async function findMissingPokemonSlugs(baseUrl, slugs, chunkSize = 8) {
  const missing = [];
  for (let start = 0; start < slugs.length; start += chunkSize) {
    const chunk = slugs.slice(start, start + chunkSize);
    const results = await Promise.all(
      chunk.map(async (slug) => {
        const payload = await fetchJson(`${baseUrl}/api/pokemon?search=${encodeURIComponent(slug)}&limit=100`);
        const entries = payload.data?.pokemon ?? payload.pokemon ?? [];
        return entries.some((entry) => entry.slug === slug) ? null : slug;
      }),
    );
    for (const slug of results) {
      if (slug) {
        missing.push(slug);
      }
    }
  }
  return missing;
}

async function main() {
  const args = parseArgs();
  const catalog = readMappingCatalog();
  const sqlSlugs = readSqlSupplementSlugs();
  const issues = [];
  const notes = [];

  const mappingOnly = catalog.supplementSlugs.filter((slug) => !sqlSlugs.includes(slug));
  const sqlOnly = sqlSlugs.filter((slug) => !catalog.supplementSlugs.includes(slug));
  if (mappingOnly.length > 0) {
    issues.push(`Supplement slugs in TS but missing from SQL: ${mappingOnly.join(", ")}`);
  }
  if (sqlOnly.length > 0) {
    issues.push(`Supplement slugs in SQL but missing from TS: ${sqlOnly.join(", ")}`);
  }

  let items = [];
  let apiReachable = true;
  try {
    const itemsPayload = await fetchJson(`${args.baseUrl}/api/items?competitiveOnly=true`);
    items = itemsPayload.data?.items ?? itemsPayload.items ?? [];
  } catch (error) {
    apiReachable = false;
    issues.push(
      `Could not reach local API (${args.baseUrl}). Start dev server to validate live catalog. ${error instanceof Error ? error.message : error}`,
    );
  }

  if (items.length > 0) {
    const itemSlugSet = new Set(items.map((entry) => entry.slug));
    const missingSupplements = catalog.supplementSlugs.filter((slug) => !itemSlugSet.has(slug));
    if (missingSupplements.length > 0) {
      issues.push(
        `Supplement Mega Stones missing from /api/items (run supabase/champions-mega-stones.sql): ${missingSupplements.join(", ")}`,
      );
    }

    const nonMegaCompetitive = ["eviolite", "meteorite"].filter((slug) => itemSlugSet.has(slug));
    if (nonMegaCompetitive.length > 0) {
      notes.push(
        `Non-mega items still competitive (expected; legality uses curated mapping so these are no longer treated as Mega Stones): ${nonMegaCompetitive.join(", ")}`,
      );
    }
  }

  if (apiReachable) {
    try {
      const missingMegaForms = await findMissingPokemonSlugs(args.baseUrl, catalog.supplementMegaSlugs);
      if (missingMegaForms.length > 0) {
        issues.push(`Supplement mega forms missing from pokemon API: ${missingMegaForms.join(", ")}`);
      }
    } catch (error) {
      issues.push(
        `Failed verifying mega forms against pokemon API. ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  console.log("Mega Stone consistency check");
  console.log(`- Mapping item slugs: ${catalog.itemSlugs.length}`);
  console.log(`- Mapping mega forms: ${catalog.megaPokemonSlugs.length}`);
  console.log(`- Supplement slugs (TS): ${catalog.supplementSlugs.length}`);
  console.log(`- Supplement slugs (SQL): ${sqlSlugs.length}`);

  if (notes.length > 0) {
    console.log("\nNotes (informational):");
    for (const note of notes) {
      console.log(`- ${note}`);
    }
  }

  if (issues.length === 0) {
    console.log("\nOK: no issues found.");
    process.exit(0);
  }

  console.log("\nIssues:");
  for (const issue of issues) {
    console.log(`- ${issue}`);
  }

  if (args.strict) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
