export type TeamCardSpriteMode = "normal" | "shiny";

export type TeamCardDetailRow = {
  id: "detail-1" | "detail-2";
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
  showNames: boolean;
  showTypes: boolean;
};
