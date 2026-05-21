import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { PokemonListSortDirection, PokemonListSortKey } from "@/constants/pokemon-list-sort";
import { RECOMMENDATION_ALLOWED_PRE_EVOLUTION_SET } from "@/data/recommendation-candidates";
import type { PokemonListPayload } from "@/types/api";
import type { MoveCategory, PokemonType, TeamRole } from "@/types/shared";
import {
  buildListFormFields,
  comparePokemonListByNationalDex,
  groupAlternateFormsByKind,
  isPokemonFormKind,
  type AlternateForm,
  type PokemonFormKind,
} from "@/lib/pokemon/pokemon-forms";
import type { EvolutionStage, Pokemon, PokemonDetail, PokemonListItem } from "@/types/pokemon";
import {
  buildEvolutionRootsFromPokeApiChain,
  collectSpeciesSlugsFromPokeApiChain,
  evolutionStageMetaFromPokemonRow,
  getDisplayEvolutionChain,
  parseEvolutionChainId,
  parseStoredEvolutionChain,
  type EvolutionStageMeta,
  type PokeApiEvolutionChainNode,
} from "@/lib/pokemon/evolution-chain";
import type { Ability } from "@/types/ability";
import type { Move, MoveTag } from "@/types/move";

import {
  buildTypeDefenseEntries,
  normalizePokeApiPokemonDetail,
  normalizePokeApiToPokemonListItem,
  type PokeApiAbilityResponse,
  type PokeApiMoveResponse,
  type PokeApiPokemonResponse,
  type PokeApiSpeciesResponse,
} from "@/lib/normalizers/normalize-pokemon";

const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";
const REVALIDATE_SECONDS = 60 * 60 * 24;
const MAX_MOVES_PER_POKEMON = 200;

type NamedApiResource = {
  name: string;
  url: string;
};

type PokemonRef = {
  id: number;
  name: string;
};

type PokeApiPokemonListPage = {
  next: string | null;
  results: NamedApiResource[];
};

type PokemonRow = {
  id: number;
  slug: string;
  name: string;
  generation: number;
  region: string;
  primary_type: PokemonType;
  secondary_type: PokemonType | null;
  hp: number;
  attack: number;
  defense: number;
  special_attack: number;
  special_defense: number;
  speed: number;
  total: number;
  is_legendary: boolean;
  is_mythical: boolean;
  is_fully_evolved: boolean;
  sprite_normal_url: string | null;
  sprite_shiny_url: string | null;
  roles: TeamRole[] | null;
  evolution_chain_id?: number | null;
  species_slug?: string;
  form_kind?: PokemonFormKind | string;
  base_slug?: string | null;
  pokedex_display_no?: number;
  list_sort_rank?: number;
};

type AlternateFormRow = {
  slug: string;
  name: string;
  form_kind: PokemonFormKind | string;
  primary_type: PokemonType;
  secondary_type: PokemonType | null;
  total: number;
  sprite_normal_url: string | null;
  pokedex_display_no: number;
  list_sort_rank: number;
};

type AbilityRow = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
};

type MoveRow = {
  id: number;
  slug: string;
  name: string;
  type: PokemonType;
  category: MoveCategory;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  priority: number;
  description: string | null;
  tags: MoveTag[] | null;
};

type PokemonAbilityJoinRow = {
  slot: number;
  is_hidden: boolean;
  abilities: AbilityRow | AbilityRow[] | null;
};

type PokemonMoveJoinRow = {
  moves: MoveRow | MoveRow[] | null;
};

type PokemonAbilityCandidateJoinRow = PokemonAbilityJoinRow & {
  pokemon_id: number;
};

type AbilityEffectText = {
  shortEffect: string;
  fullEffect?: string;
};

const pokemonDetailCache = new Map<string, PokemonDetail>();
const evolutionChainCache = new Map<number, EvolutionStage[]>();
const pokeApiSpeciesMetaCache = new Map<string, EvolutionStageMeta>();
const pokemonListItemCache = new Map<string, PokemonListItem>();
const abilityEffectCache = new Map<string, AbilityEffectText>();

let pokemonIndexCache: PokemonRef[] | null = null;
let recommendationPoolCache: { expiresAt: number; data: Pokemon[] } | null = null;
const typeSlugCache = new Map<PokemonType, Set<string>>();
const generationSpeciesNamesCache = new Map<number, string[]>();
const abilitySlugCache = new Map<string, Set<string>>();
const RECOMMENDATION_POOL_CACHE_TTL_MS = 1000 * 60 * 15;
const RECOMMENDATION_POOL_LIMIT = 1200;
const ROLE_MOVE_TAGS: Partial<Record<TeamRole, MoveTag[]>> = {
  hazard_setter: ["entry_hazard"],
  hazard_remover: ["hazard_removal"],
  pivot: ["pivot"],
  setup_sweeper: ["setup"],
  speed_control: ["speed_control"],
  weather_setter: ["weather"],
  weather_abuser: ["weather"],
  trick_room_setter: ["trick_room", "speed_control"],
  trick_room_abuser: ["trick_room"],
  redirection_support: ["redirection"],
  status_spreader: ["status"],
  priority_user: ["priority"],
  trap_user: ["trap"],
};

