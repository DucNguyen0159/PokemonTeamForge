import { getPokemonSummariesBySlugs } from "@/lib/services/pokemon-service";
import { POKEMON_SUMMARIES_BATCH_MAX } from "@/lib/pokemon/query-keys";
import { errorResponse, successResponse } from "@/lib/api/responses";
import type { PokemonSummariesPayload } from "@/types/api";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const slugsParam = url.searchParams.get("slugs") ?? "";
    const slugs = slugsParam
      .split(",")
      .map((slug) => slug.trim())
      .filter(Boolean);

    if (slugs.length === 0) {
      return errorResponse<PokemonSummariesPayload>(
        "INVALID_REQUEST",
        "Provide a comma-separated slugs query parameter.",
        400,
      );
    }

    if (slugs.length > POKEMON_SUMMARIES_BATCH_MAX) {
      return errorResponse<PokemonSummariesPayload>(
        "BATCH_TOO_LARGE",
        `Maximum ${POKEMON_SUMMARIES_BATCH_MAX} slugs per request.`,
        400,
      );
    }

    const data = await getPokemonSummariesBySlugs(slugs);
    return successResponse(data);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Batch size exceeds")) {
      return errorResponse<PokemonSummariesPayload>("BATCH_TOO_LARGE", error.message, 400);
    }

    console.error("[Champions Pokemon Summaries API]", error);
    return errorResponse<PokemonSummariesPayload>(
      "SERVER_ERROR",
      "Unable to load Pokémon summaries right now. Please try again.",
      500,
    );
  }
}
