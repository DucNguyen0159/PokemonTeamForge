import { generateRecommendationsFromSharedSource } from "@/lib/recommendation";
import type { RecommendationRequest, RecommendationResponse } from "@/types/recommendation";
import { errorResponse, successResponse } from "@/lib/api/responses";

function isRecommendationRequest(value: unknown): value is RecommendationRequest {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as RecommendationRequest;
  return Boolean(payload.team && payload.filters);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse<RecommendationResponse>(
      "INVALID_JSON",
      "Request body must be valid JSON.",
      400,
    );
  }

  if (!isRecommendationRequest(body)) {
    return errorResponse<RecommendationResponse>(
      "INVALID_RECOMMENDATION_REQUEST",
      "Body must include team and filters.",
      400,
    );
  }

  try {
    const data = await generateRecommendationsFromSharedSource(body);
    return successResponse<RecommendationResponse>(data);
  } catch (error) {
    console.error("[Recommendation API]", error);
    return errorResponse<RecommendationResponse>(
      "SERVER_ERROR",
      "Recommendations are temporarily unavailable. Please try again.",
      500,
    );
  }
}
