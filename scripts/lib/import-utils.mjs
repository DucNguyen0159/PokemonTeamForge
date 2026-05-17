import process from "node:process";
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

export const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";
export const ITEM_ICON_BUCKET = "item-icons";

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
  };

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--dry-run") {
      args.dryRun = true;
    } else if (arg === "--force") {
      args.force = true;
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
