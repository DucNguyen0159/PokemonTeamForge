import { describe, expect, it } from "vitest";

import {
  createDefaultTeamCardConfig,
  deserializeTeamCardConfig,
  normalizeTeamCardConfig,
  serializeTeamCardConfig,
} from "@/lib/team-card/config";

describe("team-card config", () => {
  it("creates a stable default config", () => {
    const config = createDefaultTeamCardConfig("Rain Tempo");
    expect(config.trainerName).toBe("Rain Tempo");
    expect(config.slotCustomizations).toHaveLength(6);
    expect(config.detailRows).toHaveLength(2);
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
    expect(normalized.slotCustomizations[0].formSlug).toBe("none");
    expect(normalized.slotCustomizations[0].iconSlug).toBe("none");
  });

  it("round-trips serialized payload", () => {
    const config = createDefaultTeamCardConfig("Champion");
    const encoded = serializeTeamCardConfig(config);
    const decoded = deserializeTeamCardConfig(encoded);
    expect(decoded).toEqual(config);
  });
});