function hasSupabaseServerEnv(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase is not configured.");
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function sortColumnForKey(sortKey: PokemonListSortKey): keyof PokemonRow {
  switch (sortKey) {
    case "name":
      return "name";
    case "total":
      return "total";
    case "hp":
      return "hp";
    case "attack":
      return "attack";
    case "defense":
      return "defense";
    case "specialAttack":
      return "special_attack";
    case "specialDefense":
      return "special_defense";
    case "speed":
      return "speed";
    case "id":
    default:
      return "id";
  }
}

function resolveFormKindFromRow(row: PokemonRow): PokemonFormKind {
  if (row.form_kind && isPokemonFormKind(row.form_kind)) {
    return row.form_kind;
  }

  return "default";
}

function toPokemonListItemFromRow(row: PokemonRow): PokemonListItem {
  const formKind = resolveFormKindFromRow(row);
  const pokedexDisplayNo = row.pokedex_display_no ?? row.id;
  const listSortRank = row.list_sort_rank ?? pokedexDisplayNo * 10;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    generation: row.generation,
    region: row.region,
    primaryType: row.primary_type,
    secondaryType: row.secondary_type,
    hp: row.hp,
    attack: row.attack,
    defense: row.defense,
    specialAttack: row.special_attack,
    specialDefense: row.special_defense,
    speed: row.speed,
    total: row.total,
    spriteNormal: row.sprite_normal_url ?? "",
    isLegendaryOrMythical: row.is_legendary || row.is_mythical,
    isFullyEvolved: row.is_fully_evolved,
    formKind,
    baseSlug: row.base_slug ?? null,
    pokedexDisplayNo,
    listSortRank,
  };
}

function toAlternateFormFromRow(row: AlternateFormRow): AlternateForm {
  return {
    formKind: resolveFormKindFromRow(row as PokemonRow),
    slug: row.slug,
    name: row.name,
    primaryType: row.primary_type,
    secondaryType: row.secondary_type,
    total: row.total,
    spriteNormal: row.sprite_normal_url ?? "",
    pokedexDisplayNo: row.pokedex_display_no,
    listSortRank: row.list_sort_rank,
  };
}

async function loadAlternateFormsForPokemon(
  supabase: ReturnType<typeof getSupabaseServerClient>,
  row: PokemonRow,
): Promise<AlternateForm[]> {
  const displayNo = row.pokedex_display_no ?? row.id;

  const { data, error } = await supabase
    .from("pokemon")
    .select(
      "slug, name, form_kind, primary_type, secondary_type, total, sprite_normal_url, pokedex_display_no, list_sort_rank",
    )
    .eq("pokedex_display_no", displayNo)
    .neq("slug", row.slug)
    .order("list_sort_rank", { ascending: true });

  if (error) {
    console.error("[Pokemon Supabase Alternate Forms]", error);
    return [];
  }

  return ((data as AlternateFormRow[] | null) ?? []).map(toAlternateFormFromRow);
}

function getEnglishAbilityEffects(ability: PokeApiAbilityResponse): AbilityEffectText {
  const englishEntry = ability.effect_entries.find((entry) => entry.language.name === "en");
  const shortEffect = englishEntry?.short_effect?.trim() || englishEntry?.effect?.trim() || "No description available.";
  const fullEffect = englishEntry?.effect?.trim();

  return {
    shortEffect,
    fullEffect: fullEffect && fullEffect !== shortEffect ? fullEffect : undefined,
  };
}

async function getAbilityEffectText(slug: string): Promise<AbilityEffectText | null> {
  const normalized = normalizePokemonName(slug);
  const cached = abilityEffectCache.get(normalized);
  if (cached) {
    return cached;
  }

  try {
    const ability = await pokeApiFetchWithRetry<PokeApiAbilityResponse>(`/ability/${normalized}`, 2);
    const effects = getEnglishAbilityEffects(ability);
    abilityEffectCache.set(normalized, effects);
    return effects;
  } catch {
    return null;
  }
}

function toAbility(row: AbilityRow, isHidden: boolean, effects?: AbilityEffectText | null): Ability {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: effects?.shortEffect ?? row.description ?? "No description available.",
    fullEffect: effects?.fullEffect,
    isHidden: isHidden || undefined,
  };
}

function toMove(row: MoveRow): Move {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    type: row.type,
    category: row.category,
    power: row.power,
    accuracy: row.accuracy,
    pp: row.pp,
    priority: row.priority,
    description: row.description ?? undefined,
    tags: row.tags && row.tags.length > 0 ? row.tags : undefined,
  };
}

function relatedOne<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value;
}

function chunkArray<T>(values: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }
  return chunks;
}

function recommendationCategoryForStats(row: PokemonRow): MoveCategory {
  if (row.attack > row.special_attack) {
    return "physical";
  }
  if (row.special_attack > row.attack) {
    return "special";
  }
  return "status";
}

function moveTagsForRecommendationRoles(roles: TeamRole[]): MoveTag[] {
  return Array.from(
    new Set(roles.flatMap((role) => ROLE_MOVE_TAGS[role] ?? [])),
  );
}

