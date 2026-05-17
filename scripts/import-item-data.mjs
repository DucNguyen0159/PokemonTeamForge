/**
 * Imports PokéAPI item data into Supabase and uploads small item icons.
 *
 * Usage:
 *   node scripts/import-item-data.mjs --dry-run --limit 20
 */

import process from "node:process";

import {
  ITEM_ICON_BUCKET,
  parseCommonArgs,
  pokeApiGet,
  runImport,
  slugify,
} from "./lib/import-utils.mjs";

const GROUPS = {
  battle: { label: "battle", order: 10 },
  berries: { label: "berries", order: 20 },
  mega_stones: { label: "mega_stones", order: 30 },
  type_boosting: { label: "type_boosting", order: 40 },
  type_changing: { label: "type_changing", order: 50 },
  gems: { label: "gems", order: 60 },
  weather_terrain_support: { label: "weather_terrain_support", order: 70 },
  incenses_niche: { label: "incenses_niche", order: 80 },
  other: { label: "other", order: 900 },
};

const COMMON_BATTLE_ITEM_SLUGS = new Set([
  "leftovers",
  "choice-band",
  "choice-scarf",
  "choice-specs",
  "focus-sash",
  "life-orb",
  "rocky-helmet",
  "heavy-duty-boots",
  "assault-vest",
  "eviolite",
  "toxic-orb",
  "flame-orb",
  "black-sludge",
  "booster-energy",
  "covert-cloak",
  "safety-goggles",
  "air-balloon",
  "loaded-dice",
  "mental-herb",
  "clear-amulet",
  "weakness-policy",
  "room-service",
  "throat-spray",
]);

const WEATHER_TERRAIN_ITEM_SLUGS = new Set([
  "damp-rock",
  "heat-rock",
  "smooth-rock",
  "icy-rock",
  "terrain-extender",
  "light-clay",
  "electric-seed",
  "grassy-seed",
  "misty-seed",
  "psychic-seed",
]);

const TYPE_BOOSTING_ITEM_SLUGS = new Set([
  "black-belt",
  "black-glasses",
  "charcoal",
  "dragon-fang",
  "hard-stone",
  "magnet",
  "metal-coat",
  "miracle-seed",
  "mystic-water",
  "never-melt-ice",
  "poison-barb",
  "sharp-beak",
  "silk-scarf",
  "silver-powder",
  "soft-sand",
  "spell-tag",
  "twisted-spoon",
]);

const TYPE_CHANGING_ITEM_SLUGS = new Set([
  "draco-plate",
  "dread-plate",
  "earth-plate",
  "fist-plate",
  "flame-plate",
  "icicle-plate",
  "insect-plate",
  "iron-plate",
  "meadow-plate",
  "mind-plate",
  "pixie-plate",
  "sky-plate",
  "splash-plate",
  "spooky-plate",
  "stone-plate",
  "toxic-plate",
  "zap-plate",
  "blank-plate",
  "bug-memory",
  "dark-memory",
  "dragon-memory",
  "electric-memory",
  "fairy-memory",
  "fighting-memory",
  "fire-memory",
  "flying-memory",
  "ghost-memory",
  "grass-memory",
  "ground-memory",
  "ice-memory",
  "poison-memory",
  "psychic-memory",
  "rock-memory",
  "steel-memory",
  "water-memory",
  "burn-drive",
  "chill-drive",
  "douse-drive",
  "shock-drive",
  "cornerstone-mask",
  "hearthflame-mask",
  "wellspring-mask",
]);

const BERRY_SUFFIX = "-berry";
const GEM_SUFFIX = "-gem";
const INCENSE_SUFFIX = "-incense";
const MEGA_STONE_SUFFIXES = ["ite", "itex", "ite-y"];

function englishEffectEntry(item) {
  return item.effect_entries?.find((entry) => entry.language?.name === "en") ?? null;
}

function englishFlavorText(item) {
  const entry = item.flavor_text_entries?.find((row) => row.language?.name === "en");
  return entry?.text?.replace(/\s+/g, " ") ?? null;
}

function isMegaStone(slug) {
  return slug.endsWith("ite") || slug.endsWith("ite-x") || slug.endsWith("ite-y");
}

