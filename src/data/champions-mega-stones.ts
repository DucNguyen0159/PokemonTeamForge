/**
 * Curated Mega Stone catalog for Legends Z-A / Pokémon Champions era supplements.
 * Classic XY/ORAS stones already live in Supabase via PokéAPI import; this file is the
 * source of truth for newer stones and for species ↔ stone ↔ mega-form compatibility.
 *
 * Item IDs follow in-game / Bulbapedia index numbers where available.
 */

export type ChampionsMegaStoneMapping = {
  itemId: number;
  itemName: string;
  itemSlug: string;
  megaPokemonSlug: string;
  baseSpeciesSlug: string;
  description: string;
  aliases?: string[];
  /** When true, expected to already exist from PokéAPI import. */
  inPokeApiCatalog?: boolean;
};

export const MEGA_STONE_GENERIC_ICON_STORAGE_PATH = "mega-stone-generic.png";

const DEFAULT_MEGA_STONE_DESCRIPTION =
  "One of a variety of mysterious Mega Stones. Holding this stone allows the Pokémon to Mega Evolve during battle.";

function stone(
  entry: Omit<ChampionsMegaStoneMapping, "description"> & { description?: string },
): ChampionsMegaStoneMapping {
  return {
    description: entry.description ?? DEFAULT_MEGA_STONE_DESCRIPTION,
    ...entry,
  };
}

