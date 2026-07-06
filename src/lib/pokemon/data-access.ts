import type { PokemonListSortDirection, PokemonListSortKey } from "@/constants/pokemon-list-sort";
import type { PokemonListPayload, PokemonSummariesPayload } from "@/types/api";
import type { PokemonDetail } from "@/types/pokemon";

type PokemonListQuery = {
  search?: string;
  generation?: number;
  type?: string;
  ability?: string;
  page?: number;
  limit?: number;
  sortBy?: PokemonListSortKey;
  sortDirection?: PokemonListSortDirection;
  anchorSlug?: string;
};

type ApiPayload<T> = {
  success: boolean;
  data?: T;
  error?: { message?: string };
};

export function buildPokemonListSearchParams(query: PokemonListQuery): URLSearchParams {
  const params = new URLSearchParams();

  if (query.search && query.search.trim()) {
    params.set("search", query.search.trim());
  }
  if (typeof query.generation === "number") {
    params.set("generation", String(query.generation));
  }
  if (query.type) {
    params.set("type", query.type);
  }
  if (query.ability) {
    params.set("ability", query.ability);
  }
  if (typeof query.page === "number") {
    params.set("page", String(query.page));
  }
  if (typeof query.limit === "number") {
    params.set("limit", String(query.limit));
  }
  if (query.sortBy) {
    params.set("sortBy", query.sortBy);
  }
  if (query.sortDirection) {
    params.set("sortDirection", query.sortDirection);
  }
  if (query.anchorSlug) {
    params.set("anchorSlug", query.anchorSlug);
  }

  return params;
}

export async function fetchPokemonListFromApi(query: PokemonListQuery): Promise<PokemonListPayload> {
  let response: Response;
  try {
    const params = buildPokemonListSearchParams(query);
    response = await fetch(`/api/pokemon?${params.toString()}`);
  } catch {
    throw new Error("You seem to be offline. Please check your connection.");
  }

  let payload: ApiPayload<PokemonListPayload> | null = null;
  try {
    payload = (await response.json()) as ApiPayload<PokemonListPayload>;
  } catch {
    throw new Error("Pokémon data is temporarily unavailable. Please try again.");
  }

  if (!response.ok || !payload?.success || !payload.data) {
    throw new Error(payload?.error?.message ?? "Unable to load Pokémon right now.");
  }

  return payload.data;
}

export function buildPokemonSummariesSearchParams(slugs: string[]): URLSearchParams {
  const params = new URLSearchParams();
  params.set("slugs", slugs.join(","));
  return params;
}

export async function fetchPokemonSummariesFromApi(
  slugs: string[],
): Promise<PokemonSummariesPayload> {
  const uniqueSlugs = [...new Set(slugs.map((slug) => slug.trim()).filter(Boolean))];
  if (uniqueSlugs.length === 0) {
    return { summaries: [], missingSlugs: [] };
  }

  let response: Response;
  try {
    const params = buildPokemonSummariesSearchParams(uniqueSlugs);
    response = await fetch(`/api/champions/pokemon-summaries?${params.toString()}`);
  } catch {
    throw new Error("You seem to be offline. Please check your connection.");
  }

  let payload: ApiPayload<PokemonSummariesPayload> | null = null;
  try {
    payload = (await response.json()) as ApiPayload<PokemonSummariesPayload>;
  } catch {
    throw new Error("Pokémon summaries are temporarily unavailable.");
  }

  if (!response.ok || !payload?.success || !payload.data) {
    throw new Error(payload?.error?.message ?? "Could not load Pokémon summaries.");
  }

  return payload.data;
}

export async function fetchPokemonDetailFromApi(slug: string): Promise<PokemonDetail> {
  let response: Response;
  try {
    response = await fetch(`/api/pokemon/${encodeURIComponent(slug)}`);
  } catch {
    throw new Error("You seem to be offline. Please check your connection.");
  }

  let payload: ApiPayload<PokemonDetail> | null = null;
  try {
    payload = (await response.json()) as ApiPayload<PokemonDetail>;
  } catch {
    throw new Error("Pokémon details are temporarily unavailable.");
  }

  if (!response.ok || !payload?.success || !payload.data) {
    throw new Error(payload?.error?.message ?? "Could not load that Pokémon.");
  }

  return payload.data;
}
