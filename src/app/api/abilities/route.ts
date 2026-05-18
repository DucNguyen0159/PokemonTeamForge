import type { AbilityListPayload } from "@/types/api";
import { getAbilities } from "@/lib/services/ability-service";
import { ABILITY_TAG_DEFINITION_BY_ID } from "@/data/ability-tags";
import { errorResponse, successResponse } from "@/lib/api/responses";
import type { AbilityTag } from "@/types/ability";

function parseNumberQuery(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseAbilityTag(value: string | null): AbilityTag | undefined {
  if (!value) return undefined;
  return ABILITY_TAG_DEFINITION_BY_ID.has(value as AbilityTag)
    ? (value as AbilityTag)
    : undefined;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  try {
    const data = await getAbilities({
      search: searchParams.get("search") ?? undefined,
      tag: parseAbilityTag(searchParams.get("tag")),
      limit: parseNumberQuery(searchParams.get("limit")),
    });

    return successResponse<AbilityListPayload>(data);
  } catch (error) {
    console.error("[Abilities API]", error);
    return errorResponse<AbilityListPayload>(
      "SERVER_ERROR",
      "Unable to load abilities right now. Please try again.",
      500,
    );
  }
}
