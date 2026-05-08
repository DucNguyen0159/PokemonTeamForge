import { ALL_POKEMON_TYPES } from "@/data/type-chart";
import type { PokemonType } from "@/types/shared";
import type { PokemonListPayload } from "@/types/api";
import { getPokemonList } from "@/lib/services/pokemon-service";
import { errorResponse, successResponse } from "@/lib/api/responses";

function parseBooleanQuery(value: string | null): boolean | undefined {
  if (value === null) {
    return undefined;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return undefined;
}

function parseNumberQuery(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const rawType = searchParams.get("type");
  const type =
    rawType && ALL_POKEMON_TYPES.includes(rawType as PokemonType)
      ? (rawType as PokemonType)
      : undefined;
  const query = {
    search: searchParams.get("search") ?? undefined,
    generation: parseNumberQuery(searchParams.get("generation")),
    type,
    region: searchParams.get("region") ?? undefined,
    legendary: parseBooleanQuery(searchParams.get("legendary")),
    page: parseNumberQuery(searchParams.get("page")),
    limit: parseNumberQuery(searchParams.get("limit")),
  };

  try {
    const data = await getPokemonList(query);
    return successResponse<PokemonListPayload>(data);
  } catch (error) {
    console.error("[Pokemon List API]", error);
    return errorResponse<PokemonListPayload>(
      "SERVER_ERROR",
      "Unable to load Pokemon right now. Please try again.",
      500,
    );
  }
}
