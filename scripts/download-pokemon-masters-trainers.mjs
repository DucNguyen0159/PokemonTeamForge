/**
 * Fetches Pokémon Masters EX trainer sprite PNGs from Bulbagarden Archives
 * (MediaWiki API) into public/team-card/trainers/masters/ and writes
 * src/data/team-card-masters-manifest.json for the app.
 *
 * License: Bulbagarden Archives content is under CC BY-NC-SA 2.5 (non-commercial).
 * Source category: https://archives.bulbagarden.net/wiki/Category:Pok%C3%A9mon_Masters_Trainer_sprites
 *
 * Usage:
 *   node scripts/download-pokemon-masters-trainers.mjs [--limit N] [--dry-run] [--force]
 *
 *   --force  Re-download even when the PNG already exists locally.
 */

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const API = "https://archives.bulbagarden.net/w/api.php";
const CATEGORY = "Category:Pokémon_Masters_Trainer_sprites";
const OUT_DIR = path.join(process.cwd(), "public/team-card/trainers/masters");
const MANIFEST_PATH = path.join(process.cwd(), "src/data/team-card-masters-manifest.json");

const VARIANT_PREFIX = /^Spr Masters /i;

/** Tokens that start a subtype segment (outfit / season / pose) so we group by leading trainer name. */
const GROUP_STOP_TOKENS = new Set([
  "2",
  "3",
  "EX",
  "Alt",
  "Arc",
  "Academy",
  "Champion",
  "Classic",
  "Costume",
  "Sygna",
  "Fall",
  "Summer",
  "Spring",
  "Winter",
  "Holiday",
  "Palentine",
  "Palentines",
  "Special",
  "Cool",
  "Cute",
  "Dark",
  "Fiery",
  "Fresh",
]);

