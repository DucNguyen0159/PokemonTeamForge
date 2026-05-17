import { describe, expect, it } from "vitest";

import {
  DEFAULT_TEAM_CARD_EXPORT_PRESET_ID,
  DEFAULT_TEAM_CARD_LAYOUT_PRESET_ID,
  DEFAULT_TEAM_CARD_STYLE_PRESET_ID,
  getTeamCardExportPreset,
  getTeamCardLayoutPreset,
  getTeamCardStylePreset,
  TEAM_CARD_STYLE_PRESETS,
} from "@/data/team-card-presets";
import {
  clampTeamCardTitle,
  clampTeamCardTrainerName,
  createDefaultTeamCardConfig,
  createTeamCardDesignSnapshot,
  defaultTeamCardTitle,
  deserializeTeamCardConfig,
  hydrateTeamCardConfigFromStorage,
  normalizeTeamCardConfig,
  serializeTeamCardConfig,
} from "@/lib/team-card/config";
import type { Team } from "@/types/team";
import { TEAM_CARD_TITLE_MAX_LENGTH, TEAM_CARD_TRAINER_NAME_MAX_LENGTH } from "@/types/team-card";

describe("team-card config", () => {
  it("truncates long trainer names to the card limit", () => {
    expect(TEAM_CARD_TRAINER_NAME_MAX_LENGTH).toBe(13);

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
    expect(config.cardTitle).toBe("Rain Tempo");
    expect(config.isCardTitleCustom).toBe(false);
    expect(config.trainerName).toBe("Rain Tempo");
    expect(config.slotCustomizations).toHaveLength(6);
    expect(config.detailRows).toHaveLength(1);
    expect(config.visualStyle.presetId).toBe(DEFAULT_TEAM_CARD_STYLE_PRESET_ID);
    expect(config.layoutPresetId).toBe(DEFAULT_TEAM_CARD_LAYOUT_PRESET_ID);
    expect(config.exportPresetId).toBe(DEFAULT_TEAM_CARD_EXPORT_PRESET_ID);
  });

  it("normalizes invalid persisted data safely", () => {
    const fallback = createDefaultTeamCardConfig("Trainer");
    const normalized = normalizeTeamCardConfig(
      {
        backgroundSlug: "unknown",
        trainerVariantSlug: "none",
        trainerName: "",
        layoutPresetId: "unknown-layout",
        exportPresetId: "unknown-export",
        globalSpriteMode: "invalid",
        detailRows: [{ id: "detail-1", iconSlug: "missing", text: "" }],
        slotCustomizations: [{ slot: 1, formSlug: "bad", iconSlug: "bad", spriteMode: "shiny" }],
      },
      fallback,
    );

    expect(normalized.backgroundSlug).toBe(fallback.backgroundSlug);
    expect(normalized.trainerVariantSlug).toBe(fallback.trainerVariantSlug);
    expect(normalized.layoutPresetId).toBe(fallback.layoutPresetId);
    expect(normalized.exportPresetId).toBe(fallback.exportPresetId);
    expect(normalized.cardTitle).toBe(fallback.cardTitle);
    expect(normalized.isCardTitleCustom).toBe(false);
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

  it("normalizes card title and custom title state", () => {
    const fallback = createDefaultTeamCardConfig("Builder Team");
    const longTitle = "x".repeat(TEAM_CARD_TITLE_MAX_LENGTH + 8);

    expect(defaultTeamCardTitle("")).toBe("Team Card");
    expect(clampTeamCardTitle(longTitle)).toHaveLength(TEAM_CARD_TITLE_MAX_LENGTH);

    const normalizedCustom = normalizeTeamCardConfig(
      {
        ...fallback,
        cardTitle: "Export Title",
        isCardTitleCustom: true,
      },
      fallback,
    );

    expect(normalizedCustom.cardTitle).toBe("Export Title");
    expect(normalizedCustom.isCardTitleCustom).toBe(true);

    const legacyConfig = { ...fallback } as Partial<typeof fallback>;
    delete legacyConfig.isCardTitleCustom;
    const normalizedLegacyCustom = normalizeTeamCardConfig(
      {
        ...legacyConfig,
        cardTitle: "Legacy Title",
      },
      fallback,
    );

    expect(normalizedLegacyCustom.cardTitle).toBe("Legacy Title");
    expect(normalizedLegacyCustom.isCardTitleCustom).toBe(true);
  });

  it("hydrates persisted edits instead of falling back to defaults", () => {
    const persisted = createDefaultTeamCardConfig("Saved Card");
    persisted.cardTitle = "Saved Export";
    persisted.isCardTitleCustom = true;
    persisted.backgroundSlug = "cosmic-void";
    persisted.trainerName = "Saved Name";
    persisted.layoutPresetId = "poster";
    persisted.exportPresetId = "ultra";
    persisted.globalSpriteMode = "shiny";
    persisted.visualStyle = {
      ...persisted.visualStyle,
      presetId: "cosmic-arena",
      overlayIntensity: "high",
      spriteGlow: "strong",
      labelStyle: "pill",
      borderStyle: "neon",
      pokemonFrameStyle: "type-ring",
      trainerTreatment: "hero",
      headerTreatment: "glass-banner",
    };
    persisted.slotCustomizations = persisted.slotCustomizations.map((entry) =>
      entry.slot === 2 ? { ...entry, spriteMode: "shiny" } : entry,
    );

    const fallback = createDefaultTeamCardConfig("Fallback");
    const hydrated = hydrateTeamCardConfigFromStorage(serializeTeamCardConfig(persisted), fallback);

    expect(hydrated.backgroundSlug).toBe("cosmic-void");
    expect(hydrated.cardTitle).toBe("Saved Export");
    expect(hydrated.isCardTitleCustom).toBe(true);
    expect(hydrated.trainerName).toBe("Saved Name");
    expect(hydrated.layoutPresetId).toBe("poster");
    expect(hydrated.exportPresetId).toBe("ultra");
    expect(hydrated.globalSpriteMode).toBe("shiny");
    expect(hydrated.visualStyle).toEqual(persisted.visualStyle);
    expect(hydrated.slotCustomizations[1].spriteMode).toBe("shiny");
  });

  it("uses the fallback config when storage is empty or unreadable", () => {
    const fallback = createDefaultTeamCardConfig("Fallback");

    expect(hydrateTeamCardConfigFromStorage(null, fallback)).toBe(fallback);
    expect(hydrateTeamCardConfigFromStorage("{bad json", fallback)).toBe(fallback);
  });

  it("exposes structured style, layout, and export presets", () => {
    expect(TEAM_CARD_STYLE_PRESETS.length).toBeGreaterThanOrEqual(6);
    expect(getTeamCardStylePreset("neon-city").visualStyle.headerTreatment).toBeDefined();
    expect(getTeamCardStylePreset("neon-city").layoutPresetId).toBe("trainer-showcase");
    expect(getTeamCardLayoutPreset("trainer-showcase").composition.pokemonArrangement).toBe("current");
    expect(getTeamCardExportPreset("social-wide").width).toBe(1600);
    expect(getTeamCardExportPreset("ultra").height).toBe(1920);
  });

  it("creates a future-save design snapshot", () => {
    const config = createDefaultTeamCardConfig("Rain Tempo");
    const team: Team = {
      id: "team-1",
      name: "Rain Tempo",
      format: "singles",
      pokemon: [
        {
          slot: 1,
          pokemon: {
            id: 25,
            name: "Pikachu",
            slug: "pikachu",
            generation: 1,
            region: "Kanto",
            primaryType: "electric",
            secondaryType: null,
            stats: { hp: 35, attack: 55, defense: 40, specialAttack: 50, specialDefense: 50, speed: 90, total: 320 },
            spriteNormal: "/pikachu.png",
            spriteShiny: null,
            isLegendaryOrMythical: false,
            isFullyEvolved: false,
            abilities: [],
            moves: [],
            roles: [],
          },
          selectedAbility: null,
          selectedItem: null,
          moves: [],
          isShiny: false,
        },
      ],
    };

    const snapshot = createTeamCardDesignSnapshot({
      config,
      team,
      now: "2026-01-01T00:00:00.000Z",
    });

    expect(snapshot.schemaVersion).toBe(1);
    expect(snapshot.teamId).toBe("team-1");
    expect(snapshot.cardTitle).toBe(config.cardTitle);
    expect(snapshot.stylePresetId).toBe(config.visualStyle.presetId);
    expect(snapshot.pokemon[0]).toMatchObject({
      slot: 1,
      pokemonSlug: "pikachu",
      spriteMode: "normal",
    });
  });
});
