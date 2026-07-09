import process from "node:process";
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

export const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";
export const ITEM_ICON_BUCKET = "item-icons";
export const POKEMON_SPRITE_BUCKET = "pokemon-sprites";

const HOSTED_SPRITE_PATH = `/storage/v1/object/public/${POKEMON_SPRITE_BUCKET}/`;
const GITHUB_SPRITE_PREFIX = "https://raw.githubusercontent.com/PokeAPI/sprites/master/";

export function toPokemonSpriteDownloadUrls(sourceUrl, { slug, speciesSlug } = {}) {
  if (!sourceUrl) {
    return [];
  }

  const pathSuffix = sourceUrl.includes("/PokeAPI/sprites/master/")
    ? sourceUrl.split("/PokeAPI/sprites/master/")[1]
    : null;

  if (!pathSuffix) {
    return [sourceUrl];
  }

  const urls = ["cdn.jsdelivr.net", "fastly.jsdelivr.net", "gcore.jsdelivr.net"].map(
    (host) => `https://${host}/gh/PokeAPI/sprites@master/${pathSuffix}`,
  );

  urls.push(`${GITHUB_SPRITE_PREFIX}${pathSuffix}`);

  if (slug && !pathSuffix.includes("/shiny/")) {
    const dbSlug = (speciesSlug || slug).toLowerCase();
    urls.push(`https://img.pokemondb.net/artwork/large/${dbSlug}.jpg`);
  }

  return [...new Set(urls)];
}

async function downloadSpriteSource(sourceUrl, slug, variant, meta = {}) {
  const candidates = toPokemonSpriteDownloadUrls(sourceUrl, meta);

  for (const candidateUrl of candidates) {
    const host = new URL(candidateUrl).hostname;
    const isJsDelivr = host.endsWith("jsdelivr.net");
    const maxAttempts = isJsDelivr ? 1 : 3;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const response = await fetch(candidateUrl);
      if (response.ok) {
        return response;
      }

      if (response.status === 403) {
        console.warn(`[sprite] 403 for ${slug}/${variant} via ${host}, trying next mirror`);
        break;
      }

      if (response.status === 429 || response.status === 503) {
        const delayMs = Math.min(8_000, 1_000 * 2 ** attempt);
        console.warn(
          `[sprite] ${response.status} for ${slug}/${variant} via ${host}, retrying in ${delayMs}ms (attempt ${attempt + 1}/${maxAttempts})`,
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }

      console.warn(`[sprite] ${response.status} for ${slug}/${variant} via ${host}`);
      break;
    }
  }

  return null;
}

async function getStoredSpritePublicUrl(supabase, slug, variant) {
  const storagePath = `${slug}/${variant}.png`;
  const { data } = supabase.storage.from(POKEMON_SPRITE_BUCKET).getPublicUrl(storagePath);
  if (!data.publicUrl || !isHostedPokemonSpriteUrl(data.publicUrl)) {
    return null;
  }

  const headResponse = await fetch(data.publicUrl, { method: "HEAD" });
  return headResponse.ok ? data.publicUrl : null;
}

export function pickPokeApiSpriteUrl(pokemon, variant = "normal") {
  const officialArtwork = pokemon.sprites?.other?.["official-artwork"];
  const home = pokemon.sprites?.other?.home;
  if (variant === "shiny") {
    return officialArtwork?.front_shiny ?? home?.front_shiny ?? pokemon.sprites?.front_shiny ?? "";
  }

  return officialArtwork?.front_default ?? home?.front_default ?? pokemon.sprites?.front_default ?? "";
}

export function isHostedPokemonSpriteUrl(url) {
  return Boolean(url && url.includes(HOSTED_SPRITE_PATH));
}

