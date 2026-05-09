import type { PokemonDetail } from "@/types/pokemon";
import type { PokemonListPayload } from "@/types/api";

type PokemonListQuery = {
  search?: string;
  generation?: number;
  type?: string;
  page?: number;
  limit?: number;
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
  if (typeof query.page === "number") {
    params.set("page", String(query.page));
  }
  if (typeof query.limit === "number") {
    params.set("limit", String(query.limit));
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
    throw new Error("Pokemon data is temporarily unavailable. Please try again.");
  }

  if (!response.ok || !payload?.success || !payload.data) {
    throw new Error(payload?.error?.message ?? "Unable to load Pokemon right now.");
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
    throw new Error("Pokemon details are temporarily unavailable.");
  }

  if (!response.ok || !payload?.success || !payload.data) {
    throw new Error(payload?.error?.message ?? "Could not load that Pokemon.");
  }

  return payload.data;
}
