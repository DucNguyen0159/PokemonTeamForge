export type ChampionsCommunitySort = "highest" | "newest";
export type ChampionsCommunityFormatFilter = "all" | "single" | "double" | "both";

export type ChampionsCommunityPokemonPreview = {
  slot: number;
  pokemonId: number;
  pokemonName: string;
  spriteNormal: string | null;
  ability?: string;
  item?: string;
  statAlignment?: string;
  sp?: {
    hp: number;
    atk: number;
    def: number;
    spa: number;
    spd: number;
    spe: number;
  };
  moves?: string[];
  useMegaByDefault?: boolean;
};

export type ChampionsCommunityTeamSummary = {
  id: string;
  name: string;
  userId: string;
  publisherUsername: string | null;
  formatSupport: "single" | "double" | "both";
  rulesetId: string | null;
  updatedAt: string;
  createdAt: string;
  pokemon: ChampionsCommunityPokemonPreview[];
  battlePlanCount: number;
  starCount: number;
  commentCount: number;
  hasStarred: boolean;
};

export type ChampionsCommunityComment = {
  id: string;
  teamId: string;
  userId: string;
  authorUsername: string | null;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export type ChampionsCommunityTeamDetail = ChampionsCommunityTeamSummary & {
  teamNotes: string | null;
  battlePlans: Array<{
    id: string;
    name: string;
    format: "single" | "double";
    matchupLabel: string;
    selectedPokemonSlots: number[];
    leadPokemonSlots: number[];
    backupPokemonSlots: number[];
    winConditionNote: string | null;
    avoidNote: string | null;
    generalNote: string | null;
  }>;
  comments: ChampionsCommunityComment[];
};
