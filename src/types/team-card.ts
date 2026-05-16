/** Upper bound so the card headline stays readable in the preview column. */
export const TEAM_CARD_TRAINER_NAME_MAX_LENGTH = 11;

export type TeamCardSpriteMode = "normal" | "shiny";
export type TeamCardPresetId =
  | "neon-city"
  | "storm-battle"
  | "cosmic-arena"
  | "classic-league"
  | "volcanic-core"
  | "minimal-focus";
export type TeamCardOverlayIntensity = "low" | "medium" | "high";
export type TeamCardSpriteGlow = "off" | "soft" | "strong";
export type TeamCardLabelStyle = "minimal" | "badge" | "pill";
export type TeamCardBorderStyle = "none" | "subtle" | "neon";

export type TeamCardVisualStyle = {
  presetId: TeamCardPresetId;
  overlayIntensity: TeamCardOverlayIntensity;
  spriteGlow: TeamCardSpriteGlow;
  labelStyle: TeamCardLabelStyle;
  borderStyle: TeamCardBorderStyle;
};

export type TeamCardDetailRow = {
  id: "detail-1";
  iconSlug: string;
  text: string;
};

export type TeamCardSlotCustomization = {
  slot: number;
  spriteMode?: TeamCardSpriteMode;
  badgeSlug: string;
};

export type TeamCardConfig = {
  backgroundSlug: string;
  trainerVariantSlug: string;
  trainerName: string;
  detailRows: TeamCardDetailRow[];
  visualStyle: TeamCardVisualStyle;
  globalSpriteMode: TeamCardSpriteMode;
  slotCustomizations: TeamCardSlotCustomization[];
};
