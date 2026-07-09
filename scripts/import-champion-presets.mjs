/**
 * Parses champion_presets.md and writes:
 * - src/data/champions-presets.ts
 * - src/data/champions-preset-display.ts
 * Run: node scripts/import-champion-presets.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { getSupabaseReadClient, isHostedPokemonSpriteUrl } from "./lib/import-utils.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const mdPath = join(root, "champion_presets.md");
const outPath = join(root, "src", "data", "champions-presets.ts");
const displayOutPath = join(root, "src", "data", "champions-preset-display.ts");
const displayCachePath = join(root, "scripts", "champions-preset-display-cache.json");

const POKEMON_SLUG_ALIASES = {
  indeedee: "indeedee-female",
  meowstic: "meowstic-male",
  mimikyu: "mimikyu-disguised",
  basculegion: "basculegion-male",
  aegislash: "aegislash-shield",
  maushold: "maushold-family-of-four",
};

function resolvePokemonSlug(input) {
  const normalized = input.trim().toLowerCase().replace(/\s+/g, "-");
  if (!normalized) {
    return "";
  }
  return POKEMON_SLUG_ALIASES[normalized] ?? normalized;
}

async function fetchDisplayFromSupabase(supabase, slug) {
  const columns = "slug, sprite_normal_url, primary_type, secondary_type";

  let { data, error } = await supabase.from("pokemon").select(columns).eq("slug", slug).maybeSingle();

  if (!data && !error) {
    const fallback = await supabase
      .from("pokemon")
      .select(columns)
      .eq("species_slug", slug)
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle();
    data = fallback.data;
    error = fallback.error;
  }

  if (error) {
    console.warn(`  [warn] Supabase lookup failed for ${slug}: ${error.message}`);
    return null;
  }

  if (!data?.sprite_normal_url) {
    return null;
  }

  if (!isHostedPokemonSpriteUrl(data.sprite_normal_url)) {
    console.warn(
      `  [warn] ${slug} still uses external sprite URL — run npm run import:pokemon-data first`,
    );
  }

  return {
    displaySlug: data.slug,
    spriteNormal: data.sprite_normal_url,
    primaryType: data.primary_type ?? "normal",
    secondaryType: data.secondary_type ?? null,
  };
}

async function buildSpeciesDisplayCache(allSpeciesNames) {
  const supabase = getSupabaseReadClient();
  let cache = {};
  if (existsSync(displayCachePath)) {
    try {
      cache = JSON.parse(readFileSync(displayCachePath, "utf8"));
    } catch {
      cache = {};
    }
  }

  const slugs = [...new Set(allSpeciesNames.map(resolvePokemonSlug).filter(Boolean))];
  for (const slug of slugs) {
    const cached = cache[slug];
    if (cached?.spriteNormal && isHostedPokemonSpriteUrl(cached.spriteNormal)) {
      continue;
    }
    const display = await fetchDisplayFromSupabase(supabase, slug);
    if (display) {
      cache[slug] = display;
      console.log(`  [display] ${slug}`);
    } else {
      console.warn(`  [warn] Could not resolve display for ${slug}`);
    }
  }

  writeFileSync(displayCachePath, `${JSON.stringify(cache, null, 2)}\n`, "utf8");
  return cache;
}

function emitPresetDisplayFile(displayCache, allSlugs) {
  const entries = allSlugs
    .filter((slug) => displayCache[slug])
    .map((slug) => {
      const entry = displayCache[slug];
      return `  ${JSON.stringify(slug)}: {
    displaySlug: ${JSON.stringify(entry.displaySlug)},
    spriteNormal: ${JSON.stringify(entry.spriteNormal)},
    primaryType: ${JSON.stringify(entry.primaryType)},
    secondaryType: ${entry.secondaryType ? JSON.stringify(entry.secondaryType) : "null"},
  }`;
    });

  const output = `import { resolvePokemonSlug } from "@/lib/pokemon/pokemon-slug-aliases";
import type { PokemonType } from "@/types/shared";

export type ChampionsPresetSpeciesDisplay = {
  displaySlug: string;
  spriteNormal: string;
  primaryType: PokemonType;
  secondaryType: PokemonType | null;
};

export const CHAMPIONS_PRESET_SPECIES_DISPLAY: Record<string, ChampionsPresetSpeciesDisplay> = {
${entries.join(",\n")}
};

export const ALL_CHAMPIONS_PRESET_SPECIES_SLUGS = ${JSON.stringify(allSlugs)} as const;

export function getAllChampionsPresetSpeciesSlugs(): string[] {
  return [...ALL_CHAMPIONS_PRESET_SPECIES_SLUGS];
}

export function getPresetSpeciesDisplay(speciesName: string): ChampionsPresetSpeciesDisplay | null {
  const slug = resolvePokemonSlug(speciesName);
  return slug ? (CHAMPIONS_PRESET_SPECIES_DISPLAY[slug] ?? null) : null;
}
`;

  writeFileSync(displayOutPath, output, "utf8");
  console.log(`Wrote ${displayOutPath}`);
}

const MEGA_STONE_ITEMS = new Set([
  "Swampertite", "Charizardite Y", "Charizardite X", "Tyranitarite", "Excadrite", "Garchompite",
  "Baxcalibrite", "Greninjite", "Staraptite", "Raichunite X", "Lucarionite", "Gengarite", "Meowsticite",
  "Gardevoirite", "Victreebelite", "Floettite", "Hawluchanite", "Alakazite", "Scizorite", "Heracronite",
  "Salamencite", "Lopunnite", "Pinsirite", "Dragoninite", "Kangaskhanite", "Mawilite", "Sablenite",
  "Metagrossite", "Cameruptite", "Chandelurite",
]);

/** Curated archetype tags per preset — used for explorer filtering. */
const PRESET_ARCHETYPES = {
  "rain-balance": ["balance"],
  "sun-pressure": ["hyper-offense"],
  "tr-control": ["trick-room"],
  "sand-rush": ["hyper-offense"],
  "aurora-veil-snow": ["hyper-offense"],
  "mega-greninja-lead": ["hyper-offense"],
  "mega-lucario-screens-blitz": ["hyper-offense"],
  "mega-gengar-offense": ["hyper-offense"],
  "mega-gardevoir-doubles": ["balance"],
  "mega-victreebel-innards-out": ["champions-signature"],
  "mega-charizard-x-dd": ["hyper-offense"],
  "gholdengo-mega-floette": ["balance"],
  "no-guard-ohko-master": ["champions-signature"],
  "psyspam": ["hyper-offense"],
  "meowscarada-flower-trick": ["champions-signature"],
  "basculegion-last-respects": ["champions-signature"],
  "mega-scizor-priority": ["hyper-offense"],
  "loaded-dice-multihit": ["flavor"],
  "dragon-spam": ["hyper-offense"],
  "mega-lopunny-doubles": ["hyper-offense"],
  "sticky-web-ho": ["hyper-offense"],
  "kingambit-supreme-overlord": ["flavor"],
  "mega-kangaskhan-doubles": ["balance"],
  "mega-mawile-tr": ["trick-room"],
  "beat-up-justified": ["flavor"],
  "hyper-offense-screens": ["hyper-offense"],
  "mega-sableye-stall": ["stall"],
  "mono-ghost": ["flavor"],
  "mega-camerupt-tr": ["trick-room"],
  "weatherless-balance": ["balance"],
};

