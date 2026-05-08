import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types/api";
import type { PokemonDetail } from "@/types/pokemon";
import { getPokemonByName } from "@/lib/services/pokemon-service";

interface PokemonRouteParams {
  params: Promise<{
    pokemonName: string;
  }>;
}

export async function GET(_: Request, { params }: PokemonRouteParams) {
  const { pokemonName } = await params;
  const pokemon = await getPokemonByName(pokemonName);

  if (!pokemon) {
    return NextResponse.json<ApiResponse<PokemonDetail>>(
      {
        success: false,
        error: {
          code: "POKEMON_NOT_FOUND",
          message: `Pokemon '${pokemonName}' was not found.`,
        },
      },
      { status: 404 },
    );
  }

  return NextResponse.json<ApiResponse<PokemonDetail>>({
    success: true,
    data: pokemon,
  });
}