export async function uploadPokemonSprite(
  supabase,
  { slug, variant, sourceUrl, speciesSlug },
  args,
) {
  if (!sourceUrl) {
    return "";
  }

  if (args.dryRun) {
    return sourceUrl;
  }

  const storagePath = `${slug}/${variant}.png`;

  if (!args.refreshSprites) {
    const existingHostedUrl = await getStoredSpritePublicUrl(supabase, slug, variant);
    if (existingHostedUrl) {
      return existingHostedUrl;
    }
  }

  let response = await downloadSpriteSource(sourceUrl, slug, variant, { speciesSlug, slug });

  if (!response?.ok) {
    console.warn(
      `[sprite] Download failed (${response?.status ?? "unknown"}) for ${slug}/${variant}: ${sourceUrl}`,
    );
    return sourceUrl;
  }

  const contentType = response.headers.get("content-type") || "image/png";
  const body = await response.arrayBuffer();

  const { error } = await supabase.storage.from(POKEMON_SPRITE_BUCKET).upload(storagePath, body, {
    contentType,
    upsert: true,
  });

  if (error && !String(error.message).toLowerCase().includes("already exists")) {
    throw error;
  }

  const { data } = supabase.storage.from(POKEMON_SPRITE_BUCKET).getPublicUrl(storagePath);
  return data.publicUrl || sourceUrl;
}

export async function copyHostedPokemonSprite(supabase, { fromSlug, toSlug, variant = "normal" }) {
  const fromPath = `${fromSlug}/${variant}.png`;
  const toPath = `${toSlug}/${variant}.png`;

  const { data: file, error: downloadError } = await supabase.storage
    .from(POKEMON_SPRITE_BUCKET)
    .download(fromPath);

  if (downloadError) {
    throw new Error(`Failed to read ${fromPath}: ${downloadError.message}`);
  }

  const body = await file.arrayBuffer();
  const contentType = file.type || "image/png";

  const { error: uploadError } = await supabase.storage.from(POKEMON_SPRITE_BUCKET).upload(toPath, body, {
    contentType,
    upsert: true,
  });

  if (uploadError) {
    throw new Error(`Failed to write ${toPath}: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(POKEMON_SPRITE_BUCKET).getPublicUrl(toPath);
  return data.publicUrl;
}

export async function hydratePokemonRowSpriteUrl(supabase, row, args) {
  const normalSource = row.sprite_normal_url;
  const shinySource = row.sprite_shiny_url;

  if (isHostedPokemonSpriteUrl(normalSource)) {
    return "skipped";
  }

  row.sprite_normal_url = await uploadPokemonSprite(
    supabase,
    { slug: row.slug, variant: "normal", sourceUrl: normalSource, speciesSlug: row.species_slug },
    args,
  );

  if (shinySource && args.includeShinySprites) {
    row.sprite_shiny_url = await uploadPokemonSprite(
      supabase,
      { slug: row.slug, variant: "shiny", sourceUrl: shinySource, speciesSlug: row.species_slug },
      args,
    );
  }

  return isHostedPokemonSpriteUrl(row.sprite_normal_url) ? "uploaded" : "failed";
}

export async function hydratePokemonRowSpriteUrls(supabase, pokemonRows, args) {
  if (args.dryRun) {
    return { uploaded: 0, skipped: pokemonRows.length, failed: 0 };
  }

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const [index, row] of pokemonRows.entries()) {
    const normalSource = row.sprite_normal_url;
    const shinySource = row.sprite_shiny_url;

    if (
      isHostedPokemonSpriteUrl(normalSource) &&
      (!args.includeShinySprites || !shinySource || isHostedPokemonSpriteUrl(shinySource))
    ) {
      skipped += 1;
    } else {
      const result = await hydratePokemonRowSpriteUrl(supabase, row, args);
      if (result === "skipped") {
        skipped += 1;
      } else if (result === "uploaded") {
        uploaded += 1;
      } else {
        failed += 1;
      }
    }

    if ((index + 1) % 25 === 0 || index === pokemonRows.length - 1) {
      console.log(`Uploaded/hosted sprites for ${index + 1}/${pokemonRows.length} Pokemon.`);
    }

    await new Promise((resolve) => setTimeout(resolve, 900));
  }

  return { uploaded, skipped, failed };
}

function parseEnvLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) {
    return null;
  }

  const equalsIndex = trimmed.indexOf("=");
  if (equalsIndex === -1) {
    return null;
  }

  const key = trimmed.slice(0, equalsIndex).trim();
  let value = trimmed.slice(equalsIndex + 1).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return key ? { key, value } : null;
}

export function loadLocalEnv() {
  for (const fileName of [".env.local", ".env"]) {
    const filePath = path.join(process.cwd(), fileName);
    if (!fs.existsSync(filePath)) {
      continue;
    }

    const text = fs.readFileSync(filePath, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const parsed = parseEnvLine(line);
      if (parsed && process.env[parsed.key] === undefined) {
        process.env[parsed.key] = parsed.value;
      }
    }
  }
}

loadLocalEnv();

export function parseCommonArgs(argv = process.argv) {
  const args = {
    dryRun: false,
    limit: Infinity,
    force: false,
    includeShinySprites: false,
    refreshSprites: false,
  };

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--dry-run") {
      args.dryRun = true;
    } else if (arg === "--force") {
      args.force = true;
    } else if (arg === "--include-shiny-sprites") {
      args.includeShinySprites = true;
    } else if (arg === "--refresh-sprites") {
      args.refreshSprites = true;
    } else if (arg === "--limit" && argv[index + 1]) {
      args.limit = Number(argv[index + 1]);
      index += 1;
    }
  }

  return args;
}

export function getSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Service role is required for import scripts.",
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function getSupabaseReadClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL and either SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function pokeApiGet(pathOrUrl) {
  const url =
    pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")
      ? pathOrUrl
      : `${POKEAPI_BASE_URL}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`PokéAPI request failed: ${response.status} ${response.statusText} (${url})`);
  }

  return response.json();
}

