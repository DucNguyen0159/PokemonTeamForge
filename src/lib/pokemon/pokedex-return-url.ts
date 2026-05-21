import {
  isPokemonListSortKey,
  type PokemonListSortDirection,
  type PokemonListSortKey,
} from "@/constants/pokemon-list-sort";
import type { PokemonType } from "@/types/shared";

export const POKEDEX_RETURN_HREF_KEY = "pokedex-return-href";
export const MAX_POKEDEX_RETURN_QUERY_LENGTH = 1200;

export type PokedexViewMode = "cards" | "table";

export type PokedexExplorerReturnState = {
  view?: PokedexViewMode;
  q?: string;
  sortBy?: PokemonListSortKey;
  sortDirection?: PokemonListSortDirection;
  generation?: number;
  type?: PokemonType;
  ability?: string;
};

type SearchParamSource = {
  get: (key: string) => string | null;
};

const POKEMON_TYPES = new Set<string>([
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
]);

function safeAbilitySlug(value: string): string {
  const slug = value.trim().toLowerCase();
  return /^[a-z0-9-]+$/.test(slug) ? slug : "";
}

function safeViewMode(value: string): PokedexViewMode | undefined {
  return value === "cards" || value === "table" ? value : undefined;
}

function safePokemonType(value: string): PokemonType | undefined {
  const normalized = value.trim().toLowerCase();
  return POKEMON_TYPES.has(normalized) ? (normalized as PokemonType) : undefined;
}

function safeGeneration(value: string): number | undefined {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 9) {
    return undefined;
  }

  return parsed;
}

function readParam(source: SearchParamSource, key: string): string {
  return source.get(key)?.trim() ?? "";
}

export function hasPokedexReturnFilters(state: PokedexExplorerReturnState): boolean {
  return Boolean(
    state.q ||
      state.type ||
      state.ability ||
      state.generation ||
      (state.view && state.view !== "cards") ||
      (state.sortBy && state.sortBy !== "id") ||
      (state.sortDirection && state.sortDirection !== "asc"),
  );
}

export function appendPokedexReturnState(
  params: URLSearchParams,
  state: PokedexExplorerReturnState,
): void {
  if (state.view && state.view !== "cards") {
    params.set("view", state.view);
  }

  if (state.q) {
    params.set("q", state.q);
  }

  if (state.sortBy && state.sortBy !== "id") {
    params.set("sort", state.sortBy);
  }

  if (state.sortDirection && state.sortDirection !== "asc") {
    params.set("dir", state.sortDirection);
  }

  if (state.generation) {
    params.set("gen", String(state.generation));
  }

  if (state.type) {
    params.set("type", state.type);
  }

  if (state.ability) {
    params.set("ability", state.ability);
  }
}

export function buildPokedexHref(state: PokedexExplorerReturnState = {}): string {
  const params = new URLSearchParams();
  appendPokedexReturnState(params, state);
  const query = params.toString();
  return query ? `/pokedex?${query}` : "/pokedex";
}

export function parsePokedexReturnState(
  source: SearchParamSource | Record<string, string | string[] | null | undefined>,
): PokedexExplorerReturnState {
  const read = (key: string): string => {
    if ("get" in source && typeof source.get === "function") {
      return readParam(source as SearchParamSource, key);
    }

    const record = source as Record<string, string | string[] | null | undefined>;
    const value = record[key];
    return Array.isArray(value) ? value[0]?.trim() ?? "" : value?.trim() ?? "";
  };

  const state: PokedexExplorerReturnState = {};
  const view = safeViewMode(read("view"));
  const q = read("q");
  const sortByRaw = read("sort");
  const sortDirectionRaw = read("dir");
  const generation = safeGeneration(read("gen"));
  const type = safePokemonType(read("type"));
  const ability = safeAbilitySlug(read("ability"));

  if (view) {
    state.view = view;
  }

  if (q) {
    state.q = q;
  }

  if (sortByRaw && isPokemonListSortKey(sortByRaw)) {
    state.sortBy = sortByRaw;
  }

  if (sortDirectionRaw === "asc" || sortDirectionRaw === "desc") {
    state.sortDirection = sortDirectionRaw;
  }

  if (generation) {
    state.generation = generation;
  }

  if (type) {
    state.type = type;
  }

  if (ability) {
    state.ability = ability;
  }

  return state;
}

export function buildPokemonDetailHref(
  slug: string,
  state: PokedexExplorerReturnState,
): {
  href: string;
  returnHref: string;
  storeReturnHrefInSession: boolean;
} {
  const returnHref = buildPokedexHref(state);
  const params = new URLSearchParams({ from: "pokedex" });
  appendPokedexReturnState(params, state);

  const encodedSlug = encodeURIComponent(slug);
  const queryString = params.toString();
  const href = `/pokemon/${encodedSlug}?${queryString}`;

  if (href.length > MAX_POKEDEX_RETURN_QUERY_LENGTH) {
    return {
      href: `/pokemon/${encodedSlug}?from=pokedex&pokedexReturn=stored`,
      returnHref,
      storeReturnHrefInSession: true,
    };
  }

  return {
    href,
    returnHref,
    storeReturnHrefInSession: false,
  };
}

export function isPokedexReturnStored(
  source: SearchParamSource | Record<string, string | string[] | null | undefined>,
): boolean {
  const read = (key: string): string => {
    if ("get" in source && typeof source.get === "function") {
      return readParam(source as SearchParamSource, key);
    }

    const record = source as Record<string, string | string[] | null | undefined>;
    const value = record[key];
    return Array.isArray(value) ? value[0]?.trim() ?? "" : value?.trim() ?? "";
  };

  return read("pokedexReturn") === "stored";
}

export function resolvePokedexReturnHref(
  source: SearchParamSource | Record<string, string | string[] | null | undefined>,
): string {
  if (isPokedexReturnStored(source)) {
    return "/pokedex";
  }

  return buildPokedexHref(parsePokedexReturnState(source));
}

export function storePokedexReturnHref(href: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(POKEDEX_RETURN_HREF_KEY, href);
}

export function readStoredPokedexReturnHref(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage.getItem(POKEDEX_RETURN_HREF_KEY);
}