function classifyItem(item) {
  const slug = item.name;
  const category = item.category?.name ?? "";
  const attributes = new Set((item.attributes ?? []).map((entry) => entry.name));
  const tags = new Set();

  let group = GROUPS.other;
  let isCompetitive = false;

  if (COMMON_BATTLE_ITEM_SLUGS.has(slug)) {
    group = GROUPS.battle;
    isCompetitive = true;
  } else if (slug.endsWith(BERRY_SUFFIX) || category.includes("berry")) {
    group = GROUPS.berries;
    isCompetitive = true;
    tags.add("recovery");
  } else if (isMegaStone(slug) || MEGA_STONE_SUFFIXES.some((suffix) => slug.endsWith(suffix))) {
    group = GROUPS.mega_stones;
    isCompetitive = true;
  } else if (TYPE_BOOSTING_ITEM_SLUGS.has(slug)) {
    group = GROUPS.type_boosting;
    isCompetitive = true;
    tags.add("damage_boost");
  } else if (TYPE_CHANGING_ITEM_SLUGS.has(slug) || slug.endsWith("-plate") || slug.endsWith("-memory")) {
    group = GROUPS.type_changing;
    isCompetitive = true;
  } else if (slug.endsWith(GEM_SUFFIX)) {
    group = GROUPS.gems;
    isCompetitive = true;
    tags.add("damage_boost");
  } else if (WEATHER_TERRAIN_ITEM_SLUGS.has(slug)) {
    group = GROUPS.weather_terrain_support;
    isCompetitive = true;
    tags.add("utility");
  } else if (slug.endsWith(INCENSE_SUFFIX)) {
    group = GROUPS.incenses_niche;
    isCompetitive = true;
  } else if (category === "held-items" || category === "choice" || attributes.has("holdable")) {
    group = GROUPS.incenses_niche;
    isCompetitive = true;
  }

  if (slug.startsWith("choice-")) tags.add("choice_item");
  if (slug.includes("sash")) tags.add("focus_sash");
  if (slug.includes("seed")) tags.add("terrain_item");
  if (slug.includes("rock") && WEATHER_TERRAIN_ITEM_SLUGS.has(slug)) tags.add("weather_item");
  if (["leftovers", "black-sludge", "sitrus-berry"].includes(slug)) tags.add("recovery");
  if (["choice-scarf"].includes(slug)) tags.add("speed_boost");
  if (["assault-vest"].includes(slug)) tags.add("special_defense_boost");
  if (["rocky-helmet", "eviolite"].includes(slug)) tags.add("defense_boost");
  if (tags.size === 0 && isCompetitive) tags.add("utility");

  return {
    competitive_group: group.label,
    competitive_group_order: group.order,
    is_competitive: isCompetitive,
    tags: Array.from(tags),
  };
}

async function listItemRefs(limit) {
  const page = await pokeApiGet("/item?limit=2000&offset=0");
  const refs = page.results ?? [];
  return Number.isFinite(limit) ? refs.slice(0, limit) : refs;
}

function normalizeItem(item, iconUrl, iconStoragePath) {
  const effect = englishEffectEntry(item);
  const classification = classifyItem(item);

  return {
    id: item.id,
    slug: item.name,
    name: item.names?.find((entry) => entry.language?.name === "en")?.name ?? slugify(item.name),
    category: item.category?.name ?? null,
    description: effect?.effect ?? englishFlavorText(item),
    short_effect: effect?.short_effect ?? englishFlavorText(item),
    icon_url: iconUrl,
    icon_storage_path: iconStoragePath,
    cost: item.cost ?? null,
    fling_power: item.fling_power ?? null,
    fling_effect: item.fling_effect?.name ?? null,
    sort_order: 0,
    ...classification,
  };
}

async function uploadItemIcon(supabase, item, args) {
  const iconUrl = item.sprites?.default;
  if (!iconUrl || args.dryRun) {
    return { iconUrl, iconStoragePath: null };
  }

  const response = await fetch(iconUrl);
  if (!response.ok) {
    return { iconUrl, iconStoragePath: null };
  }

  const contentType = response.headers.get("content-type") || "image/png";
  const extension = contentType.includes("webp") ? "webp" : "png";
  const iconStoragePath = `${item.name}.${extension}`;
  const body = await response.arrayBuffer();

  const { error } = await supabase.storage
    .from(ITEM_ICON_BUCKET)
    .upload(iconStoragePath, body, {
      contentType,
      upsert: args.force,
    });

  if (error && !String(error.message).toLowerCase().includes("already exists")) {
    throw error;
  }

  const { data } = supabase.storage.from(ITEM_ICON_BUCKET).getPublicUrl(iconStoragePath);

  return {
    iconUrl: data.publicUrl || iconUrl,
    iconStoragePath,
  };
}

async function main() {
  const args = parseCommonArgs(process.argv);

  await runImport("items", args, async ({ supabase }) => {
    const refs = await listItemRefs(args.limit);
    const rows = [];
    let iconUploadCount = 0;

    for (const [index, ref] of refs.entries()) {
      const item = await pokeApiGet(ref.url);
      const { iconUrl, iconStoragePath } = await uploadItemIcon(supabase, item, args);
      if (iconStoragePath) iconUploadCount += 1;
      rows.push(normalizeItem(item, iconUrl, iconStoragePath));

      if ((index + 1) % 25 === 0 || index === refs.length - 1) {
        console.log(`Prepared ${index + 1}/${refs.length} item(s).`);
      }
    }

    if (args.dryRun) {
      console.log(`[dry-run] Prepared ${rows.length} item row(s); no Supabase writes.`);
    } else if (rows.length > 0) {
      const { error } = await supabase.from("items").upsert(rows, { onConflict: "id" });
      if (error) throw error;
      console.log(`Upserted ${rows.length} item row(s).`);
    }

    return {
      rowsProcessed: rows.length,
      metadata: {
        refsFound: refs.length,
        iconUploadCount,
      },
    };
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
