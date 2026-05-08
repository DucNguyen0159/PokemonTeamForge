import "server-only";

import { MOCK_POKEMON } from "@/data/mock-pokemon";
import type { PokemonListPayload } from "@/types/api";
import type { PokemonType } from "@/types/shared";
import type { PokemonDetail, PokemonListItem } from "@/types/pokemon";

import {
  buildTypeDefenseEntries,
  normalizePokeApiPokemonDetail,
  toPokemonListItem,
  type PokeApiAbilityResponse,
  type PokeApiMoveResponse,
  type PokeApiPokemonResponse,
  type PokeApiSpeciesResponse,
} from "@/lib/normalizers/normalize-pokemon";

const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";
const REVALIDATE_SECONDS = 60 * 60 * 24;
const MAX_MOVES_PER_POKEMON = 24;

const mockPokemonList: PokemonListItem[] = MOCK_POKEMON.map(toPokemonListItem);
const pokemonDetailCache = new Map<string, PokemonDetail>();

export interface PokemonListQuery {
  search?: string;
  generation?: number;
  type?: PokemonType;
  region?: string;
  legendary?: boolean;
  page?: number;
  limit?: number;
}

async function fetchPokeApiJson<T>(path: string): Promise<T> {
  const response = await fetch(`${POKEAPI_BASE_URL}${path}`, {
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`PokéAPI request failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
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

function filterPokemonList(baseList: PokemonListItem[], query: PokemonListQuery): PokemonListItem[] {
  const search = query.search?.trim().toLowerCase();
  const region = query.region?.trim().toLowerCase();

  return baseList.filter((pokemon) => {
    if (search && !pokemon.name.toLowerCase().includes(search)) {
      return false;
    }

    if (query.generation && pokemon.generation !== query.generation) {
      return false;
    }

    if (
      query.type &&
      pokemon.primaryType !== query.type &&
      pokemon.secondaryType !== query.type
    ) {
      return false;
    }

    if (region && pokemon.region.toLowerCase() !== region) {
      return false;
    }

    if (typeof query.legendary === "boolean" && pokemon.isLegendaryOrMythical !== query.legendary) {
      return false;
    }

    return true;
  });
}

function fallbackToMockDetail(pokemonName: string): PokemonDetail | null {
  const slug = normalizePokemonName(pokemonName);
  const mock = MOCK_POKEMON.find((pokemon) => pokemon.slug === slug);

  if (!mock) {
    return null;
  }

  return {
    ...mock,
    typeDefense: buildTypeDefenseEntries(mock.primaryType, mock.secondaryType ?? null),
  };
}

export async function getPokemonList(query: PokemonListQuery): Promise<PokemonListPayload> {
  const page = clampPagination(query.page, 1, 1000);
  const limit = clampPagination(query.limit, 30, 100);

  const filtered = filterPokemonList(mockPokemonList, query);
  const startIndex = (page - 1) * limit;
  const pokemon = filtered.slice(startIndex, startIndex + limit);

  return {
    pokemon,
    total: filtered.length,
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

  try {
    const rawPokemon = await fetchPokeApiJson<PokeApiPokemonResponse>(`/pokemon/${slug}`);
    const rawSpecies = await fetchPokeApiJson<PokeApiSpeciesResponse>(`/pokemon-species/${slug}`);

    const abilityDetails = await Promise.all(
      rawPokemon.abilities.map((entry) =>
        fetchPokeApiJson<PokeApiAbilityResponse>(`/ability/${entry.ability.name}`),
      ),
    );

    const moveNames = rawPokemon.moves
      .map((entry) => entry.move.name)
      .slice(0, MAX_MOVES_PER_POKEMON);

    const moveDetails = await Promise.all(
      moveNames.map((moveName) => fetchPokeApiJson<PokeApiMoveResponse>(`/move/${moveName}`)),
    );

    const normalized = normalizePokeApiPokemonDetail({
      pokemon: rawPokemon,
      species: rawSpecies,
      abilityDetails,
      moveDetails,
    });

    pokemonDetailCache.set(slug, normalized);
    return normalized;
  } catch {
    return fallbackToMockDetail(slug);
  }
}
