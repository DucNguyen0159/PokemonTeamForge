import {
  TEAM_CARD_BACKGROUND_ASSETS,
  TEAM_CARD_DETAIL_ICON_OPTIONS,
  TEAM_CARD_SLOT_BADGE_OPTIONS,
  TEAM_CARD_TRAINER_VARIANTS,
} from "@/data/team-card-assets";
import {
  DEFAULT_TEAM_CARD_EXPORT_PRESET_ID,
  DEFAULT_TEAM_CARD_LAYOUT_PRESET_ID,
  DEFAULT_TEAM_CARD_STYLE_PRESET_ID,
  TEAM_CARD_EXPORT_PRESETS,
  TEAM_CARD_LAYOUT_PRESETS,
  TEAM_CARD_STYLE_PRESETS,
} from "@/data/team-card-presets";
import {
  type TeamCardConfig,
  type TeamCardDesignSnapshot,
  type TeamCardDetailRow,
  type TeamCardExportPresetId,
  type TeamCardHeaderTreatment,
  type TeamCardLabelStyle,
  type TeamCardLayoutPresetId,
  type TeamCardOverlayIntensity,
  type TeamCardPokemonFrameStyle,
  type TeamCardPresetId,
  type TeamCardSlotCustomization,
  type TeamCardSpriteGlow,
  type TeamCardSpriteMode,
  type TeamCardTrainerTreatment,
  type TeamCardVisualStyle,
  type TeamCardBorderStyle,
  TEAM_CARD_TITLE_MAX_LENGTH,
  TEAM_CARD_TRAINER_NAME_MAX_LENGTH,
} from "@/types/team-card";
import type { Team } from "@/types/team";

const DEFAULT_DETAIL_ROWS: TeamCardDetailRow[] = [
  { id: "detail-1", iconSlug: "instagram", text: "Pokemon Trainer" },
];

function normalizeDetailRows(
  raw: unknown,
  fallback: TeamCardDetailRow[],
  validDetailIcons: Set<string>,
): TeamCardDetailRow[] {
  const arr = Array.isArray(raw) ? raw : [];
  const fb = fallback[0] ?? { id: "detail-1" as const, iconSlug: "instagram", text: "" };

  const coerce = (row: unknown): TeamCardDetailRow => {
    const r = row as Partial<TeamCardDetailRow>;
    const iconSlug = validDetailIcons.has(String(r.iconSlug ?? ""))
      ? String(r.iconSlug)
      : fb.iconSlug;
    const rawText = typeof r.text === "string" ? r.text : fb.text;
    const text = rawText.trim().length > 0 ? rawText : fb.text;
    return { id: "detail-1", iconSlug, text };
  };

  if (arr.length === 0) {
    return [fb];
  }

  // Legacy saved configs had two rows; card preview used row 2 — prefer that when present.
  if (arr.length >= 2) {
    const r0 = arr[0] as Partial<TeamCardDetailRow>;
    const r1 = arr[1] as Partial<TeamCardDetailRow>;
    const t0 = typeof r0.text === "string" ? r0.text.trim() : "";
    const t1 = typeof r1.text === "string" ? r1.text.trim() : "";
    return [coerce(t1 ? r1 : t0 ? r0 : r1)];
  }

  return [coerce(arr[0])];
}

const DEFAULT_SLOT_CUSTOMIZATIONS: TeamCardSlotCustomization[] = Array.from(
  { length: 6 },
  (_, idx) => ({
    slot: idx + 1,
    badgeSlug: "none",
  }),
);

export const DEFAULT_TEAM_CARD_VISUAL_STYLE: TeamCardVisualStyle = {
  presetId: DEFAULT_TEAM_CARD_STYLE_PRESET_ID,
  ...TEAM_CARD_STYLE_PRESETS[0].visualStyle,
};

const STORAGE_VERSION = 1;

type PersistedPayload = {
  version: number;
  config: TeamCardConfig;
};

function isValidSpriteMode(value: unknown): value is TeamCardSpriteMode {
  return value === "normal" || value === "shiny";
}

function isValidPresetId(value: unknown): value is TeamCardPresetId {
  return TEAM_CARD_STYLE_PRESETS.some((preset) => preset.id === value);
}

function isValidLayoutPresetId(value: unknown): value is TeamCardLayoutPresetId {
  return TEAM_CARD_LAYOUT_PRESETS.some((preset) => preset.id === value);
}

function isValidExportPresetId(value: unknown): value is TeamCardExportPresetId {
  return TEAM_CARD_EXPORT_PRESETS.some((preset) => preset.id === value);
}

function isValidOverlayIntensity(value: unknown): value is TeamCardOverlayIntensity {
  return value === "low" || value === "medium" || value === "high";
}

function isValidSpriteGlow(value: unknown): value is TeamCardSpriteGlow {
  return value === "off" || value === "soft" || value === "strong";
}

