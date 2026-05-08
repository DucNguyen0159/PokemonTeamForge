import type { BattleFormat } from "./shared";

export interface SavedTeamSummary {
  id: string;
  name: string;
  format: BattleFormat;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}