/** Full Mega Stone mapping used by legality + damage calc resolution. */
export const MEGA_STONE_MAPPINGS: ChampionsMegaStoneMapping[] = [
  // Classic XY / ORAS (PokéAPI catalog)
  stone({ itemId: 657, itemName: "Gengarite", itemSlug: "gengarite", megaPokemonSlug: "gengar-mega", baseSpeciesSlug: "gengar", inPokeApiCatalog: true }),
  stone({ itemId: 658, itemName: "Gardevoirite", itemSlug: "gardevoirite", megaPokemonSlug: "gardevoir-mega", baseSpeciesSlug: "gardevoir", inPokeApiCatalog: true }),
  stone({ itemId: 658, itemName: "Ampharosite", itemSlug: "ampharosite", megaPokemonSlug: "ampharos-mega", baseSpeciesSlug: "ampharos", inPokeApiCatalog: true }),
  stone({ itemId: 659, itemName: "Venusaurite", itemSlug: "venusaurite", megaPokemonSlug: "venusaur-mega", baseSpeciesSlug: "venusaur", inPokeApiCatalog: true }),
  stone({ itemId: 660, itemName: "Charizardite X", itemSlug: "charizardite-x", megaPokemonSlug: "charizard-mega-x", baseSpeciesSlug: "charizard", inPokeApiCatalog: true }),
  stone({ itemId: 678, itemName: "Charizardite Y", itemSlug: "charizardite-y", megaPokemonSlug: "charizard-mega-y", baseSpeciesSlug: "charizard", inPokeApiCatalog: true }),
  stone({ itemId: 661, itemName: "Blastoisinite", itemSlug: "blastoisinite", megaPokemonSlug: "blastoise-mega", baseSpeciesSlug: "blastoise", inPokeApiCatalog: true }),
  stone({ itemId: 662, itemName: "Mewtwonite X", itemSlug: "mewtwonite-x", megaPokemonSlug: "mewtwo-mega-x", baseSpeciesSlug: "mewtwo", inPokeApiCatalog: true }),
  stone({ itemId: 663, itemName: "Mewtwonite Y", itemSlug: "mewtwonite-y", megaPokemonSlug: "mewtwo-mega-y", baseSpeciesSlug: "mewtwo", inPokeApiCatalog: true }),
  stone({ itemId: 664, itemName: "Blazikenite", itemSlug: "blazikenite", megaPokemonSlug: "blaziken-mega", baseSpeciesSlug: "blaziken", inPokeApiCatalog: true }),
  stone({ itemId: 665, itemName: "Medichamite", itemSlug: "medichamite", megaPokemonSlug: "medicham-mega", baseSpeciesSlug: "medicham", inPokeApiCatalog: true }),
  stone({ itemId: 666, itemName: "Houndoominite", itemSlug: "houndoominite", megaPokemonSlug: "houndoom-mega", baseSpeciesSlug: "houndoom", inPokeApiCatalog: true }),
  stone({ itemId: 667, itemName: "Aggronite", itemSlug: "aggronite", megaPokemonSlug: "aggron-mega", baseSpeciesSlug: "aggron", inPokeApiCatalog: true }),
  stone({ itemId: 668, itemName: "Banettite", itemSlug: "banettite", megaPokemonSlug: "banette-mega", baseSpeciesSlug: "banette", inPokeApiCatalog: true }),
  stone({ itemId: 669, itemName: "Tyranitarite", itemSlug: "tyranitarite", megaPokemonSlug: "tyranitar-mega", baseSpeciesSlug: "tyranitar", inPokeApiCatalog: true }),
  stone({ itemId: 670, itemName: "Scizorite", itemSlug: "scizorite", megaPokemonSlug: "scizor-mega", baseSpeciesSlug: "scizor", inPokeApiCatalog: true }),
  stone({ itemId: 671, itemName: "Pinsirite", itemSlug: "pinsirite", megaPokemonSlug: "pinsir-mega", baseSpeciesSlug: "pinsir", inPokeApiCatalog: true }),
  stone({ itemId: 672, itemName: "Aerodactylite", itemSlug: "aerodactylite", megaPokemonSlug: "aerodactyl-mega", baseSpeciesSlug: "aerodactyl", inPokeApiCatalog: true }),
  stone({ itemId: 673, itemName: "Lucarionite", itemSlug: "lucarionite", megaPokemonSlug: "lucario-mega", baseSpeciesSlug: "lucario", inPokeApiCatalog: true }),
  stone({ itemId: 674, itemName: "Abomasite", itemSlug: "abomasite", megaPokemonSlug: "abomasnow-mega", baseSpeciesSlug: "abomasnow", inPokeApiCatalog: true }),
  stone({ itemId: 675, itemName: "Kangaskhanite", itemSlug: "kangaskhanite", megaPokemonSlug: "kangaskhan-mega", baseSpeciesSlug: "kangaskhan", inPokeApiCatalog: true }),
  stone({ itemId: 676, itemName: "Gyaradosite", itemSlug: "gyaradosite", megaPokemonSlug: "gyarados-mega", baseSpeciesSlug: "gyarados", inPokeApiCatalog: true }),
  stone({ itemId: 677, itemName: "Absolite", itemSlug: "absolite", megaPokemonSlug: "absol-mega", baseSpeciesSlug: "absol", inPokeApiCatalog: true }),
  stone({ itemId: 679, itemName: "Alakazite", itemSlug: "alakazite", megaPokemonSlug: "alakazam-mega", baseSpeciesSlug: "alakazam", inPokeApiCatalog: true }),
  stone({ itemId: 680, itemName: "Heracronite", itemSlug: "heracronite", megaPokemonSlug: "heracross-mega", baseSpeciesSlug: "heracross", inPokeApiCatalog: true }),
  stone({ itemId: 681, itemName: "Mawilite", itemSlug: "mawilite", megaPokemonSlug: "mawile-mega", baseSpeciesSlug: "mawile", inPokeApiCatalog: true }),
  stone({ itemId: 682, itemName: "Manectite", itemSlug: "manectite", megaPokemonSlug: "manectric-mega", baseSpeciesSlug: "manectric", inPokeApiCatalog: true }),
  stone({ itemId: 683, itemName: "Garchompite", itemSlug: "garchompite", megaPokemonSlug: "garchomp-mega", baseSpeciesSlug: "garchomp", inPokeApiCatalog: true }),
  stone({ itemId: 684, itemName: "Latiasite", itemSlug: "latiasite", megaPokemonSlug: "latias-mega", baseSpeciesSlug: "latias", inPokeApiCatalog: true }),
  stone({ itemId: 685, itemName: "Latiosite", itemSlug: "latiosite", megaPokemonSlug: "latios-mega", baseSpeciesSlug: "latios", inPokeApiCatalog: true }),
  stone({ itemId: 752, itemName: "Swampertite", itemSlug: "swampertite", megaPokemonSlug: "swampert-mega", baseSpeciesSlug: "swampert", inPokeApiCatalog: true }),
  stone({ itemId: 753, itemName: "Sceptilite", itemSlug: "sceptilite", megaPokemonSlug: "sceptile-mega", baseSpeciesSlug: "sceptile", inPokeApiCatalog: true }),
  stone({ itemId: 754, itemName: "Sablenite", itemSlug: "sablenite", megaPokemonSlug: "sableye-mega", baseSpeciesSlug: "sableye", inPokeApiCatalog: true }),
  stone({ itemId: 755, itemName: "Altarianite", itemSlug: "altarianite", megaPokemonSlug: "altaria-mega", baseSpeciesSlug: "altaria", inPokeApiCatalog: true }),
  stone({ itemId: 756, itemName: "Galladite", itemSlug: "galladite", megaPokemonSlug: "gallade-mega", baseSpeciesSlug: "gallade", inPokeApiCatalog: true }),
  stone({ itemId: 757, itemName: "Audinite", itemSlug: "audinite", megaPokemonSlug: "audino-mega", baseSpeciesSlug: "audino", inPokeApiCatalog: true }),
  stone({ itemId: 758, itemName: "Metagrossite", itemSlug: "metagrossite", megaPokemonSlug: "metagross-mega", baseSpeciesSlug: "metagross", inPokeApiCatalog: true }),
  stone({ itemId: 759, itemName: "Sharpedonite", itemSlug: "sharpedonite", megaPokemonSlug: "sharpedo-mega", baseSpeciesSlug: "sharpedo", inPokeApiCatalog: true }),
  stone({ itemId: 760, itemName: "Slowbronite", itemSlug: "slowbronite", megaPokemonSlug: "slowbro-mega", baseSpeciesSlug: "slowbro", inPokeApiCatalog: true }),
  stone({ itemId: 761, itemName: "Steelixite", itemSlug: "steelixite", megaPokemonSlug: "steelix-mega", baseSpeciesSlug: "steelix", inPokeApiCatalog: true }),
  stone({ itemId: 762, itemName: "Pidgeotite", itemSlug: "pidgeotite", megaPokemonSlug: "pidgeot-mega", baseSpeciesSlug: "pidgeot", inPokeApiCatalog: true }),
  stone({ itemId: 763, itemName: "Glalitite", itemSlug: "glalitite", megaPokemonSlug: "glalie-mega", baseSpeciesSlug: "glalie", inPokeApiCatalog: true }),
  stone({ itemId: 764, itemName: "Diancite", itemSlug: "diancite", megaPokemonSlug: "diancie-mega", baseSpeciesSlug: "diancie", inPokeApiCatalog: true }),
  stone({ itemId: 767, itemName: "Cameruptite", itemSlug: "cameruptite", megaPokemonSlug: "camerupt-mega", baseSpeciesSlug: "camerupt", inPokeApiCatalog: true }),
  stone({ itemId: 768, itemName: "Lopunnite", itemSlug: "lopunnite", megaPokemonSlug: "lopunny-mega", baseSpeciesSlug: "lopunny", inPokeApiCatalog: true }),
  stone({ itemId: 769, itemName: "Salamencite", itemSlug: "salamencite", megaPokemonSlug: "salamence-mega", baseSpeciesSlug: "salamence", inPokeApiCatalog: true }),
  stone({ itemId: 770, itemName: "Beedrillite", itemSlug: "beedrillite", megaPokemonSlug: "beedrill-mega", baseSpeciesSlug: "beedrill", inPokeApiCatalog: true }),

  // Pokémon Legends Z-A
  stone({ itemId: 2559, itemName: "Clefablite", itemSlug: "clefablite", megaPokemonSlug: "clefable-mega", baseSpeciesSlug: "clefable" }),
  stone({ itemId: 2560, itemName: "Victreebelite", itemSlug: "victreebelite", megaPokemonSlug: "victreebel-mega", baseSpeciesSlug: "victreebel" }),
  stone({ itemId: 2561, itemName: "Starminite", itemSlug: "starminite", megaPokemonSlug: "starmie-mega", baseSpeciesSlug: "starmie" }),
  stone({ itemId: 2562, itemName: "Dragoninite", itemSlug: "dragoninite", megaPokemonSlug: "dragonite-mega", baseSpeciesSlug: "dragonite" }),
  stone({ itemId: 2563, itemName: "Meganiumite", itemSlug: "meganiumite", megaPokemonSlug: "meganium-mega", baseSpeciesSlug: "meganium" }),
  stone({ itemId: 2564, itemName: "Feraligite", itemSlug: "feraligite", megaPokemonSlug: "feraligatr-mega", baseSpeciesSlug: "feraligatr" }),
  stone({ itemId: 2565, itemName: "Skarmorite", itemSlug: "skarmorite", megaPokemonSlug: "skarmory-mega", baseSpeciesSlug: "skarmory" }),
  stone({ itemId: 2566, itemName: "Froslassite", itemSlug: "froslassite", megaPokemonSlug: "froslass-mega", baseSpeciesSlug: "froslass" }),
  stone({ itemId: 2567, itemName: "Heatranite", itemSlug: "heatranite", megaPokemonSlug: "heatran-mega", baseSpeciesSlug: "heatran" }),
  stone({ itemId: 2568, itemName: "Darkranite", itemSlug: "darkranite", megaPokemonSlug: "darkrai-mega", baseSpeciesSlug: "darkrai" }),
  stone({ itemId: 2569, itemName: "Emboarite", itemSlug: "emboarite", megaPokemonSlug: "emboar-mega", baseSpeciesSlug: "emboar" }),
  stone({ itemId: 2570, itemName: "Excadrite", itemSlug: "excadrite", megaPokemonSlug: "excadrill-mega", baseSpeciesSlug: "excadrill" }),
  stone({ itemId: 2571, itemName: "Scolipite", itemSlug: "scolipite", megaPokemonSlug: "scolipede-mega", baseSpeciesSlug: "scolipede" }),
  stone({ itemId: 2572, itemName: "Scraftinite", itemSlug: "scraftinite", megaPokemonSlug: "scrafty-mega", baseSpeciesSlug: "scrafty" }),
  stone({ itemId: 2573, itemName: "Eelektrossite", itemSlug: "eelektrossite", megaPokemonSlug: "eelektross-mega", baseSpeciesSlug: "eelektross" }),
  stone({ itemId: 2574, itemName: "Chandelurite", itemSlug: "chandelurite", megaPokemonSlug: "chandelure-mega", baseSpeciesSlug: "chandelure" }),
  stone({ itemId: 2575, itemName: "Chesnaughtite", itemSlug: "chesnaughtite", megaPokemonSlug: "chesnaught-mega", baseSpeciesSlug: "chesnaught" }),
  stone({ itemId: 2576, itemName: "Delphoxite", itemSlug: "delphoxite", megaPokemonSlug: "delphox-mega", baseSpeciesSlug: "delphox" }),
  stone({ itemId: 2577, itemName: "Greninjite", itemSlug: "greninjite", megaPokemonSlug: "greninja-mega", baseSpeciesSlug: "greninja" }),
  stone({ itemId: 2578, itemName: "Pyroarite", itemSlug: "pyroarite", megaPokemonSlug: "pyroar-mega", baseSpeciesSlug: "pyroar" }),
  stone({ itemId: 2579, itemName: "Floettite", itemSlug: "floettite", megaPokemonSlug: "floette-mega", baseSpeciesSlug: "floette" }),
  stone({ itemId: 2580, itemName: "Malamarite", itemSlug: "malamarite", megaPokemonSlug: "malamar-mega", baseSpeciesSlug: "malamar" }),
  stone({ itemId: 2581, itemName: "Barbaracite", itemSlug: "barbaracite", megaPokemonSlug: "barbaracle-mega", baseSpeciesSlug: "barbaracle" }),
  stone({ itemId: 2582, itemName: "Dragalgite", itemSlug: "dragalgite", megaPokemonSlug: "dragalge-mega", baseSpeciesSlug: "dragalge" }),
  stone({ itemId: 2583, itemName: "Hawluchanite", itemSlug: "hawluchanite", megaPokemonSlug: "hawlucha-mega", baseSpeciesSlug: "hawlucha" }),
  stone({ itemId: 2584, itemName: "Zygardite", itemSlug: "zygardite", megaPokemonSlug: "zygarde-mega", baseSpeciesSlug: "zygarde" }),
  stone({ itemId: 2585, itemName: "Drampanite", itemSlug: "drampanite", megaPokemonSlug: "drampa-mega", baseSpeciesSlug: "drampa" }),
  stone({ itemId: 2586, itemName: "Zeraorite", itemSlug: "zeraorite", megaPokemonSlug: "zeraora-mega", baseSpeciesSlug: "zeraora" }),
  stone({ itemId: 2587, itemName: "Falinksite", itemSlug: "falinksite", megaPokemonSlug: "falinks-mega", baseSpeciesSlug: "falinks" }),

  // Mega Dimension DLC
  stone({ itemId: 2635, itemName: "Raichunite X", itemSlug: "raichunite-x", megaPokemonSlug: "raichu-mega-x", baseSpeciesSlug: "raichu" }),
  stone({ itemId: 2636, itemName: "Raichunite Y", itemSlug: "raichunite-y", megaPokemonSlug: "raichu-mega-y", baseSpeciesSlug: "raichu" }),
  stone({ itemId: 2637, itemName: "Chimechite", itemSlug: "chimechite", megaPokemonSlug: "chimecho-mega", baseSpeciesSlug: "chimecho" }),
  stone({
    itemId: 2638,
    itemName: "Absolite Z",
    itemSlug: "absolite-z",
    megaPokemonSlug: "absol-mega",
    baseSpeciesSlug: "absol",
    aliases: ["Absolite Z Mega Stone"],
  }),
  stone({ itemId: 2639, itemName: "Staraptite", itemSlug: "staraptite", megaPokemonSlug: "staraptor-mega", baseSpeciesSlug: "staraptor", aliases: ["Staraptorite"] }),
  stone({
    itemId: 2640,
    itemName: "Garchompite Z",
    itemSlug: "garchompite-z",
    megaPokemonSlug: "garchomp-mega",
    baseSpeciesSlug: "garchomp",
  }),
  stone({
    itemId: 2641,
    itemName: "Lucarionite Z",
    itemSlug: "lucarionite-z",
    megaPokemonSlug: "lucario-mega",
    baseSpeciesSlug: "lucario",
  }),
  stone({ itemId: 2642, itemName: "Golurkite", itemSlug: "golurkite", megaPokemonSlug: "golurk-mega", baseSpeciesSlug: "golurk" }),
  stone({
    itemId: 2643,
    itemName: "Meowsticite",
    itemSlug: "meowsticite",
    megaPokemonSlug: "meowstic-male-mega",
    baseSpeciesSlug: "meowstic",
    aliases: ["Meowsticite Male", "Meowsticite Female"],
  }),
  stone({
    itemId: 2643,
    itemName: "Meowsticite",
    itemSlug: "meowsticite",
    megaPokemonSlug: "meowstic-female-mega",
    baseSpeciesSlug: "meowstic",
  }),
  stone({ itemId: 2644, itemName: "Crabominite", itemSlug: "crabominite", megaPokemonSlug: "crabominable-mega", baseSpeciesSlug: "crabominable" }),
  stone({ itemId: 2645, itemName: "Golisopite", itemSlug: "golisopite", megaPokemonSlug: "golisopod-mega", baseSpeciesSlug: "golisopod" }),
  stone({ itemId: 2646, itemName: "Magearnite", itemSlug: "magearnite", megaPokemonSlug: "magearna-mega", baseSpeciesSlug: "magearna" }),
  stone({
    itemId: 2646,
    itemName: "Magearnite",
    itemSlug: "magearnite",
    megaPokemonSlug: "magearna-original-mega",
    baseSpeciesSlug: "magearna",
  }),
  stone({ itemId: 2647, itemName: "Scovillainite", itemSlug: "scovillainite", megaPokemonSlug: "scovillain-mega", baseSpeciesSlug: "scovillain" }),
  stone({ itemId: 2648, itemName: "Baxcalibrite", itemSlug: "baxcalibrite", megaPokemonSlug: "baxcalibur-mega", baseSpeciesSlug: "baxcalibur" }),
  stone({
    itemId: 2649,
    itemName: "Tatsugirinite",
    itemSlug: "tatsugirinite",
    megaPokemonSlug: "tatsugiri-curly-mega",
    baseSpeciesSlug: "tatsugiri",
  }),
  stone({
    itemId: 2649,
    itemName: "Tatsugirinite",
    itemSlug: "tatsugirinite",
    megaPokemonSlug: "tatsugiri-droopy-mega",
    baseSpeciesSlug: "tatsugiri",
  }),
  stone({
    itemId: 2649,
    itemName: "Tatsugirinite",
    itemSlug: "tatsugirinite",
    megaPokemonSlug: "tatsugiri-stretchy-mega",
    baseSpeciesSlug: "tatsugiri",
  }),
  stone({ itemId: 2650, itemName: "Glimmoranite", itemSlug: "glimmoranite", megaPokemonSlug: "glimmora-mega", baseSpeciesSlug: "glimmora" }),
];