function isValidLabelStyle(value: unknown): value is TeamCardLabelStyle {
  return value === "minimal" || value === "badge" || value === "pill";
}

function isValidBorderStyle(value: unknown): value is TeamCardBorderStyle {
  return value === "none" || value === "subtle" || value === "neon";
}

function isValidPokemonFrameStyle(value: unknown): value is TeamCardPokemonFrameStyle {
  return value === "none" || value === "frosted-disk" || value === "type-ring" || value === "glass-tile";
}

function isValidTrainerTreatment(value: unknown): value is TeamCardTrainerTreatment {
  return value === "anchored-right" || value === "spotlight" || value === "hero";
}

function isValidHeaderTreatment(value: unknown): value is TeamCardHeaderTreatment {
  return value === "compact-panel" || value === "glass-banner" || value === "minimal";
}

function normalizeVisualStyle(raw: unknown, fallback: TeamCardVisualStyle): TeamCardVisualStyle {
  const value = raw && typeof raw === "object" ? (raw as Partial<TeamCardVisualStyle>) : {};

  return {
    presetId: isValidPresetId(value.presetId) ? value.presetId : fallback.presetId,
    overlayIntensity: isValidOverlayIntensity(value.overlayIntensity)
      ? value.overlayIntensity
      : fallback.overlayIntensity,
    spriteGlow: isValidSpriteGlow(value.spriteGlow) ? value.spriteGlow : fallback.spriteGlow,
    labelStyle: isValidLabelStyle(value.labelStyle) ? value.labelStyle : fallback.labelStyle,
    borderStyle: isValidBorderStyle(value.borderStyle) ? value.borderStyle : fallback.borderStyle,
    pokemonFrameStyle: isValidPokemonFrameStyle(value.pokemonFrameStyle)
      ? value.pokemonFrameStyle
      : fallback.pokemonFrameStyle,
    trainerTreatment: isValidTrainerTreatment(value.trainerTreatment)
      ? value.trainerTreatment
      : fallback.trainerTreatment,
    headerTreatment: isValidHeaderTreatment(value.headerTreatment)
      ? value.headerTreatment
      : fallback.headerTreatment,
  };
}

function coerceString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

/** Truncates to the card headline limit (used on input and when loading persisted config). */
export function clampTeamCardTrainerName(name: string): string {
  if (name.length <= TEAM_CARD_TRAINER_NAME_MAX_LENGTH) {
    return name;
  }
  return name.slice(0, TEAM_CARD_TRAINER_NAME_MAX_LENGTH);
}

export function clampTeamCardTitle(title: string): string {
  const trimmed = title.trimStart();
  if (trimmed.length <= TEAM_CARD_TITLE_MAX_LENGTH) {
    return trimmed;
  }
  return trimmed.slice(0, TEAM_CARD_TITLE_MAX_LENGTH);
}

export function defaultTeamCardTitle(teamName?: string): string {
  return clampTeamCardTitle(teamName?.trim() ? teamName.trim() : "Team Card");
}

export function createDefaultTeamCardConfig(teamName?: string): TeamCardConfig {
  return {
    cardTitle: defaultTeamCardTitle(teamName),
    isCardTitleCustom: false,
    backgroundSlug: TEAM_CARD_BACKGROUND_ASSETS[0]?.slug ?? "midnight-grid",
    trainerVariantSlug: TEAM_CARD_TRAINER_VARIANTS[0]?.slug ?? "spr-masters-aaron",
    trainerName: clampTeamCardTrainerName(
      teamName?.trim() ? teamName.trim() : "Trainer",
    ),
    detailRows: DEFAULT_DETAIL_ROWS,
    visualStyle: DEFAULT_TEAM_CARD_VISUAL_STYLE,
    layoutPresetId: DEFAULT_TEAM_CARD_LAYOUT_PRESET_ID,
    exportPresetId: DEFAULT_TEAM_CARD_EXPORT_PRESET_ID,
    globalSpriteMode: "normal",
    slotCustomizations: DEFAULT_SLOT_CUSTOMIZATIONS,
  };
}

