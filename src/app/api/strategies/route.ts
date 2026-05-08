import { NextResponse } from "next/server";
import { getStrategyTeams } from "@/lib/services/strategy-service";
import type { ApiResponse } from "@/types/api";
import type { DifficultyLevel } from "@/types/shared";
import type { StrategyTeam, StrategyType } from "@/types/strategy";

const VALID_STRATEGY_TYPES: StrategyType[] = [
  "rain",
  "sun",
  "trick_room",
  "tailwind",
  "balance",
  "hyper_offense",
  "stall",
  "monotype",
  "sand",
  "snow",
  "bulky_offense",
  "intimidate_core",
  "trap",
];

const VALID_FORMATS: StrategyTeam["format"][] = ["singles", "doubles", "triples"];
const VALID_DIFFICULTIES: DifficultyLevel[] = ["beginner", "intermediate", "advanced"];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const strategyTypeParam = searchParams.get("strategyType");
  const formatParam = searchParams.get("format");
  const difficultyParam = searchParams.get("difficulty");

  const strategyType =
    strategyTypeParam && VALID_STRATEGY_TYPES.includes(strategyTypeParam as StrategyType)
      ? (strategyTypeParam as StrategyType)
      : undefined;
  const format =
    formatParam && VALID_FORMATS.includes(formatParam as StrategyTeam["format"])
      ? (formatParam as StrategyTeam["format"])
      : undefined;
  const difficulty =
    difficultyParam && VALID_DIFFICULTIES.includes(difficultyParam as DifficultyLevel)
      ? (difficultyParam as DifficultyLevel)
      : undefined;

  const data = await getStrategyTeams({ strategyType, format, difficulty });

  return NextResponse.json<ApiResponse<StrategyTeam[]>>({
    success: true,
    data,
  });
}