export const SUPPLEMENT_MEGA_STONE_MAPPINGS = MEGA_STONE_MAPPINGS.filter(
  (entry) => !entry.inPokeApiCatalog,
);

export const MEGA_STONE_ITEM_SLUGS = new Set(
  MEGA_STONE_MAPPINGS.map((entry) => entry.itemSlug),
);

function normalizeToken(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ");
}

function normalizeCompact(value: string): string {
  return normalizeToken(value).replace(/\s+/g, "");
}

function normalizeSpeciesSlug(value: string): string {
  const compact = normalizeCompact(value);
  if (compact.includes("mega")) {
    return compact.split("mega")[0]?.replace(/-+$/, "") ?? compact;
  }
  return compact;
}

function matchesItem(entry: ChampionsMegaStoneMapping, itemToken: string): boolean {
  const normalized = normalizeCompact(itemToken);
  if (!normalized) {
    return false;
  }
  if (normalizeCompact(entry.itemSlug) === normalized) {
    return true;
  }
  if (normalizeCompact(entry.itemName) === normalized) {
    return true;
  }
  return (entry.aliases ?? []).some((alias) => normalizeCompact(alias) === normalized);
}

function matchesSpecies(entry: ChampionsMegaStoneMapping, speciesToken: string): boolean {
  const normalized = normalizeSpeciesSlug(speciesToken);
  if (!normalized) {
    return false;
  }
  return (
    normalizeCompact(entry.baseSpeciesSlug) === normalized ||
    normalizeCompact(entry.megaPokemonSlug).startsWith(normalized)
  );
}