export function normalizeTeamCardConfig(
  value: unknown,
  fallback: TeamCardConfig,
): TeamCardConfig {
  if (!value || typeof value !== "object") {
    return fallback;
  }

  const raw = value as Partial<TeamCardConfig>;
  const validBackgroundSlugs = new Set(TEAM_CARD_BACKGROUND_ASSETS.map((entry) => entry.slug));
  const validTrainerSlugs = new Set(TEAM_CARD_TRAINER_VARIANTS.map((entry) => entry.slug));
  const validDetailIcons = new Set(TEAM_CARD_DETAIL_ICON_OPTIONS.map((entry) => entry.slug));
  const validBadgeSlugs = new Set(TEAM_CARD_SLOT_BADGE_OPTIONS.map((entry) => entry.slug));

  const detailRows = normalizeDetailRows(raw.detailRows, fallback.detailRows, validDetailIcons);
  const rawCardTitle = typeof raw.cardTitle === "string" ? clampTeamCardTitle(raw.cardTitle) : "";
  const cardTitle = rawCardTitle.trim().length > 0 ? rawCardTitle : fallback.cardTitle;
  const isCardTitleCustom =
    typeof raw.isCardTitleCustom === "boolean"
      ? raw.isCardTitleCustom
      : rawCardTitle.trim().length > 0 && rawCardTitle !== fallback.cardTitle;

  const baseSlots = Array.isArray(raw.slotCustomizations)
    ? raw.slotCustomizations
    : fallback.slotCustomizations;
  const slotMap = new Map<number, TeamCardSlotCustomization>();
  baseSlots.forEach((entry) => {
    const slot = Number(entry.slot);
    if (!Number.isInteger(slot) || slot < 1 || slot > 6) {
      return;
    }
    slotMap.set(slot, {
      slot,
      spriteMode: isValidSpriteMode(entry.spriteMode) ? entry.spriteMode : undefined,
      badgeSlug: validBadgeSlugs.has(entry.badgeSlug) ? entry.badgeSlug : "none",
    });
  });

  const slotCustomizations = Array.from({ length: 6 }, (_, idx) => {
    const slot = idx + 1;
    return (
      slotMap.get(slot) ?? {
        slot,
        badgeSlug: "none",
      }
    );
  });

  return {
    cardTitle,
    isCardTitleCustom,
    backgroundSlug: validBackgroundSlugs.has(raw.backgroundSlug ?? "")
      ? (raw.backgroundSlug as string)
      : fallback.backgroundSlug,
    trainerVariantSlug: validTrainerSlugs.has(raw.trainerVariantSlug ?? "")
      ? (raw.trainerVariantSlug as string)
      : fallback.trainerVariantSlug,
    trainerName: clampTeamCardTrainerName(
      coerceString(raw.trainerName, fallback.trainerName),
    ),
    detailRows,
    visualStyle: normalizeVisualStyle(raw.visualStyle, fallback.visualStyle),
    layoutPresetId: isValidLayoutPresetId(raw.layoutPresetId)
      ? raw.layoutPresetId
      : fallback.layoutPresetId,
    exportPresetId: isValidExportPresetId(raw.exportPresetId)
      ? raw.exportPresetId
      : fallback.exportPresetId,
    globalSpriteMode: isValidSpriteMode(raw.globalSpriteMode)
      ? raw.globalSpriteMode
      : fallback.globalSpriteMode,
    slotCustomizations,
  };
}

export function serializeTeamCardConfig(config: TeamCardConfig): string {
  const payload: PersistedPayload = {
    version: STORAGE_VERSION,
    config,
  };
  return JSON.stringify(payload);
}

export function deserializeTeamCardConfig(value: string | null): TeamCardConfig | null {
  if (!value) {
    return null;
  }

  try {
    const payload = JSON.parse(value) as Partial<PersistedPayload>;
    if (!payload || payload.version !== STORAGE_VERSION || !payload.config) {
      return null;
    }
    return payload.config;
  } catch {
    return null;
  }
}

export function hydrateTeamCardConfigFromStorage(
  value: string | null,
  fallback: TeamCardConfig,
): TeamCardConfig {
  const parsed = deserializeTeamCardConfig(value);
  return parsed ? normalizeTeamCardConfig(parsed, fallback) : fallback;
}

export function createTeamCardDesignSnapshot(input: {
  config: TeamCardConfig;
  team: Team;
  name?: string;
  now?: string;
}): TeamCardDesignSnapshot {
  const { config, team } = input;
  const timestamp = input.now ?? new Date().toISOString();

  return {
    schemaVersion: 1,
    name: input.name?.trim() || `${team.name || "Team"} Card`,
    teamId: team.id ?? null,
    teamName: team.name,
    cardTitle: config.cardTitle,
    stylePresetId: config.visualStyle.presetId,
    layoutPresetId: config.layoutPresetId,
    exportPresetId: config.exportPresetId,
    backgroundSlug: config.backgroundSlug,
    trainerVariantSlug: config.trainerVariantSlug,
    trainerName: config.trainerName,
    detailRows: config.detailRows.map((row) => ({ ...row })),
    visualStyle: { ...config.visualStyle },
    pokemon: team.pokemon.map((slot) => {
      const customization = config.slotCustomizations.find((entry) => entry.slot === slot.slot);
      return {
        slot: slot.slot,
        pokemonSlug: slot.pokemon?.slug ?? null,
        spriteMode: customization?.spriteMode ?? config.globalSpriteMode,
        badgeSlug: customization?.badgeSlug ?? "none",
      };
    }),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}
