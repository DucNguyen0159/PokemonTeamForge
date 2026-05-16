import "server-only";

import type { PokemonListSortDirection, PokemonListSortKey } from "@/constants/pokemon-list-sort";
import type { PokemonListPayload } from "@/types/api";
import type { PokemonType } from "@/types/shared";
import type { PokemonDetail, PokemonListItem } from "@/types/pokemon";

import {
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

const pokemonDetailCache = new Map<string, PokemonDetail>();
const pokemonListItemCache = new Map<string, PokemonListItem>();

let pokemonIndexCache: PokemonRef[] | null = null;
const typeSlugCache = new Map<PokemonType, Set<string>>();
const generationSpeciesNamesCache = new Map<number, string[]>();

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