function deriveThemeTags(team) {
  const tags = new Set();
  if (team.accentTheme === "rain" || team.accentTheme === "sun" || team.accentTheme === "trick-room") {
    tags.add(team.accentTheme);
  }
  const lowerTags = team.styleTags.map((tag) => tag.toLowerCase());
  if (lowerTags.some((tag) => tag.includes("sand"))) {
    tags.add("sand");
  }
  if (lowerTags.some((tag) => tag.includes("snow"))) {
    tags.add("snow");
  }
  return [...tags];
}

function deriveArchetypeTags(team) {
  const archetypes = PRESET_ARCHETYPES[team.id];
  if (!archetypes) {
    console.warn(`  [warn] No archetype mapping for preset "${team.id}" — defaulting to hyper-offense`);
    return ["hyper-offense"];
  }
  return archetypes;
}

function resolveAccentTheme(themeTags, mdAccent) {
  if (themeTags.includes("sand")) return "sand";
  if (themeTags.includes("snow")) return "snow";
  if (themeTags.includes("rain")) return "rain";
  if (themeTags.includes("sun")) return "sun";
  if (themeTags.includes("trick-room")) return "trick-room";
  return mdAccent === "neutral" ? "neutral" : mdAccent;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeName(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/\s+/g, " ");
}

