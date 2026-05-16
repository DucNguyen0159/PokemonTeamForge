import {
  TEAM_CARD_BACKGROUND_ASSETS,
  TEAM_CARD_DETAIL_ICON_OPTIONS,
  TEAM_CARD_SLOT_BADGE_OPTIONS,
  TEAM_CARD_TRAINER_VARIANTS,
} from "@/data/team-card-assets";
import {
  type TeamCardConfig,
  type TeamCardDetailRow,
  type TeamCardLabelStyle,
  type TeamCardOverlayIntensity,
  type TeamCardPresetId,
  type TeamCardSlotCustomization,
  type TeamCardSpriteGlow,
  type TeamCardSpriteMode,
  type TeamCardVisualStyle,
  type TeamCardBorderStyle,
  TEAM_CARD_TRAINER_NAME_MAX_LENGTH,
} from "@/types/team-card";

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
  presetId: "neon-city",
  overlayIntensity: "medium",
  spriteGlow: "soft",
  labelStyle: "badge",
  borderStyle: "subtle",
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
  return (
    value === "neon-city" ||
    value === "storm-battle" ||
    value === "cosmic-arena" ||
    value === "classic-league" ||
    value === "volcanic-core" ||
    value === "minimal-focus"
  );
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

export function createDefaultTeamCardConfig(teamName?: string): TeamCardConfig {
  return {
    backgroundSlug: TEAM_CARD_BACKGROUND_ASSETS[0]?.slug ?? "midnight-grid",
    trainerVariantSlug: TEAM_CARD_TRAINER_VARIANTS[0]?.slug ?? "spr-masters-aaron",
    trainerName: clampTeamCardTrainerName(
      teamName?.trim() ? teamName.trim() : "Trainer",
    ),
    detailRows: DEFAULT_DETAIL_ROWS,
    visualStyle: DEFAULT_TEAM_CARD_VISUAL_STYLE,
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