function buildRecommendationCandidateMoves(row: PokemonRow): Move[] {
  const types = [row.primary_type, row.secondary_type].filter((type): type is PokemonType => Boolean(type));
  const tags = moveTagsForRecommendationRoles(row.roles ?? []);
  const category = recommendationCategoryForStats(row);

  return types.map((type, index) => ({
    id: -(row.id * 10 + index),
    name: `${row.name} ${type} coverage`,
    slug: `${row.slug}-${type}-coverage`,
    type,
    category,
    priority: 0,
    tags: index === 0 && tags.length > 0 ? tags : undefined,
  }));
}

function toPokemonRecommendationCandidate(
  row: PokemonRow,
  abilities: Ability[],
): Pokemon {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    generation: row.generation,
    region: row.region,
    primaryType: row.primary_type,
    secondaryType: row.secondary_type,
    stats: {
      hp: row.hp,
      attack: row.attack,
      defense: row.defense,
      specialAttack: row.special_attack,
      specialDefense: row.special_defense,
      speed: row.speed,
      total: row.total,
    },
    spriteNormal: row.sprite_normal_url ?? "",
    spriteShiny: row.sprite_shiny_url,
    isLegendaryOrMythical: row.is_legendary || row.is_mythical,
    isFullyEvolved: row.is_fully_evolved,
    abilities,
    moves: buildRecommendationCandidateMoves(row),
    roles: row.roles ?? [],
  };
}

export interface PokemonListQuery {
  search?: string;
  generation?: number;
  type?: PokemonType;
  ability?: string;
  region?: string;
  legendary?: boolean;
  page?: number;
  limit?: number;
  sortBy?: PokemonListSortKey;
  sortDirection?: PokemonListSortDirection;
  hideAlternateForms?: boolean;
}