function parseSp(spRaw) {
  const [hp, atk, def, spa, spd, spe] = spRaw.split("/").map((n) => Number(n.trim()));
  return { hp, atk, def, spa, spd, spe };
}

function toCamelCase(id) {
  return id.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function parseMetaTable(block) {
  const meta = {};
  for (const line of block.split("\n")) {
    const match = line.match(/\|\s*\*\*([^*]+)\*\*\s*\|\s*`?([^`|]+)`?\s*\|/);
    if (!match) continue;
    const [, key, raw] = match;
    meta[key.trim()] = raw.trim();
  }
  return meta;
}

function parseMetaValue(meta, key) {
  return meta[key] ?? "";
}

function parseFeaturedMega(raw) {
  if (!raw) return undefined;
  const [species, item] = raw.split("—").map((s) => s.trim());
  if (!species || !item) return undefined;
  return { species, item };
}

function parseStyleTags(raw) {
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

function parsePokemonRows(block) {
  const lines = block.split("\n").filter((l) => /^\|\s*\d+\s*\|/.test(l));
  return lines.map((line) => {
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());
    const [, pokemonName, ability, item, nature, movesRaw, spRaw] = cells;
    const moves = movesRaw.split(",").map((m) => m.trim());
    return {
      pokemonName,
      ability,
      item,
      nature,
      moves,
      sp: parseSp(spRaw),
    };
  });
}

function splitPokemonNames(raw) {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseBattlePlans(block, nameToSlot) {
  const plans = [];
  const planHeaders = [...block.matchAll(/\*\*([^*]+)\*\*\n/g)];
  for (let i = 0; i < planHeaders.length; i += 1) {
    const header = planHeaders[i][1];
    const start = planHeaders[i].index + planHeaders[i][0].length;
    const end = i + 1 < planHeaders.length ? planHeaders[i + 1].index : block.length;
    const body = block.slice(start, end);
    const format = /\(Singles\)/i.test(header) ? "single" : "double";
    const planName = header.replace(/\s*\((Singles|Doubles)\)\s*/i, "").trim();

    const fields = {};
    for (const line of body.split("\n")) {
      const m = line.match(/^- \*\*(\w+):\*\*\s*(.+)$/);
      if (m) fields[m[1]] = m[2].trim();
    }

    const leads = fields.Leads
      ? splitPokemonNames(fields.Leads)
      : fields.Lead
        ? [fields.Lead.trim()]
        : [];
    const selected = splitPokemonNames(fields.Selected ?? "");

    const leadIds = leads.map((n) => nameToSlot.get(normalizeName(n))).filter(Boolean);
    const selectedIds = selected.map((n) => nameToSlot.get(normalizeName(n))).filter(Boolean);
    const backupIds = selectedIds.filter((id) => !leadIds.includes(id));

    const expectedSelected = format === "single" ? 3 : 4;
    const expectedLeads = format === "single" ? 1 : 2;

    if (selectedIds.length !== expectedSelected) {
      console.warn(
        `  [warn] Plan "${planName}" (${format}): expected ${expectedSelected} selected, got ${selectedIds.length} (${fields.Selected})`,
      );
    }
    if (leadIds.length !== expectedLeads) {
      console.warn(
        `  [warn] Plan "${planName}" (${format}): expected ${expectedLeads} leads, got ${leadIds.length} (${fields.Leads ?? fields.Lead})`,
      );
    }

    plans.push({
      planName,
      format,
      leadIds,
      selectedIds,
      backupIds,
      win: fields.Win ?? "",
      avoid: fields.Avoid ?? "",
    });
  }
  return plans;
}

function isMegaStone(item) {
  return MEGA_STONE_ITEMS.has(item);
}

function tsString(value) {
  return JSON.stringify(value);
}

function emitPokemon(slot, mon, featuredMega) {
  const lines = [];
  lines.push(`    {`);
  lines.push(`      ...${slot}.pokemon[${mon.index}],`);
  lines.push(`      pokemonName: ${tsString(mon.pokemonName)},`);
  lines.push(`      ability: ${tsString(mon.ability)},`);
  lines.push(`      item: ${tsString(mon.item)},`);
  if (mon.nature && mon.nature !== "Serious") {
    lines.push(`      statAlignment: ${tsString(mon.nature)},`);
  }
  lines.push(`      moves: ${tsString(mon.moves)},`);
  lines.push(
    `      sp: { hp: ${mon.sp.hp}, atk: ${mon.sp.atk}, def: ${mon.sp.def}, spa: ${mon.sp.spa}, spd: ${mon.sp.spd}, spe: ${mon.sp.spe} },`,
  );
  if (isMegaStone(mon.item)) {
    lines.push(`      megaStone: ${tsString(mon.item)},`);
    const useMega =
      mon.item === featuredMega?.item || mon.pokemonName === featuredMega?.species;
    lines.push(`      useMegaByDefault: ${useMega ? "true" : "false"},`);
  }
  lines.push(`    },`);
  return lines.join("\n");
}

function emitBattlePlan(presetId, plan) {
  const id = `${presetId}-${slugify(plan.planName)}-${plan.format}`;
  return `  {
    id: ${tsString(id)},
    name: ${tsString(plan.planName)},
    format: ${tsString(plan.format)},
    matchupLabel: ${tsString(plan.planName)},
    selectedPokemonIds: ${tsString(plan.selectedIds)},
    leadPokemonIds: ${tsString(plan.leadIds)},
    backupPokemonIds: ${tsString(plan.backupIds)},
    winConditionNote: ${tsString(plan.win)},
    avoidNote: ${tsString(plan.avoid)},
    generalNote: "",
  }`;
}

function parseTeams(md) {
  const normalized = md.replace(/\r\n/g, "\n");
  const sections = normalized.split(/^## \d+\.\s+/m).slice(1);
  return sections
    .filter((s) => !s.startsWith("Review checklist"))
    .map((section) => {
      const titleEnd = section.indexOf("\n");
      const title = section.slice(0, titleEnd).trim();
      const metaBlock = section.match(/\| Meta \| Value \|[\s\S]*?(?=\n\n\| Slot)/)?.[0] ?? "";
      const rosterBlock = section.match(/\| Slot \| Pokémon[\s\S]*?(?=\n### Battle plans)/)?.[0] ?? "";
      const plansBlock = section.match(/### Battle plans\n([\s\S]*?)(?=\n---|$)/)?.[1] ?? "";

      const meta = parseMetaTable(metaBlock);
      const pokemon = parsePokemonRows(rosterBlock).map((p, index) => ({ ...p, index }));
      const nameToSlot = new Map(
        pokemon.map((p) => [normalizeName(p.pokemonName), `slot-${p.index + 1}`]),
      );
      const battlePlans = parseBattlePlans(plansBlock, nameToSlot);
      const featuredMega = parseFeaturedMega(parseMetaValue(meta, "featuredMega"));

      return {
        id: parseMetaValue(meta, "id"),
        title,
        formatSupport: parseMetaValue(meta, "formatSupport"),
        accentTheme: parseMetaValue(meta, "accentTheme"),
        difficulty: parseMetaValue(meta, "difficulty"),
        styleTags: parseStyleTags(parseMetaValue(meta, "styleTags")),
        bestFor: parseMetaValue(meta, "bestFor"),
        shortDescription: parseMetaValue(meta, "shortDescription"),
        featuredMega,
        pokemon,
        battlePlans,
      };
    });
}

const md = readFileSync(mdPath, "utf8");
const teams = parseTeams(md);

console.log(`Parsed ${teams.length} presets, ${teams.reduce((n, t) => n + t.battlePlans.length, 0)} battle plans.`);

const allSpeciesNames = teams.flatMap((team) =>
  team.pokemon.map((mon) => mon.pokemonName).filter(Boolean),
);

async function main() {
  console.log("Building preset species display cache (Supabase pokemon table)...");
  const displayCache = await buildSpeciesDisplayCache(allSpeciesNames);
  const allSlugs = [...new Set(allSpeciesNames.map(resolvePokemonSlug).filter(Boolean))].sort();
  emitPresetDisplayFile(displayCache, allSlugs);

const teamVars = [];
const presetEntries = [];

for (const team of teams) {
  const varName = `${toCamelCase(team.id)}Team`;
  const featuredMega = team.featuredMega;
  const themeTags = deriveThemeTags(team);
  const archetypeTags = deriveArchetypeTags(team);
  const accentTheme = resolveAccentTheme(themeTags, team.accentTheme);

  teamVars.push(`const ${varName} = createBasePresetTeam(${tsString(team.title)}, ${tsString(team.formatSupport)});`);
  teamVars.push(`${varName}.pokemon = [`);
  for (const mon of team.pokemon) {
    teamVars.push(emitPokemon(varName, mon, featuredMega));
  }
  teamVars.push(`];`);

  if (team.battlePlans.length > 0) {
    teamVars.push(`${varName}.battlePlans = [`);
    teamVars.push(team.battlePlans.map((p) => emitBattlePlan(team.id, p)).join(",\n"));
    teamVars.push(`];`);
  }
  teamVars.push("");

  const presetLines = [
    `  {`,
    `    id: ${tsString(team.id)},`,
    `    name: ${tsString(team.title)},`,
    `    shortDescription: ${tsString(team.shortDescription)},`,
    `    formatSupport: ${tsString(team.formatSupport)},`,
    `    styleTags: ${tsString(team.styleTags)},`,
    `    themeTags: ${tsString(themeTags)},`,
    `    archetypeTags: ${tsString(archetypeTags)},`,
    `    accentTheme: ${tsString(accentTheme)},`,
  ];
  if (team.difficulty) presetLines.push(`    difficulty: ${tsString(team.difficulty)},`);
  if (team.bestFor) presetLines.push(`    bestFor: ${tsString(team.bestFor)},`);
  if (team.featuredMega) {
    presetLines.push(
      `    featuredMega: { species: ${tsString(team.featuredMega.species)}, item: ${tsString(team.featuredMega.item)} },`,
    );
  }
  presetLines.push(`    team: ${varName},`);
  presetLines.push(`  },`);
  presetEntries.push(presetLines.join("\n"));
}

const output = `import type { ChampionsTeam } from "@/types/champions";
import { CHAMPIONS_RULESET_ID } from "@/data/champions";

export type ChampionsPresetTheme = "rain" | "sun" | "sand" | "snow" | "trick-room";
export type ChampionsPresetArchetype =
  | "balance"
  | "hyper-offense"
  | "trick-room"
  | "stall"
  | "champions-signature"
  | "flavor";
export type ChampionsPresetAccentTheme = ChampionsPresetTheme | "neutral";
export type ChampionsPresetDifficulty = "beginner" | "intermediate" | "advanced";

export type ChampionsPreset = {
  id: string;
  name: string;
  shortDescription: string;
  formatSupport: "single" | "double" | "both";
  styleTags: string[];
  themeTags: ChampionsPresetTheme[];
  archetypeTags: ChampionsPresetArchetype[];
  accentTheme: ChampionsPresetAccentTheme;
  difficulty?: ChampionsPresetDifficulty;
  bestFor?: string;
  featuredMega?: {
    species: string;
    item: string;
  };
  team: ChampionsTeam;
};

export function formatSupportLabel(formatSupport: ChampionsPreset["formatSupport"]): string {
  if (formatSupport === "both") {
    return "Both formats";
  }
  if (formatSupport === "single") {
    return "Singles 3v3";
  }
  return "Doubles 4v4";
}

function createBasePresetTeam(name: string, formatSupport: "single" | "double" | "both"): ChampionsTeam {
  return {
    name,
    mode: "champions",
    format: formatSupport === "double" ? "doubles" : "singles",
    formatSupport,
    rulesetId: CHAMPIONS_RULESET_ID,
    teamNotes: "",
    pokemon: Array.from({ length: 6 }, (_, index) => ({
      id: \`slot-\${index + 1}\`,
      slot: index + 1,
      pokemonId: null,
      pokemonName: "",
      ability: "",
      item: "",
      moves: ["", "", "", ""],
      statAlignment: "Serious",
      sp: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
      megaStone: "",
      useMegaByDefault: false,
    })),
    battlePlans: [],
  };
}

${teamVars.join("\n")}
export const CHAMPIONS_PRESETS: ChampionsPreset[] = [
${presetEntries.join("\n")}
];

export function getChampionsPresetById(presetId: string): ChampionsPreset | null {
  return CHAMPIONS_PRESETS.find((preset) => preset.id === presetId) ?? null;
}
`;

writeFileSync(outPath, output, "utf8");
console.log(`Wrote ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
