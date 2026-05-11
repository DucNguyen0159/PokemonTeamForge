/** Upper bound so the card headline stays readable in the preview column. */
export const TEAM_CARD_TRAINER_NAME_MAX_LENGTH = 11;

export type TeamCardSpriteMode = "normal" | "shiny";

export type TeamCardDetailRow = {
  id: "detail-1";
  iconSlug: string;
  text: string;
};

export type TeamCardSlotCustomization = {
  slot: number;
  spriteMode?: TeamCardSpriteMode;
  formSlug: string;
  iconSlug: string;
};

export type TeamCardConfig = {
  backgroundSlug: string;
  trainerVariantSlug: string;
  trainerName: string;
  detailRows: TeamCardDetailRow[];
  globalSpriteMode: TeamCardSpriteMode;
  slotCustomizations: TeamCardSlotCustomization[];
};
