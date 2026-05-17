import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { PokemonListSortDirection, PokemonListSortKey } from "@/constants/pokemon-list-sort";
import type { PokemonListPayload } from "@/types/api";
import type { MoveCategory, PokemonType, TeamRole } from "@/types/shared";
import type { PokemonDetail, PokemonListItem } from "@/types/pokemon";
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
  sprite_normal_url: string | null;
  sprite_shiny_url: string | null;
  roles: TeamRole[] | null;
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

const pokemonDetailCache = new Map<string, PokemonDetail>();
const pokemonListItemCache = new Map<string, PokemonListItem>();

let pokemonIndexCache: PokemonRef[] | null = null;
let recommendationPoolCache: { expiresAt: number; data: PokemonDetail[] } | null = null;
const typeSlugCache = new Map<PokemonType, Set<string>>();
const generationSpeciesNamesCache = new Map<number, string[]>();
const RECOMMENDATION_POOL_CACHE_TTL_MS = 1000 * 60 * 15;
const RECOMMENDATION_POOL_LIMIT = 1200;

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

function toPokemonListItemFromRow(row: PokemonRow): PokemonListItem {
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
  };
}

function toAbility(row: AbilityRow, isHidden: boolean): Ability {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "No description available.",
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

export interface PokemonListQuery {
  search?: string;
  generation?: number;
  type?: PokemonType;
  region?: string;
  legendary?: boolean;
  page?: number;
  limit?: number;
  sortBy?: PokemonListSortKey;
  sortDirection?: PokemonListSortDirection;
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

async function hydratePokemonDetailsWithConcurrency(
  slugs: string[],
  concurrency: number,
): Promise<PokemonDetail[]> {
  const out: PokemonDetail[] = [];
  const size = Math.max(1, concurrency);

  for (let offset = 0; offset < slugs.length; offset += size) {
    const chunk = slugs.slice(offset, offset + size);
    const batch = await Promise.all(chunk.map((slug) => getPokemonDetailFromSupabase(slug)));
    out.push(...batch.filter((entry): entry is PokemonDetail => Boolean(entry)));
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
      cmp = a.id - b.id;
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

  let request = supabase
    .from("pokemon")
    .select(
      "id, slug, name, generation, region, primary_type, secondary_type, hp, attack, defense, special_attack, special_defense, speed, total, is_legendary, is_mythical, sprite_normal_url, sprite_shiny_url, roles",
      { count: "exact" },
    );

  if (typeof query.generation === "number") {
    request = request.eq("generation", query.generation);
  }

  if (query.type) {
    request = request.or(`primary_type.eq.${query.type},secondary_type.eq.${query.type}`);
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

  const { data, error, count } = await request
    .order(sortColumn, { ascending: sortDirection === "asc" })
    .order("id", { ascending: true })
    .range(start, end);

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
      "id, slug, name, generation, region, primary_type, secondary_type, hp, attack, defense, special_attack, special_defense, speed, total, is_legendary, is_mythical, sprite_normal_url, sprite_shiny_url, roles",
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

  const abilities = ((abilityRows ?? []) as PokemonAbilityJoinRow[])
    .map((entry) => {
      const ability = relatedOne(entry.abilities);
      return ability ? toAbility(ability, entry.is_hidden) : null;
    })
    .filter((entry): entry is Ability => Boolean(entry));

  const moves = ((moveRows ?? []) as PokemonMoveJoinRow[])
    .map((entry) => relatedOne(entry.moves))
    .filter((entry): entry is MoveRow => Boolean(entry))
    .map(toMove)
    .sort((a, b) => a.name.localeCompare(b.name));

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
    abilities,
    moves,
    roles: row.roles ?? [],
    typeDefense: buildTypeDefenseEntries(row.primary_type, row.secondary_type),
  };
}

export async function getPokemonRecommendationPool(): Promise<PokemonDetail[]> {
  const now = Date.now();
  if (recommendationPoolCache && recommendationPoolCache.expiresAt > now) {
    return recommendationPoolCache.data;
  }

  if (!hasSupabaseServerEnv()) {
    return [];
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("pokemon")
    .select("slug")
    .order("id", { ascending: true })
    .limit(RECOMMENDATION_POOL_LIMIT);

  if (error || !data || data.length === 0) {
    if (error) {
      console.error("[Pokemon Supabase Recommendation Pool]", error);
    }
    return [];
  }

  const slugs = (data as Array<{ slug: string }>).map((row) => row.slug);
  const pool = await hydratePokemonDetailsWithConcurrency(slugs, 12);

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
  if (supabasePayload && supabasePayload.total > 0) {
    return supabasePayload;
  }

  const index = await ensurePokemonIndex();
  const typeSet = query.type ? await ensureTypeSlugSet(query.type) : null;
  const generationSpeciesNames =
    typeof query.generation === "number" ? await ensureGenerationSpeciesNames(query.generation) : null;

  const matchingRefs = index.filter((ref) => {
    if (typeSet && !typeSet.has(ref.name)) {
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
    const hydratedAll = await hydratePokemonListItemsWithConcurrency(
      matchingRefs.map((ref) => ref.name),
      12,
    );
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

  const pokemon = hydrated.filter((entry): entry is PokemonListItem => Boolean(entry));

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

  pokemonDetailCache.set(slug, normalized);
  return normalized;
}
