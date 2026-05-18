import type { AbilityDetail } from "@/types/ability";
import { getAbilityBySlug } from "@/lib/services/ability-service";
import { errorResponse, successResponse } from "@/lib/api/responses";

interface AbilityRouteParams {
  params: Promise<{
    abilitySlug: string;
  }>;
}

export async function GET(_: Request, { params }: AbilityRouteParams) {
  try {
    const { abilitySlug } = await params;
    const ability = await getAbilityBySlug(abilitySlug);

    if (!ability) {
      return errorResponse<AbilityDetail>(
        "ABILITY_NOT_FOUND",
        `Ability '${abilitySlug}' was not found.`,
        404,
      );
    }

    return successResponse<AbilityDetail>(ability);
  } catch (error) {
    console.error("[Ability Detail API]", error);
    return errorResponse<AbilityDetail>(
      "SERVER_ERROR",
      "Unable to load this ability right now. Please try again.",
      500,
    );
  }
}