export async function pokeApiGetAbility(slugOrUrl) {
  if (slugOrUrl.startsWith("http://") || slugOrUrl.startsWith("https://")) {
    return pokeApiGet(slugOrUrl);
  }

  const slug = String(slugOrUrl)
    .trim()
    .replace(/^\/ability\//, "")
    .replace(/\/$/, "");
  const candidates = [
    `${POKEAPI_BASE_URL}/ability/${slug}`,
    `${POKEAPI_BASE_URL}/ability/${slug}/`,
  ];

  let lastError = new Error(`PokéAPI ability request failed for ${slug}`);
  for (const url of candidates) {
    const response = await fetch(url);
    if (response.ok) {
      return response.json();
    }

    lastError = new Error(`PokéAPI request failed: ${response.status} ${response.statusText} (${url})`);
  }

  throw lastError;
}

export function slugify(input) {
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function createImportRun(supabase, target, metadata = {}) {
  const { data, error } = await supabase
    .from("import_runs")
    .insert({
      source: "pokeapi",
      target,
      status: "started",
      metadata,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

export async function finishImportRun(supabase, id, patch) {
  const { error } = await supabase
    .from("import_runs")
    .update({
      ...patch,
      finished_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function runImport(target, args, worker) {
  const supabase = args.dryRun ? null : getSupabaseAdminClient();
  const importRunId = args.dryRun
    ? null
    : await createImportRun(supabase, target, {
        limit: Number.isFinite(args.limit) ? args.limit : null,
        force: args.force,
      });

  try {
    const result = await worker({ supabase, args });

    if (importRunId) {
      await finishImportRun(supabase, importRunId, {
        status: "succeeded",
        rows_processed: result.rowsProcessed ?? 0,
        metadata: result.metadata ?? {},
      });
    }

    return result;
  } catch (error) {
    if (importRunId) {
      await finishImportRun(supabase, importRunId, {
        status: "failed",
        error_message: error instanceof Error ? error.message : String(error),
      });
    }
    throw error;
  }
}