function parseArgs(argv) {
  let limit = Infinity;
  let dryRun = false;
  let force = false;
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--limit" && argv[i + 1]) {
      limit = Number(argv[i + 1]);
      i++;
    } else if (argv[i] === "--dry-run") {
      dryRun = true;
    } else if (argv[i] === "--force") {
      force = true;
    }
  }
  return { limit, dryRun, force };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function apiGet(extraParams) {
  const url = new URL(API);
  for (const [k, v] of Object.entries(extraParams)) {
    if (v === undefined) continue;
    url.searchParams.set(k, String(v));
  }
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API ${res.status} ${res.statusText}`);
  }
  return res.json();
}

async function fetchAllFileTitles() {
  const titles = [];
  let cmcontinue;
  /** @type {string|undefined} */
  let continueGeneral;

  for (;;) {
    const params = {
      action: "query",
      list: "categorymembers",
      cmtitle: CATEGORY,
      cmtype: "file",
      cmlimit: "500",
      format: "json",
    };
    if (cmcontinue) params.cmcontinue = cmcontinue;
    if (continueGeneral) params.continue = continueGeneral;

    const data = await apiGet(params);
    for (const m of data.query?.categorymembers ?? []) {
      titles.push(m.title);
    }

    if (!data.continue) break;
    cmcontinue = data.continue.cmcontinue;
    continueGeneral = data.continue.continue;
    await sleep(250);
  }

  return titles;
}

/**
 * @param {string[]} titles up to 50
 */
async function fetchImageUrlsForTitles(titles) {
  const params = {
    action: "query",
    titles: titles.join("|"),
    prop: "imageinfo",
    iiprop: "url",
    format: "json",
  };
  const data = await apiGet(params);
  /** @type {Map<string, string>} */
  const map = new Map();
  for (const page of Object.values(data.query?.pages ?? {})) {
    const imageUrl = page.imageinfo?.[0]?.url;
    if (page.title && imageUrl) {
      map.set(page.title, imageUrl);
    }
  }
  return map;
}

function fileTitleToBareName(fileTitle) {
  let s = fileTitle.replace(/^File:/i, "");
  if (s.toLowerCase().endsWith(".png")) {
    s = s.slice(0, -4);
  }
  return s;
}

function slugifyFileName(bareName) {
  return bareName
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function baseTrainerGroupName(rest) {
  const parts = rest.split(/\s+/).filter(Boolean);
  const taken = [];
  for (const p of parts) {
    if (GROUP_STOP_TOKENS.has(p)) break;
    if (/^\d{4}$/.test(p)) break;
    taken.push(p);
  }
  return taken.join(" ") || rest;
}

/**
 * @param {string} fileTitle "File:Spr Masters Aaron.png"
 */
function parseTrainerEntry(fileTitle) {
  const bare = fileTitleToBareName(fileTitle);
  const displayName = VARIANT_PREFIX.test(bare) ? bare.replace(VARIANT_PREFIX, "") : bare;
  const groupName = VARIANT_PREFIX.test(bare)
    ? baseTrainerGroupName(displayName)
    : displayName.split(/\s+/)[0] || displayName;
  const slug = slugifyFileName(bare);
  const characterSlug = slugifyFileName(groupName);
  return { slug, characterSlug, name: displayName, groupDisplayName: groupName };
}

/**
 * @param {number} concurrency
 * @param {unknown[]} jobs
 * @param {(job: unknown, index: number) => Promise<void>} fn
 */
async function runPool(concurrency, jobs, fn) {
  let index = 0;
  async function worker() {
    for (;;) {
      const i = index++;
      if (i >= jobs.length) return;
      await fn(jobs[i], i);
    }
  }
  const n = Math.max(1, Math.min(concurrency, jobs.length));
  await Promise.all(Array.from({ length: n }, worker));
}

async function main() {
  const { limit, dryRun, force } = parseArgs(process.argv);

  console.log("Listing category members…");
  let titles = (await fetchAllFileTitles()).filter((t) => /\.png$/i.test(t));
  titles.sort((a, b) => a.localeCompare(b));
  if (Number.isFinite(limit)) {
    titles = titles.slice(0, limit);
  }
  console.log(`Found ${titles.length} PNG file(s) in category.`);

  console.log("Resolving image URLs (batched)…");
  /** @type {Map<string, string>} */
  const titleToUrl = new Map();
  for (let i = 0; i < titles.length; i += 50) {
    const batch = titles.slice(i, i + 50);
    const chunk = await fetchImageUrlsForTitles(batch);
    for (const [k, v] of chunk) titleToUrl.set(k, v);
    await sleep(300);
  }

  const missing = titles.filter((t) => !titleToUrl.has(t));
  if (missing.length) {
    console.warn("No URL for", missing.length, "title(s), e.g.", missing[0]);
  }

  await fs.mkdir(OUT_DIR, { recursive: true });

  /** @type {{ slug: string; characterSlug: string; name: string; imagePath: string; source: string }[]} */
  const variants = [];
  /** @type {Map<string, { name: string; searchTerms: Set<string> }>} */
  const characterMap = new Map();

  /** @type {{ url: string; outPath: string; title: string }[]} */
  const downloadQueue = [];

  for (const title of titles) {
    const imageUrl = titleToUrl.get(title);
    if (!imageUrl) continue;

    const parsed = parseTrainerEntry(title);
    const localFile = `${parsed.slug}.png`;
    const outPath = path.join(OUT_DIR, localFile);
    const imagePath = `/team-card/trainers/masters/${localFile}`;

    variants.push({
      slug: parsed.slug,
      characterSlug: parsed.characterSlug,
      name: parsed.name,
      imagePath,
      source: "Bulbagarden Archives · Pokémon Masters EX sprites",
    });

    if (!characterMap.has(parsed.characterSlug)) {
      characterMap.set(parsed.characterSlug, {
        name: parsed.groupDisplayName,
        searchTerms: new Set(),
      });
    }
    const ch = characterMap.get(parsed.characterSlug);
    parsed.name.split(/\s+/).forEach((w) => {
      if (w.length > 1) ch.searchTerms.add(w.toLowerCase());
    });

    downloadQueue.push({ url: imageUrl, outPath, title });
  }

  variants.sort((a, b) => a.slug.localeCompare(b.slug));

  const characters = Array.from(characterMap.entries())
    .map(([slug, data]) => ({
      slug,
      name: data.name,
      group: "masters",
      searchTerms: Array.from(data.searchTerms).sort(),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const manifest = {
    source: "https://archives.bulbagarden.net/wiki/Category:Pok%C3%A9mon_Masters_Trainer_sprites",
    license: "CC BY-NC-SA 2.5 (Bulbagarden Archives). Non-commercial use only.",
    generatedAt: new Date().toISOString(),
    count: { characters: characters.length, variants: variants.length },
    characters,
    variants,
  };

  if (dryRun) {
    console.log(
      "[dry-run] Would download",
      downloadQueue.length,
      "file(s);",
      characters.length,
      "characters;",
      variants.length,
      "variants.",
    );
    return;
  }

  console.log(`Downloading ${downloadQueue.length} file(s) to ${path.relative(process.cwd(), OUT_DIR)}…`);
  let completed = 0;
  await runPool(5, downloadQueue, async (job) => {
    if (!force) {
      const stat = await fs.stat(job.outPath).catch(() => null);
      if (stat && stat.size > 0) {
        completed++;
        if (completed % 150 === 0) console.log(`  … ${completed} / ${downloadQueue.length}`);
        return;
      }
    }
    const res = await fetch(job.url, { headers: { "User-Agent": "PokemonTeamForgeTrainerFetcher/1.0" } });
    if (!res.ok) throw new Error(`${job.title}: HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await fs.writeFile(job.outPath, buf);
    completed++;
    if (completed % 150 === 0) console.log(`  … ${completed} / ${downloadQueue.length}`);
  });
  console.log(`Done. ${completed} file(s) processed (skipped existing unless --force).`);

  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2), "utf8");
  console.log("Wrote", path.relative(process.cwd(), MANIFEST_PATH));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
