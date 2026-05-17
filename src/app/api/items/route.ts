import type { ItemListPayload } from "@/types/api";
import { getItems } from "@/lib/services/item-service";
import { errorResponse, successResponse } from "@/lib/api/responses";

function parseBooleanQuery(value: string | null): boolean | undefined {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

function parseNumberQuery(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  try {
    const data = await getItems({
      search: searchParams.get("search") ?? undefined,
      competitiveOnly: parseBooleanQuery(searchParams.get("competitiveOnly")),
      limit: parseNumberQuery(searchParams.get("limit")),
    });

    return successResponse<ItemListPayload>(data);
  } catch (error) {
    console.error("[Items API]", error);
    return errorResponse<ItemListPayload>(
      "SERVER_ERROR",
      "Unable to load items right now. Please try again.",
      500,
    );
  }
}