export function getMegaStoneMappingByItem(itemToken: string): ChampionsMegaStoneMapping | null {
  return MEGA_STONE_MAPPINGS.find((entry) => matchesItem(entry, itemToken)) ?? null;
}

export function getMegaStoneMappingsForSpecies(speciesToken: string): ChampionsMegaStoneMapping[] {
  return MEGA_STONE_MAPPINGS.filter((entry) => matchesSpecies(entry, speciesToken));
}

export function isMegaStoneItem(itemToken: string): boolean {
  return getMegaStoneMappingByItem(itemToken) !== null;
}

export function isMegaStoneCompatibleWithSpecies(species: string, itemToken: string): boolean {
  const mapping = getMegaStoneMappingByItem(itemToken);
  if (!mapping) {
    return false;
  }
  return matchesSpecies(mapping, species);
}

export function resolveMegaPokemonSlug(species: string, itemToken: string): string | null {
  const mapping = getMegaStoneMappingByItem(itemToken);
  if (!mapping || !matchesSpecies(mapping, species)) {
    return null;
  }
  return mapping.megaPokemonSlug;
}

export function resolveMegaPokemonSlugForShowdown(species: string, itemToken: string): string | null {
  const mapping = getMegaStoneMappingByItem(itemToken);
  if (!mapping || !matchesSpecies(mapping, species)) {
    return null;
  }
  const baseName = species.trim().split(/[\s-]+/)[0] ?? species.trim();
  const slug = mapping.megaPokemonSlug;
  const parts = slug.split("-");
  const megaIndex = parts.indexOf("mega");
  if (megaIndex === -1) {
    return `${baseName}-Mega`;
  }
  const axis = parts[megaIndex + 1];
  if (axis === "x" || axis === "y") {
    return `${baseName}-Mega-${axis.toUpperCase()}`;
  }
  return `${baseName}-Mega`;
}

export function filterMegaStonesForSpecies(species: string, itemNames: string[]): string[] {
  const compatible = itemNames.filter((itemName) => isMegaStoneCompatibleWithSpecies(species, itemName));
  return compatible.length > 0 ? compatible : itemNames;
}
