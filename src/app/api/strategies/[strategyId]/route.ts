import { getStrategyTeamByIdOrSlug } from "@/lib/services/strategy-service";
import type { StrategyTeam } from "@/types/strategy";
import { errorResponse, successResponse } from "@/lib/api/responses";

interface StrategyRouteParams {
  params: Promise<{
    strategyId: string;
  }>;
}

export async function GET(_: Request, { params }: StrategyRouteParams) {
  try {
    const { strategyId } = await params;
    const strategy = await getStrategyTeamByIdOrSlug(strategyId);

    if (!strategy) {
      return errorResponse<StrategyTeam>(
        "STRATEGY_NOT_FOUND",
        `Strategy '${strategyId}' was not found.`,
        404,
      );
    }

    return successResponse<StrategyTeam>(strategy);
  } catch (error) {
    console.error("[Strategy Detail API]", error);
    return errorResponse<StrategyTeam>(
      "SERVER_ERROR",
      "Unable to load this strategy team right now. Please try again.",
      500,
    );
  }
}
