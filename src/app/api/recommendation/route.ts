import { NextResponse } from "next/server";
import { generateRecommendations } from "@/lib/recommendation";
import type { ApiResponse } from "@/types/api";
import type { RecommendationRequest, RecommendationResponse } from "@/types/recommendation";

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
    return NextResponse.json<ApiResponse<RecommendationResponse>>(
      {
        success: false,
        error: {
          code: "INVALID_JSON",
          message: "Request body must be valid JSON.",
        },
      },
      { status: 400 },
    );
  }

  if (!isRecommendationRequest(body)) {
    return NextResponse.json<ApiResponse<RecommendationResponse>>(
      {
        success: false,
        error: {
          code: "INVALID_RECOMMENDATION_REQUEST",
          message: "Body must include team and filters.",
        },
      },
      { status: 400 },
    );
  }

  const data = generateRecommendations(body);
  return NextResponse.json<ApiResponse<RecommendationResponse>>({
    success: true,
    data,
  });
}
