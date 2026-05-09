import { getStrategyTeams } from "@/lib/services/strategy-service";
import type { DifficultyLevel } from "@/types/shared";
import type { StrategyTeam, StrategyType } from "@/types/strategy";
import { errorResponse, successResponse } from "@/lib/api/responses";

const VALID_STRATEGY_TYPES: StrategyType[] = [
  "rain",
  "sun",
  "sand",
  "snow",
  "trick_room",
  "tailwind",
  "bulky_offense",
  "balance",
  "hyper_offense",
  "stall",
  "semi_stall",
  "hazard_stack",
  "screens",
  "baton_pass",
  "voltturn",
  "webs",
  "terrain",
  "weatherless_offense",
  "setup_spam",
  "perish_trap",
  "sunroom",
  "rainroom",
  "sand_balance",
  "snow_veil",
  "toxic_stall",
  "status_spam",
  "priority_spam",
  "beatup_justified",
  "psyspam",
  "dozogiri",
  "monotype",
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

  try {
    const data = await getStrategyTeams({ strategyType, format, difficulty });
    return successResponse<StrategyTeam[]>(data);
  } catch (error) {
    console.error("[Strategies API]", error);
    return errorResponse<StrategyTeam[]>(
      "SERVER_ERROR",
      "Unable to load strategy teams right now. Please try again.",
      500,
    );
  }
}
