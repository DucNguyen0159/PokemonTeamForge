import {
  TEAM_CARD_BACKGROUND_ASSETS,
  TEAM_CARD_DETAIL_ICON_OPTIONS,
  TEAM_CARD_SLOT_FORM_OPTIONS,
  TEAM_CARD_SLOT_ICON_OPTIONS,
  TEAM_CARD_TRAINER_VARIANTS,
} from "@/data/team-card-assets";
import type {
  TeamCardConfig,
  TeamCardDetailRow,
  TeamCardSlotCustomization,
  TeamCardSpriteMode,
} from "@/types/team-card";

const DEFAULT_DETAIL_ROWS: TeamCardDetailRow[] = [
  { id: "detail-1", iconSlug: "instagram", text: "instagram.com/" },
  { id: "detail-2", iconSlug: "instagram", text: "Pokemon Trainer" },
];

const DEFAULT_SLOT_CUSTOMIZATIONS: TeamCardSlotCustomization[] = Array.from(
  { length: 6 },
  (_, idx) => ({
    slot: idx + 1,
    formSlug: "none",
    iconSlug: "none",
  }),
);

const STORAGE_VERSION = 1;

type PersistedPayload = {
  version: number;
  config: TeamCardConfig;
};

function isValidSpriteMode(value: unknown): value is TeamCardSpriteMode {
  return value === "normal" || value === "shiny";
}

function coerceString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

export function createDefaultTeamCardConfig(teamName?: string): TeamCardConfig {
  return {
    backgroundSlug: TEAM_CARD_BACKGROUND_ASSETS[0]?.slug ?? "midnight-grid",
    trainerVariantSlug: TEAM_CARD_TRAINER_VARIANTS[0]?.slug ?? "rei-academy",
    trainerName: teamName?.trim() ? teamName.trim() : "Trainer",
    detailRows: DEFAULT_DETAIL_ROWS,
    globalSpriteMode: "normal",
    slotCustomizations: DEFAULT_SLOT_CUSTOMIZATIONS,
    showNames: true,
    showTypes: true,
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
  const validFormSlugs = new Set(TEAM_CARD_SLOT_FORM_OPTIONS.map((entry) => entry.slug));
  const validSlotIcons = new Set(TEAM_CARD_SLOT_ICON_OPTIONS.map((entry) => entry.slug));

  const detailRows = (Array.isArray(raw.detailRows) ? raw.detailRows : fallback.detailRows).map(
    (row, idx): TeamCardDetailRow => {
      const rowId = idx === 0 ? "detail-1" : "detail-2";
      const iconSlug = validDetailIcons.has((row as TeamCardDetailRow).iconSlug)
        ? (row as TeamCardDetailRow).iconSlug
        : fallback.detailRows[idx]?.iconSlug ?? "instagram";
      const text = coerceString((row as TeamCardDetailRow).text, fallback.detailRows[idx]?.text ?? "");
      return { id: rowId, iconSlug, text };
    },
  );

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
      formSlug: validFormSlugs.has(entry.formSlug) ? entry.formSlug : "none",
      iconSlug: validSlotIcons.has(entry.iconSlug) ? entry.iconSlug : "none",
    });
  });

  const slotCustomizations = Array.from({ length: 6 }, (_, idx) => {
    const slot = idx + 1;
    return (
      slotMap.get(slot) ?? {
        slot,
        formSlug: "none",
        iconSlug: "none",
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
    trainerName: coerceString(raw.trainerName, fallback.trainerName),
    detailRows: [detailRows[0] ?? fallback.detailRows[0], detailRows[1] ?? fallback.detailRows[1]],
    globalSpriteMode: isValidSpriteMode(raw.globalSpriteMode)
      ? raw.globalSpriteMode
      : fallback.globalSpriteMode,
    slotCustomizations,
    showNames: typeof raw.showNames === "boolean" ? raw.showNames : fallback.showNames,
    showTypes: typeof raw.showTypes === "boolean" ? raw.showTypes : fallback.showTypes,
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
