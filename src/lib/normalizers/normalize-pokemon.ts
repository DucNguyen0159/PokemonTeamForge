import { MOVE_TAGS } from "@/data/move-tags";
import { ALL_POKEMON_TYPES } from "@/data/type-chart";
import { calculateTypeEffectiveness } from "@/lib/calculations/shared/type-effectiveness";
import type { Ability } from "@/types/ability";
import type { Move, MoveTag } from "@/types/move";
import type { Pokemon, PokemonDetail, PokemonListItem } from "@/types/pokemon";
import type { PokemonType, TeamRole } from "@/types/shared";

type NamedApiResource = {
  name: string;
  url: string;
};

export interface PokeApiPokemonResponse {
  id: number;
  name: string;
  species: NamedApiResource;
  types: Array<{
    slot: number;
    type: NamedApiResource;
  }>;
  stats: Array<{
    base_stat: number;
    stat: NamedApiResource;
  }>;
  abilities: Array<{
    is_hidden: boolean;
    ability: NamedApiResource;
  }>;
  moves: Array<{
    move: NamedApiResource;
  }>;
  sprites: {
    front_default: string | null;
    front_shiny: string | null;
    other?: {
      "official-artwork"?: {
        front_default?: string | null;
        front_shiny?: string | null;
      };
      home?: {
        front_default?: string | null;
        front_shiny?: string | null;
      };
    };
  };
}

export interface PokeApiSpeciesResponse {
  generation: NamedApiResource;
  is_legendary: boolean;
  is_mythical: boolean;
}

export interface PokeApiAbilityResponse {
  id: number;
  name: string;
  effect_entries: Array<{
    short_effect: string;
    effect: string;
    language: {
      name: string;
    };
  }>;
}

export interface PokeApiMoveResponse {
  id: number;
  name: string;
  type: NamedApiResource;
  damage_class: NamedApiResource;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  priority: number;
}

/** Prefer higher-res Sugimori-style art; fall back to classic battle sprites. */
function pickPokeApiSprite(pokemon: PokeApiPokemonResponse, variant: "normal" | "shiny"): string {
  const oa = pokemon.sprites.other?.["official-artwork"];
  const home = pokemon.sprites.other?.home;
  if (variant === "shiny") {
    return oa?.front_shiny ?? home?.front_shiny ?? pokemon.sprites.front_shiny ?? "";
  }
  return oa?.front_default ?? home?.front_default ?? pokemon.sprites.front_default ?? "";
}

const GENERATION_REGION_MAP: Record<number, string> = {
  1: "Kanto",
  2: "Johto",
  3: "Hoenn",
  4: "Sinnoh",
  5: "Unova",
  6: "Kalos",
  7: "Alola",
  8: "Galar",
  9: "Paldea",
};

