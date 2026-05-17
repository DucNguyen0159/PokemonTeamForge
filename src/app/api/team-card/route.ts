import {
  TEAM_CARD_EXPORT_PRESETS,
  TEAM_CARD_LAYOUT_PRESETS,
  TEAM_CARD_STYLE_PRESETS,
} from "@/data/team-card-presets";
import { successResponse } from "@/lib/api/responses";

export async function GET() {
  return successResponse({
    schemaVersion: 1,
    storage: {
      supported: false,
      plannedShape: "TeamCardDesignSnapshot",
    },
    export: {
      mode: "browser",
      formats: ["png"],
      presets: TEAM_CARD_EXPORT_PRESETS,
    },
    presets: {
      styles: TEAM_CARD_STYLE_PRESETS,
      layouts: TEAM_CARD_LAYOUT_PRESETS,
    },
  });
}
