/** Upper bound so the card headline stays readable in the preview column. */
export const TEAM_CARD_TRAINER_NAME_MAX_LENGTH = 13;
/** Upper bound so the team identity badge stays compact in the exported card. */
export const TEAM_CARD_TITLE_MAX_LENGTH = 32;

export type TeamCardSpriteMode = "normal" | "shiny";
export type TeamCardPresetId =
  | "neon-city"
  | "storm-battle"
  | "cosmic-arena"
  | "classic-league"
  | "volcanic-core"
  | "minimal-focus";
export type TeamCardLayoutPresetId =
  | "trainer-showcase"
  | "team-grid"
  | "battle-lineup"
  | "poster";
export type TeamCardExportPresetId =
  | "social-wide"
  | "high-res"
  | "ultra";
export type TeamCardOverlayIntensity = "low" | "medium" | "high";
export type TeamCardSpriteGlow = "off" | "soft" | "strong";
export type TeamCardLabelStyle = "minimal" | "badge" | "pill";
export type TeamCardBorderStyle = "none" | "subtle" | "neon";
export type TeamCardPokemonFrameStyle = "none" | "frosted-disk" | "type-ring" | "glass-tile";
export type TeamCardTrainerTreatment = "anchored-right" | "spotlight" | "hero";
export type TeamCardHeaderTreatment = "compact-panel" | "glass-banner" | "minimal";

export type TeamCardVisualStyle = {
  presetId: TeamCardPresetId;
  overlayIntensity: TeamCardOverlayIntensity;
  spriteGlow: TeamCardSpriteGlow;
  labelStyle: TeamCardLabelStyle;
  borderStyle: TeamCardBorderStyle;
  pokemonFrameStyle?: TeamCardPokemonFrameStyle;
  trainerTreatment?: TeamCardTrainerTreatment;
  headerTreatment?: TeamCardHeaderTreatment;
};

export type TeamCardComposition = {
  aspectRatio: `${number} / ${number}`;
  trainerAnchor: "right" | "left" | "center";
  pokemonArrangement: "current" | "grid-2x3" | "diagonal-lines" | "ace-showcase";
  showHeaderPanel: boolean;
  showFooterBrand: boolean;
};

export type TeamCardStylePreset = {
  id: TeamCardPresetId;
  label: string;
  description: string;
  backgroundSlug: string;
  layoutPresetId: TeamCardLayoutPresetId;
  exportPresetId: TeamCardExportPresetId;
  visualStyle: Omit<TeamCardVisualStyle, "presetId">;
};

export type TeamCardLayoutPreset = {
  id: TeamCardLayoutPresetId;
  label: string;
  description: string;
  composition: TeamCardComposition;
};

export type TeamCardExportPreset = {
  id: TeamCardExportPresetId;
  label: string;
  description: string;
  width: number;
  height: number;
  pixelRatio: number;
  format: "png";
};

export type TeamCardDesignSnapshotPokemon = {
  slot: number;
  pokemonSlug: string | null;
  spriteMode: TeamCardSpriteMode;
  badgeSlug: string;
};

export type TeamCardDesignSnapshot = {
  schemaVersion: 1;
  name: string;
  teamId?: string | null;
  teamName: string;
  cardTitle: string;
  stylePresetId: TeamCardPresetId;
  layoutPresetId: TeamCardLayoutPresetId;
  exportPresetId: TeamCardExportPresetId;
  backgroundSlug: string;
  trainerVariantSlug: string;
  trainerName: string;
  detailRows: TeamCardDetailRow[];
  visualStyle: TeamCardVisualStyle;
  pokemon: TeamCardDesignSnapshotPokemon[];
  createdAt: string;
  updatedAt: string;
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
  cardTitle: string;
  isCardTitleCustom: boolean;
  backgroundSlug: string;
  trainerVariantSlug: string;
  trainerName: string;
  detailRows: TeamCardDetailRow[];
  visualStyle: TeamCardVisualStyle;
  layoutPresetId: TeamCardLayoutPresetId;
  exportPresetId: TeamCardExportPresetId;
  globalSpriteMode: TeamCardSpriteMode;
  slotCustomizations: TeamCardSlotCustomization[];
};