async function pokeApiFetch<T>(pathOrUrl: string): Promise<T> {
  const url =
    pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")
      ? pathOrUrl
      : `${POKEAPI_BASE_URL}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;

  const response = await fetch(url, {
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`PokéAPI request failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

async function pokeApiFetchWithRetry<T>(pathOrUrl: string, attempts = 3): Promise<T> {
  let lastError: unknown;

  for (let index = 0; index < attempts; index += 1) {
    try {
      return await pokeApiFetch<T>(pathOrUrl);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("PokéAPI request failed.");
}

function normalizePokemonName(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, "-");
}

function clampPagination(value: number | undefined, fallback: number, max: number): number {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  const parsed = Math.floor(value as number);

  if (parsed < 1) {
    return fallback;
  }

  return Math.min(parsed, max);
}

function extractPokemonIdFromUrl(url: string): number {
  const match = url.match(/\/pokemon\/(\d+)\/?$/);
  return match ? Number(match[1]) : 0;
}

function normalizeSearchQuery(term: string): string {
  return term.trim().toLowerCase().replace(/\s+/g, "-");
}

function matchesSearch(slug: string, search?: string): boolean {
  const normalized = search ? normalizeSearchQuery(search) : "";
  if (!normalized) {
    return true;
  }

  const flattenedSlug = slug.replace(/-/g, "");
  const flattenedQuery = normalized.replace(/-/g, "");

  return slug.includes(normalized) || flattenedSlug.includes(flattenedQuery);
}

function slugMatchesGeneration(slug: string, speciesNames: string[]): boolean {
  const names = new Set(speciesNames);
  if (names.has(slug)) {
    return true;
  }

  return speciesNames.some((species) => slug.startsWith(`${species}-`));
}

async function ensurePokemonIndex(): Promise<PokemonRef[]> {
  if (pokemonIndexCache) {
    return pokemonIndexCache;
  }

  const refs: PokemonRef[] = [];
  let fetchUrl: string | null = `${POKEAPI_BASE_URL}/pokemon?limit=500&offset=0`;

  while (fetchUrl !== null) {
    const listingBatch: PokeApiPokemonListPage = await pokeApiFetch<PokeApiPokemonListPage>(fetchUrl);

    listingBatch.results.forEach((entry) => {
      refs.push({
        id: extractPokemonIdFromUrl(entry.url),
        name: entry.name,
      });
    });

    fetchUrl = listingBatch.next;
  }

  pokemonIndexCache = [...refs].sort((a, b) => a.id - b.id);

  return pokemonIndexCache;
}

async function ensureTypeSlugSet(type: PokemonType): Promise<Set<string>> {
  const cached = typeSlugCache.get(type);
  if (cached) {
    return cached;
  }

  const data = await pokeApiFetch<{ pokemon: Array<{ pokemon: NamedApiResource }> }>(`/type/${type}`);
  const set = new Set(data.pokemon.map((row) => row.pokemon.name));
  typeSlugCache.set(type, set);

  return set;
}

async function ensureAbilitySlugSet(ability: string): Promise<Set<string>> {
  const normalized = normalizePokemonName(ability);
  const cached = abilitySlugCache.get(normalized);
  if (cached) {
    return cached;
  }

  try {
    const data = await pokeApiFetch<{ pokemon: Array<{ pokemon: NamedApiResource }> }>(
      `/ability/${normalized}`,
    );
    const set = new Set(data.pokemon.map((row) => row.pokemon.name));
    abilitySlugCache.set(normalized, set);
    return set;
  } catch {
    const empty = new Set<string>();
    abilitySlugCache.set(normalized, empty);
    return empty;
  }
}

async function ensureGenerationSpeciesNames(generation: number): Promise<string[]> {
  const cached = generationSpeciesNamesCache.get(generation);
  if (cached) {
    return cached;
  }

  const data = await pokeApiFetch<{ pokemon_species: NamedApiResource[] }>(`/generation/${generation}`);
  const names = data.pokemon_species.map((entry) => entry.name);
  generationSpeciesNamesCache.set(generation, names);

  return names;
}

function sortKeyNeedsStatHydration(sortKey: PokemonListSortKey): boolean {
  return sortKey !== "id" && sortKey !== "name";
}

async function hydratePokemonListItem(slug: string): Promise<PokemonListItem | null> {
  const cached = pokemonListItemCache.get(slug);
  if (cached) {
    return cached;
  }

  try {
    const rawPokemon = await pokeApiFetch<PokeApiPokemonResponse>(`/pokemon/${slug}`);
    const rawSpecies = await pokeApiFetch<PokeApiSpeciesResponse>(
      `/pokemon-species/${rawPokemon.species.name}`,
    );

    const item = normalizePokeApiToPokemonListItem(rawPokemon, rawSpecies);
    pokemonListItemCache.set(slug, item);

    return item;
  } catch {
    return null;
  }
}

/** Hydrate in fixed-size parallel chunks to limit load on PokéAPI while preserving slug order. */
async function hydratePokemonListItemsWithConcurrency(
  slugs: string[],
  concurrency: number,
): Promise<PokemonListItem[]> {
  const out: PokemonListItem[] = [];
  const size = Math.max(1, concurrency);

  for (let offset = 0; offset < slugs.length; offset += size) {
    const chunk = slugs.slice(offset, offset + size);
    const batch = await Promise.all(chunk.map((slug) => hydratePokemonListItem(slug)));
    out.push(...batch.filter((entry): entry is PokemonListItem => Boolean(entry)));
  }

  return out;
}

function comparePokemonRefs(a: PokemonRef, b: PokemonRef, sortKey: PokemonListSortKey, dir: PokemonListSortDirection): number {
  let cmp = 0;

  if (sortKey === "name") {
    cmp = a.name.localeCompare(b.name);
  } else {
    cmp = a.id - b.id;
  }

  return dir === "asc" ? cmp : -cmp;
}

function comparePokemonListItems(
  a: PokemonListItem,
  b: PokemonListItem,
  sortKey: PokemonListSortKey,
  dir: PokemonListSortDirection,
): number {
  let cmp = 0;

  switch (sortKey) {
    case "id":
      cmp = comparePokemonListByNationalDex(a, b);
      break;
    case "name":
      cmp = a.name.localeCompare(b.name);
      break;
    case "total":
      cmp = a.total - b.total;
      break;
    case "hp":
      cmp = a.hp - b.hp;
      break;
    case "attack":
      cmp = a.attack - b.attack;
      break;
    case "defense":
      cmp = a.defense - b.defense;
      break;
    case "specialAttack":
      cmp = a.specialAttack - b.specialAttack;
      break;
    case "specialDefense":
      cmp = a.specialDefense - b.specialDefense;
      break;
    case "speed":
      cmp = a.speed - b.speed;
      break;
    default:
      cmp = a.id - b.id;
  }

  if (cmp === 0) {
    cmp = a.id - b.id;
  }

  return dir === "asc" ? cmp : -cmp;
}

async function getPokemonListFromSupabase(
  query: PokemonListQuery,
  page: number,
  limit: number,
  sortBy: PokemonListSortKey,
  sortDirection: PokemonListSortDirection,
): Promise<PokemonListPayload | null> {
  if (!hasSupabaseServerEnv()) {
    return null;
  }

  const supabase = getSupabaseServerClient();
  const start = (page - 1) * limit;
  const end = start + limit - 1;
  const sortColumn = sortColumnForKey(sortBy);
  const ability = query.ability ? normalizePokemonName(query.ability) : "";
  let abilityPokemonIds: number[] | null = null;

  if (ability) {
    const { data: abilityRow, error: abilityError } = await supabase
      .from("abilities")
      .select("id")
      .eq("slug", ability)
      .maybeSingle();

    if (abilityError) {
      console.error("[Pokemon Supabase Ability Filter]", abilityError);
      return null;
    }

    if (!abilityRow) {
      return {
        pokemon: [],
        total: 0,
        page,
        limit,
      };
    }

    const { data: abilityPokemonRows, error: abilityPokemonError } = await supabase
      .from("pokemon_abilities")
      .select("pokemon_id")
      .eq("ability_id", (abilityRow as { id: number }).id);

    if (abilityPokemonError) {
      console.error("[Pokemon Supabase Ability Relationships]", abilityPokemonError);
      return null;
    }

    abilityPokemonIds = Array.from(
      new Set((abilityPokemonRows as Array<{ pokemon_id: number }> | null)?.map((row) => row.pokemon_id) ?? []),
    );

    if (abilityPokemonIds.length === 0) {
      return {
        pokemon: [],
        total: 0,
        page,
        limit,
      };
    }
  }

  let request = supabase
    .from("pokemon")
    .select(
      "id, slug, name, generation, region, primary_type, secondary_type, hp, attack, defense, special_attack, special_defense, speed, total, is_legendary, is_mythical, is_fully_evolved, sprite_normal_url, sprite_shiny_url, roles, form_kind, base_slug, pokedex_display_no, list_sort_rank",
      { count: "exact" },
    );

  if (query.hideAlternateForms) {
    request = request.eq("form_kind", "default");
  }

  if (typeof query.generation === "number") {
    request = request.eq("generation", query.generation);
  }

  if (query.type) {
    request = request.or(`primary_type.eq.${query.type},secondary_type.eq.${query.type}`);
  }

  if (abilityPokemonIds) {
    request = request.in("id", abilityPokemonIds);
  }

  if (typeof query.legendary === "boolean") {
    if (query.legendary) {
      request = request.or("is_legendary.eq.true,is_mythical.eq.true");
    } else {
      request = request.eq("is_legendary", false).eq("is_mythical", false);
    }
  }

  const search = query.search?.trim();
  if (search) {
    const normalized = normalizeSearchQuery(search);
    const displaySearch = search.replace(/[%_,]/g, "");
    request = request.or(`name.ilike.%${displaySearch}%,slug.ilike.%${normalized}%`);
  }

  if (sortBy === "id") {
    request = request
      .order("pokedex_display_no", { ascending: sortDirection === "asc" })
      .order("list_sort_rank", { ascending: sortDirection === "asc" })
      .order("id", { ascending: true });
  } else {
    request = request
      .order(sortColumn, { ascending: sortDirection === "asc" })
      .order("id", { ascending: true });
  }

  const { data, error, count } = await request.range(start, end);

  if (error || !data) {
    console.error("[Pokemon Supabase List]", error);
    return null;
  }

  return {
    pokemon: (data as PokemonRow[]).map(toPokemonListItemFromRow),
    total: count ?? data.length,
    page,
    limit,
  };
}

export async function getPokemonListItemsBySlugs(slugs: string[]): Promise<PokemonListItem[]> {
  const normalizedSlugs = Array.from(
    new Set(slugs.map((slug) => normalizePokemonName(slug)).filter(Boolean)),
  );

  if (normalizedSlugs.length === 0) {
    return [];
  }

  const cachedBySlug = new Map<string, PokemonListItem>();
  const missingSlugs: string[] = [];

  normalizedSlugs.forEach((slug) => {
    const cached = pokemonListItemCache.get(slug);
    if (cached) {
      cachedBySlug.set(slug, cached);
    } else {
      missingSlugs.push(slug);
    }
  });

  if (missingSlugs.length > 0 && hasSupabaseServerEnv()) {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("pokemon")
      .select(
        "id, slug, name, generation, region, primary_type, secondary_type, hp, attack, defense, special_attack, special_defense, speed, total, is_legendary, is_mythical, is_fully_evolved, sprite_normal_url, sprite_shiny_url, roles, form_kind, base_slug, pokedex_display_no, list_sort_rank",
      )
      .in("slug", missingSlugs);

    if (error) {
      console.error("[Pokemon Supabase Summary]", error);
    } else {
      (data as PokemonRow[] | null)?.forEach((row) => {
        const item = toPokemonListItemFromRow(row);
        pokemonListItemCache.set(item.slug, item);
        cachedBySlug.set(item.slug, item);
      });
    }
  }

  const stillMissingSlugs = normalizedSlugs.filter((slug) => !cachedBySlug.has(slug));
  if (stillMissingSlugs.length > 0) {
    const hydrated = await Promise.all(
      stillMissingSlugs.map((slug) => hydratePokemonListItem(slug)),
    );
    hydrated.forEach((item) => {
      if (item) {
        cachedBySlug.set(item.slug, item);
      }
    });
  }

  return normalizedSlugs
    .map((slug) => cachedBySlug.get(slug) ?? null)
    .filter((item): item is PokemonListItem => Boolean(item));
}

type PokeApiEvolutionChainResponse = {
  id: number;
  chain: PokeApiEvolutionChainNode;
};

function pickPokeApiSpriteUrl(pokemon: PokeApiPokemonResponse): string {
  const officialArtwork = pokemon.sprites?.other?.["official-artwork"];
  const home = pokemon.sprites?.other?.home;
  return (
    officialArtwork?.front_default ??
    home?.front_default ??
    pokemon.sprites?.front_default ??
    ""
  );
}

async function loadEvolutionChainFromSupabase(chainId: number): Promise<EvolutionStage[] | undefined> {
  const cached = evolutionChainCache.get(chainId);
  if (cached) {
    return cached;
  }

  if (!hasSupabaseServerEnv()) {
    return undefined;
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("evolution_chains")
    .select("chain_json")
    .eq("id", chainId)
    .maybeSingle();

  if (error) {
    console.error("[Pokemon Supabase Evolution Chain]", error);
    return undefined;
  }

  if (!data) {
    return undefined;
  }

  const stages = getDisplayEvolutionChain(parseStoredEvolutionChain(data.chain_json));
  evolutionChainCache.set(chainId, stages);
  return stages;
}

async function resolveEvolutionSpeciesMeta(speciesSlug: string): Promise<EvolutionStageMeta | null> {
  const cached = pokeApiSpeciesMetaCache.get(speciesSlug);
  if (cached) {
    return cached;
  }

  if (hasSupabaseServerEnv()) {
    const supabase = getSupabaseServerClient();
    const { data } = await supabase
      .from("pokemon")
      .select(
        "id, slug, name, species_slug, primary_type, secondary_type, sprite_normal_url",
      )
      .or(`species_slug.eq.${speciesSlug},slug.eq.${speciesSlug}`)
      .limit(1)
      .maybeSingle();

    if (data) {
      const meta = evolutionStageMetaFromPokemonRow(data);
      pokeApiSpeciesMetaCache.set(speciesSlug, meta);
      return meta;
    }
  }

  try {
    const rawPokemon = await pokeApiFetchWithRetry<PokeApiPokemonResponse>(`/pokemon/${speciesSlug}`, 2);
    const sortedTypes = [...rawPokemon.types].sort((a, b) => a.slot - b.slot);
    const meta: EvolutionStageMeta = {
      pokemonId: rawPokemon.id,
      name: rawPokemon.name
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      slug: rawPokemon.name,
      spriteNormal: pickPokeApiSpriteUrl(rawPokemon),
      primaryType: (sortedTypes[0]?.type.name ?? "normal") as PokemonType,
      secondaryType: sortedTypes[1]?.type.name
        ? (sortedTypes[1].type.name as PokemonType)
        : null,
    };
    pokeApiSpeciesMetaCache.set(speciesSlug, meta);
    return meta;
  } catch {
    return null;
  }
}

async function fetchEvolutionChainFromPokeApi(
  rawSpecies: PokeApiSpeciesResponse,
): Promise<EvolutionStage[] | undefined> {
  const chainUrl = rawSpecies.evolution_chain?.url;
  const chainId = parseEvolutionChainId(chainUrl);
  if (!chainId || !chainUrl) {
    return undefined;
  }

  const cached = evolutionChainCache.get(chainId);
  if (cached) {
    return cached;
  }

  try {
    const rawChain = await pokeApiFetchWithRetry<PokeApiEvolutionChainResponse>(chainUrl, 2);
    const uniqueSlugs = [...new Set(collectSpeciesSlugsFromPokeApiChain(rawChain.chain))];
    const metaBySpecies = new Map<string, EvolutionStageMeta>();

    await Promise.all(
      uniqueSlugs.map(async (speciesSlug) => {
        const meta = await resolveEvolutionSpeciesMeta(speciesSlug);
        if (meta) {
          metaBySpecies.set(speciesSlug, meta);
        }
      }),
    );

    const roots = buildEvolutionRootsFromPokeApiChain(rawChain.chain, (slug) => metaBySpecies.get(slug) ?? null);
    evolutionChainCache.set(chainId, roots);
    return roots;
  } catch (error) {
    console.error("[Pokemon PokeAPI Evolution Chain]", error);
    return undefined;
  }
}

async function getPokemonDetailFromSupabase(slugOrId: string): Promise<PokemonDetail | null> {
  if (!hasSupabaseServerEnv()) {
    return null;
  }

  const supabase = getSupabaseServerClient();
  const normalized = normalizePokemonName(slugOrId);
  const numericId = Number(normalized);

  let pokemonRequest = supabase
    .from("pokemon")
    .select(
      "id, slug, name, species_slug, generation, region, primary_type, secondary_type, hp, attack, defense, special_attack, special_defense, speed, total, is_legendary, is_mythical, is_fully_evolved, sprite_normal_url, sprite_shiny_url, roles, evolution_chain_id, form_kind, base_slug, pokedex_display_no, list_sort_rank",
    )
    .limit(1);

  pokemonRequest = Number.isInteger(numericId) && numericId > 0
    ? pokemonRequest.eq("id", numericId)
    : pokemonRequest.eq("slug", normalized);

  const { data: pokemonRows, error: pokemonError } = await pokemonRequest;

  if (pokemonError) {
    console.error("[Pokemon Supabase Detail]", pokemonError);
    return null;
  }

  const row = (pokemonRows as PokemonRow[] | null)?.[0];
  if (!row) {
    return null;
  }

  const [{ data: abilityRows, error: abilityError }, { data: moveRows, error: moveError }] =
    await Promise.all([
      supabase
        .from("pokemon_abilities")
        .select("slot, is_hidden, abilities(id, slug, name, description)")
        .eq("pokemon_id", row.id)
        .order("slot", { ascending: true }),
      supabase
        .from("pokemon_moves")
        .select("moves(id, slug, name, type, category, power, accuracy, pp, priority, description, tags)")
        .eq("pokemon_id", row.id),
    ]);

  if (abilityError || moveError) {
    console.error("[Pokemon Supabase Joins]", abilityError ?? moveError);
    return null;
  }

  const abilityJoinEntries = ((abilityRows ?? []) as PokemonAbilityJoinRow[])
    .map((entry) => {
      const ability = relatedOne(entry.abilities);
      return ability ? { ability, isHidden: entry.is_hidden } : null;
    })
    .filter((entry): entry is { ability: AbilityRow; isHidden: boolean } => Boolean(entry));

  const abilityEffects = await Promise.all(
    abilityJoinEntries.map((entry) => getAbilityEffectText(entry.ability.slug)),
  );
  const abilities = abilityJoinEntries.map((entry, index) =>
    toAbility(entry.ability, entry.isHidden, abilityEffects[index]),
  );

  const moves = ((moveRows ?? []) as PokemonMoveJoinRow[])
    .map((entry) => relatedOne(entry.moves))
    .filter((entry): entry is MoveRow => Boolean(entry))
    .map(toMove)
    .sort((a, b) => a.name.localeCompare(b.name));

  const [evolutionChain, alternateForms] = await Promise.all([
    row.evolution_chain_id ? loadEvolutionChainFromSupabase(row.evolution_chain_id) : Promise.resolve(undefined),
    loadAlternateFormsForPokemon(supabase, row),
  ]);

  const formKind = resolveFormKindFromRow(row);
  const pokedexDisplayNo = row.pokedex_display_no ?? row.id;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    generation: row.generation,
    region: row.region,
    primaryType: row.primary_type,
    secondaryType: row.secondary_type,
    formKind,
    baseSlug: row.base_slug ?? null,
    pokedexDisplayNo,
    stats: {
      hp: row.hp,
      attack: row.attack,
      defense: row.defense,
      specialAttack: row.special_attack,
      specialDefense: row.special_defense,
      speed: row.speed,
      total: row.total,
    },
    spriteNormal: row.sprite_normal_url ?? "",
    spriteShiny: row.sprite_shiny_url,
    isLegendaryOrMythical: row.is_legendary || row.is_mythical,
    isFullyEvolved: row.is_fully_evolved,
    abilities,
    moves,
    roles: row.roles ?? [],
    typeDefense: buildTypeDefenseEntries(row.primary_type, row.secondary_type),
    evolutionChain,
    alternateForms: alternateForms.length > 0 ? alternateForms : undefined,
    alternateFormsByKind:
      alternateForms.length > 0 ? groupAlternateFormsByKind(alternateForms) : undefined,
  };
}

async function getRecommendationCandidateAbilities(
  pokemonIds: number[],
): Promise<Map<number, Ability[]>> {
  const supabase = getSupabaseServerClient();
  const abilitiesByPokemonId = new Map<number, Ability[]>();

  for (const chunk of chunkArray(pokemonIds, 400)) {
    const { data, error } = await supabase
      .from("pokemon_abilities")
      .select("pokemon_id, slot, is_hidden, abilities(id, slug, name, description)")
      .in("pokemon_id", chunk)
      .order("slot", { ascending: true });

    if (error) {
      console.error("[Pokemon Supabase Recommendation Abilities]", error);
      return abilitiesByPokemonId;
    }

    ((data ?? []) as PokemonAbilityCandidateJoinRow[]).forEach((entry) => {
      const ability = relatedOne(entry.abilities);
      if (!ability) {
        return;
      }

      const existing = abilitiesByPokemonId.get(entry.pokemon_id) ?? [];
      existing.push(toAbility(ability, entry.is_hidden));
      abilitiesByPokemonId.set(entry.pokemon_id, existing);
    });
  }

  return abilitiesByPokemonId;
}

export async function getPokemonRecommendationPool(): Promise<Pokemon[]> {
  const now = Date.now();
  if (recommendationPoolCache && recommendationPoolCache.expiresAt > now) {
    return recommendationPoolCache.data;
  }

  if (!hasSupabaseServerEnv()) {
    return [];
  }

  const supabase = getSupabaseServerClient();
  const allowedPreEvolutions = Array.from(RECOMMENDATION_ALLOWED_PRE_EVOLUTION_SET);
  const { data, error } = await supabase
    .from("pokemon")
    .select(
      "id, slug, name, generation, region, primary_type, secondary_type, hp, attack, defense, special_attack, special_defense, speed, total, is_legendary, is_mythical, is_fully_evolved, sprite_normal_url, sprite_shiny_url, roles",
    )
    .or(`is_fully_evolved.eq.true,slug.in.(${allowedPreEvolutions.join(",")})`)
    .order("id", { ascending: true })
    .limit(RECOMMENDATION_POOL_LIMIT);

  if (error || !data || data.length === 0) {
    if (error) {
      console.error("[Pokemon Supabase Recommendation Pool]", error);
    }
    return [];
  }

  const pokemonRows = data as PokemonRow[];
  const pokemonIds = pokemonRows.map((row) => row.id);
  const abilitiesByPokemonId = await getRecommendationCandidateAbilities(pokemonIds);

  const pool = pokemonRows.map((row) =>
    toPokemonRecommendationCandidate(
      row,
      abilitiesByPokemonId.get(row.id) ?? [],
    ),
  );

  recommendationPoolCache = {
    expiresAt: now + RECOMMENDATION_POOL_CACHE_TTL_MS,
    data: pool,
  };

  return pool;
}

export async function getPokemonList(query: PokemonListQuery): Promise<PokemonListPayload> {
  const page = clampPagination(query.page, 1, 10_000);
  const limit = clampPagination(query.limit, 24, 100);

  const sortBy = query.sortBy ?? "id";
  const sortDirection = query.sortDirection ?? "asc";

  if (typeof query.generation === "number" && (!Number.isInteger(query.generation) || query.generation < 1 || query.generation > 9)) {
    return {
      pokemon: [],
      total: 0,
      page,
      limit,
    };
  }

  const supabasePayload = await getPokemonListFromSupabase(
    query,
    page,
    limit,
    sortBy,
    sortDirection,
  );
  if (supabasePayload) {
    return supabasePayload;
  }

  const index = await ensurePokemonIndex();
  const typeSet = query.type ? await ensureTypeSlugSet(query.type) : null;
  const abilitySet = query.ability ? await ensureAbilitySlugSet(query.ability) : null;
  const generationSpeciesNames =
    typeof query.generation === "number" ? await ensureGenerationSpeciesNames(query.generation) : null;

  const matchingRefs = index.filter((ref) => {
    if (typeSet && !typeSet.has(ref.name)) {
      return false;
    }

    if (abilitySet && !abilitySet.has(ref.name)) {
      return false;
    }

    if (generationSpeciesNames && !slugMatchesGeneration(ref.name, generationSpeciesNames)) {
      return false;
    }

    if (!matchesSearch(ref.name, query.search)) {
      return false;
    }

    return true;
  });

  const total = matchingRefs.length;
  const start = (page - 1) * limit;

  if (sortKeyNeedsStatHydration(sortBy)) {
    let hydratedAll = await hydratePokemonListItemsWithConcurrency(
      matchingRefs.map((ref) => ref.name),
      12,
    );
    if (query.hideAlternateForms) {
      hydratedAll = hydratedAll.filter((entry) => entry.formKind === "default");
    }
    hydratedAll.sort((a, b) => comparePokemonListItems(a, b, sortBy, sortDirection));

    return {
      pokemon: hydratedAll.slice(start, start + limit),
      total,
      page,
      limit,
    };
  }

  const orderedRefs = [...matchingRefs].sort((a, b) => comparePokemonRefs(a, b, sortBy, sortDirection));
  const pageSlugs = orderedRefs.slice(start, start + limit).map((ref) => ref.name);

  const hydrated = await Promise.all(pageSlugs.map((slug) => hydratePokemonListItem(slug)));
  let pokemon = hydrated.filter((entry): entry is PokemonListItem => Boolean(entry));

  if (query.hideAlternateForms) {
    pokemon = pokemon.filter((entry) => entry.formKind === "default");
  }

  return {
    pokemon,
    total,
    page,
    limit,
  };
}

export async function getPokemonByName(pokemonName: string): Promise<PokemonDetail | null> {
  const slug = normalizePokemonName(pokemonName);

  if (!slug) {
    return null;
  }

  const cached = pokemonDetailCache.get(slug);
  if (cached) {
    return cached;
  }

  const supabasePokemon = await getPokemonDetailFromSupabase(slug);
  if (supabasePokemon) {
    pokemonDetailCache.set(slug, supabasePokemon);
    pokemonDetailCache.set(supabasePokemon.slug, supabasePokemon);
    return supabasePokemon;
  }

  let rawPokemon: PokeApiPokemonResponse;
  let rawSpecies: PokeApiSpeciesResponse;

  try {
    rawPokemon = await pokeApiFetchWithRetry<PokeApiPokemonResponse>(`/pokemon/${slug}`);
    rawSpecies = await pokeApiFetchWithRetry<PokeApiSpeciesResponse>(
      `/pokemon-species/${rawPokemon.species.name}`,
    );
  } catch {
    return null;
  }

  const abilityResults = await Promise.allSettled(
    rawPokemon.abilities.map((entry) =>
      pokeApiFetchWithRetry<PokeApiAbilityResponse>(`/ability/${entry.ability.name}`, 2),
    ),
  );
  const abilityDetails = abilityResults
    .filter(
      (result): result is PromiseFulfilledResult<PokeApiAbilityResponse> =>
        result.status === "fulfilled",
    )
    .map((result) => result.value);

  const moveNames = rawPokemon.moves
    .map((entry) => entry.move.name)
    .slice(0, MAX_MOVES_PER_POKEMON);

  const moveResults = await Promise.allSettled(
    moveNames.map((moveName) => pokeApiFetchWithRetry<PokeApiMoveResponse>(`/move/${moveName}`, 2)),
  );
  const moveDetails = moveResults
    .filter(
      (result): result is PromiseFulfilledResult<PokeApiMoveResponse> =>
        result.status === "fulfilled",
    )
    .map((result) => result.value);

  const normalized = normalizePokeApiPokemonDetail({
    pokemon: rawPokemon,
    species: rawSpecies,
    abilityDetails,
    moveDetails,
  });

  const evolutionChain = await fetchEvolutionChainFromPokeApi(rawSpecies);
  const formFields = buildListFormFields(slug, normalized.id);
  const detail: PokemonDetail = {
    ...normalized,
    formKind: formFields.formKind,
    baseSlug: formFields.baseSlug,
    pokedexDisplayNo: formFields.pokedexDisplayNo,
    evolutionChain,
    typeDefense:
      normalized.typeDefense ??
      buildTypeDefenseEntries(normalized.primaryType, normalized.secondaryType),
  };

  pokemonDetailCache.set(slug, detail);
  pokemonDetailCache.set(detail.slug, detail);
  return detail;
}
