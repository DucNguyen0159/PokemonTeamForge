import "server-only";

import { STRATEGY_TEAMS } from "@/data/strategy-teams";
import type { DifficultyLevel } from "@/types/shared";
import type { StrategyTeam, StrategyType } from "@/types/strategy";

export interface StrategyQuery {
  strategyType?: StrategyType;
  format?: StrategyTeam["format"];
  difficulty?: DifficultyLevel;
}

export async function getStrategyTeams(query: StrategyQuery = {}): Promise<StrategyTeam[]> {
  return STRATEGY_TEAMS.filter((strategy) => {
    if (query.strategyType && strategy.strategyType !== query.strategyType) {
      return false;
    }

    if (query.format && strategy.format !== query.format) {
      return false;
    }

    if (query.difficulty && strategy.difficulty !== query.difficulty) {
      return false;
    }

    return true;
  });
}

