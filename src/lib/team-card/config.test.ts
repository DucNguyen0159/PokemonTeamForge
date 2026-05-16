import { describe, expect, it } from "vitest";

import {
  clampTeamCardTrainerName,
  createDefaultTeamCardConfig,
  deserializeTeamCardConfig,
  normalizeTeamCardConfig,
  serializeTeamCardConfig,
} from "@/lib/team-card/config";
import { TEAM_CARD_TRAINER_NAME_MAX_LENGTH } from "@/types/team-card";

describe("team-card config", () => {
  it("truncates long trainer names to the card limit", () => {
    const long = "a".repeat(TEAM_CARD_TRAINER_NAME_MAX_LENGTH + 10);
    expect(clampTeamCardTrainerName(long).length).toBe(TEAM_CARD_TRAINER_NAME_MAX_LENGTH);

    const normalized = normalizeTeamCardConfig(
      { trainerName: long, backgroundSlug: "midnight-grid", trainerVariantSlug: "rei-academy" },
      createDefaultTeamCardConfig(),
    );
    expect(normalized.trainerName.length).toBe(TEAM_CARD_TRAINER_NAME_MAX_LENGTH);
  });

  it("creates a stable default config", () => {
    const config = createDefaultTeamCardConfig("Rain Tempo");
    expect(config.trainerName).toBe("Rain Tempo");
    expect(config.slotCustomizations).toHaveLength(6);
    expect(config.detailRows).toHaveLength(1);
  });

  it("normalizes invalid persisted data safely", () => {
    const fallback = createDefaultTeamCardConfig("Trainer");
    const normalized = normalizeTeamCardConfig(
      {
        backgroundSlug: "unknown",
        trainerVariantSlug: "none",
        trainerName: "",
        globalSpriteMode: "invalid",
        detailRows: [{ id: "detail-1", iconSlug: "missing", text: "" }],
        slotCustomizations: [{ slot: 1, formSlug: "bad", iconSlug: "bad", spriteMode: "shiny" }],
      },
      fallback,
    );

    expect(normalized.backgroundSlug).toBe(fallback.backgroundSlug);
    expect(normalized.trainerVariantSlug).toBe(fallback.trainerVariantSlug);
    expect(normalized.globalSpriteMode).toBe("normal");
    expect(normalized.slotCustomizations[0].spriteMode).toBe("shiny");
    expect(normalized.slotCustomizations[0].badgeSlug).toBe("none");
    expect(normalized.detailRows).toHaveLength(1);
    expect(normalized.detailRows[0].text).toBe(fallback.detailRows[0].text);
  });

  it("round-trips serialized payload", () => {
    const config = createDefaultTeamCardConfig("Champion");
    const encoded = serializeTeamCardConfig(config);
    const decoded = deserializeTeamCardConfig(encoded);
    expect(decoded).toEqual(config);
  });
});
