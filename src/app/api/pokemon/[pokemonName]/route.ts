import type { PokemonDetail } from "@/types/pokemon";
import { getPokemonByName } from "@/lib/services/pokemon-service";
import { errorResponse, successResponse } from "@/lib/api/responses";

interface PokemonRouteParams {
  params: Promise<{
    pokemonName: string;
  }>;
}

export async function GET(_: Request, { params }: PokemonRouteParams) {
  try {
    const { pokemonName } = await params;
    const pokemon = await getPokemonByName(pokemonName);

    if (!pokemon) {
      return errorResponse<PokemonDetail>(
        "POKEMON_NOT_FOUND",
        `Pokémon '${pokemonName}' was not found.`,
        404,
      );
    }

    return successResponse<PokemonDetail>(pokemon);
  } catch (error) {
    console.error("[Pokemon Detail API]", error);
    return errorResponse<PokemonDetail>(
      "SERVER_ERROR",
      "Unable to load this Pokémon right now. Please try again.",
      500,
    );
  }
}