function toTitleCase(input: string): string {
  return input
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getGenerationNumber(generationName: string): number {
  const numericSegment = generationName.split("-")[1];
  const romanMap: Record<string, number> = {
    i: 1,
    ii: 2,
    iii: 3,
    iv: 4,
    v: 5,
    vi: 6,
    vii: 7,
    viii: 8,
    ix: 9,
  };

  return romanMap[numericSegment] ?? 0;
}

function getEnglishAbilityDescription(ability: PokeApiAbilityResponse): string {
  const englishEntry = ability.effect_entries.find((entry) => entry.language.name === "en");

  if (!englishEntry) {
    return "No description available.";
  }

  return englishEntry.short_effect || englishEntry.effect || "No description available.";
}

function deriveRolesFromStatsAndMoves(
  stats: Pokemon["stats"],
  moves: Move[],
): TeamRole[] {
  const roles = new Set<TeamRole>();

  if (stats.attack >= 110) {
    roles.add("physical_attacker");
  }

  if (stats.specialAttack >= 110) {
    roles.add("special_attacker");
  }

  if (stats.attack >= 100 && stats.specialAttack >= 100) {
    roles.add("mixed_attacker");
  }

  if (stats.defense >= 100) {
    roles.add("physical_wall");
  }

  if (stats.specialDefense >= 100) {
    roles.add("special_wall");
  }

  if (stats.hp + stats.defense + stats.specialDefense >= 260) {
    roles.add("tank");
  }

  moves.forEach((move) => {
    const tags = move.tags ?? [];

    if (tags.includes("pivot")) roles.add("pivot");
    if (tags.includes("entry_hazard")) roles.add("hazard_setter");
    if (tags.includes("hazard_removal")) roles.add("hazard_remover");
    if (tags.includes("setup")) roles.add("setup_sweeper");
    if (tags.includes("speed_control")) roles.add("speed_control");
    if (tags.includes("status")) roles.add("status_spreader");
    if (tags.includes("priority")) roles.add("priority_user");
    if (tags.includes("trap")) roles.add("trap_user");
    if (tags.includes("redirection")) roles.add("redirection_support");
  });

  if (
    roles.has("pivot") ||
    roles.has("status_spreader") ||
    roles.has("hazard_setter") ||
    roles.has("hazard_remover")
  ) {
    roles.add("support");
  }

  if (roles.has("physical_attacker") && roles.has("setup_sweeper")) {
    roles.add("wallbreaker");
  }

  return Array.from(roles);
}

function normalizeMoveTagList(slug: string): MoveTag[] | undefined {
  const tags = MOVE_TAGS[slug];
  return tags && tags.length > 0 ? [...tags] : undefined;
}

function normalizeMove(rawMove: PokeApiMoveResponse): Move {
  const category =
    rawMove.damage_class.name === "physical" ||
    rawMove.damage_class.name === "special"
      ? rawMove.damage_class.name
      : "status";

  return {
    id: rawMove.id,
    name: toTitleCase(rawMove.name),
    slug: rawMove.name,
    type: rawMove.type.name as PokemonType,
    category,
    power: rawMove.power,
    accuracy: rawMove.accuracy,
    pp: rawMove.pp,
    priority: rawMove.priority,
    tags: normalizeMoveTagList(rawMove.name),
  };
}

export function buildTypeDefenseEntries(
  primaryType: PokemonType,
  secondaryType?: PokemonType | null,
): PokemonDetail["typeDefense"] {
  const defendingTypes = secondaryType ? [primaryType, secondaryType] : [primaryType];

  return ALL_POKEMON_TYPES.map((attackingType) => ({
    type: attackingType,
    multiplier: calculateTypeEffectiveness(attackingType, defendingTypes),
  }));
}

export function normalizePokeApiToPokemonListItem(
  pokemon: PokeApiPokemonResponse,
  species: PokeApiSpeciesResponse,
): PokemonListItem {
  const sortedTypes = [...pokemon.types].sort((a, b) => a.slot - b.slot);
  const primaryType = sortedTypes[0]?.type.name as PokemonType;
  const secondaryType = (sortedTypes[1]?.type.name as PokemonType | undefined) ?? null;

  const statsByName = new Map(pokemon.stats.map((entry) => [entry.stat.name, entry.base_stat]));

  const hp = statsByName.get("hp") ?? 0;
  const attack = statsByName.get("attack") ?? 0;
  const defense = statsByName.get("defense") ?? 0;
  const specialAttack = statsByName.get("special-attack") ?? 0;
  const specialDefense = statsByName.get("special-defense") ?? 0;
  const speed = statsByName.get("speed") ?? 0;
  const total = hp + attack + defense + specialAttack + specialDefense + speed;

  const generation = getGenerationNumber(species.generation.name);

  return {
    id: pokemon.id,
    name: toTitleCase(pokemon.name),
    slug: pokemon.name,
    generation,
    region: GENERATION_REGION_MAP[generation] ?? "Unknown",
    primaryType,
    secondaryType,
    hp,
    attack,
    defense,
    specialAttack,
    specialDefense,
    speed,
    total,
    spriteNormal: pickPokeApiSprite(pokemon, "normal"),
    isLegendaryOrMythical: Boolean(species.is_legendary || species.is_mythical),
    isFullyEvolved: true,
  };
}

export function normalizePokeApiPokemonDetail(input: {
  pokemon: PokeApiPokemonResponse;
  species: PokeApiSpeciesResponse;
  abilityDetails: PokeApiAbilityResponse[];
  moveDetails: PokeApiMoveResponse[];
}): PokemonDetail {
  const { pokemon, species, abilityDetails, moveDetails } = input;

  const sortedTypes = [...pokemon.types].sort((a, b) => a.slot - b.slot);
  const primaryType = sortedTypes[0]?.type.name as PokemonType;
  const secondaryType = (sortedTypes[1]?.type.name as PokemonType | undefined) ?? null;

  const statsByName = new Map(pokemon.stats.map((entry) => [entry.stat.name, entry.base_stat]));

  const stats = {
    hp: statsByName.get("hp") ?? 0,
    attack: statsByName.get("attack") ?? 0,
    defense: statsByName.get("defense") ?? 0,
    specialAttack: statsByName.get("special-attack") ?? 0,
    specialDefense: statsByName.get("special-defense") ?? 0,
    speed: statsByName.get("speed") ?? 0,
    total: 0,
  };
  stats.total =
    stats.hp +
    stats.attack +
    stats.defense +
    stats.specialAttack +
    stats.specialDefense +
    stats.speed;

  const abilityMap = new Map(abilityDetails.map((ability) => [ability.name, ability]));
  const abilities: Ability[] = pokemon.abilities.map((entry) => {
    const detail = abilityMap.get(entry.ability.name);

    return {
      id: detail?.id ?? 0,
      name: toTitleCase(entry.ability.name),
      slug: entry.ability.name,
      description: detail ? getEnglishAbilityDescription(detail) : "No description available.",
      isHidden: entry.is_hidden || undefined,
    };
  });

  const moves = moveDetails.map(normalizeMove);
  const roles = deriveRolesFromStatsAndMoves(stats, moves);
  const generation = getGenerationNumber(species.generation.name);

  return {
    id: pokemon.id,
    name: toTitleCase(pokemon.name),
    slug: pokemon.name,
    generation,
    region: GENERATION_REGION_MAP[generation] ?? "Unknown",
    primaryType,
    secondaryType,
    stats,
    spriteNormal: pickPokeApiSprite(pokemon, "normal"),
    spriteShiny: pickPokeApiSprite(pokemon, "shiny") || null,
    isLegendaryOrMythical: Boolean(species.is_legendary || species.is_mythical),
    isFullyEvolved: true,
    abilities,
    moves,
    roles,
    typeDefense: buildTypeDefenseEntries(primaryType, secondaryType),
  };
}

export function toPokemonListItem(pokemon: Pokemon): PokemonListItem {
  return {
    id: pokemon.id,
    name: pokemon.name,
    slug: pokemon.slug,
    generation: pokemon.generation,
    region: pokemon.region,
    primaryType: pokemon.primaryType,
    secondaryType: pokemon.secondaryType ?? null,
    hp: pokemon.stats.hp,
    attack: pokemon.stats.attack,
    defense: pokemon.stats.defense,
    specialAttack: pokemon.stats.specialAttack,
    specialDefense: pokemon.stats.specialDefense,
    speed: pokemon.stats.speed,
    total: pokemon.stats.total,
    spriteNormal: pokemon.spriteNormal,
    isLegendaryOrMythical: pokemon.isLegendaryOrMythical,
    isFullyEvolved: pokemon.isFullyEvolved,
  };
}
