export type ChampionsFormat = "single" | "double";

export type ChampionsFormatSupport = ChampionsFormat | "both";

export type ChampionsSpSpread = {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
};

export type ChampionsPokemon = {
  id: string;
  slot: number;
  pokemonId: number | null;
  speciesId?: string;
  formId?: string;
  pokemonName: string;
  nickname?: string;
  ability: string;
  item?: string;
  moves: string[];
  statAlignment: string;
  sp: ChampionsSpSpread;
  megaStone?: string;
  useMegaByDefault?: boolean;
};

export type ChampionsBattlePlan = {
  id: string;
  name: string;
  format: ChampionsFormat;
  matchupLabel: string;
  selectedPokemonIds: string[];
  leadPokemonIds: string[];
  backupPokemonIds?: string[];
  winConditionNote?: string;
  avoidNote?: string;
  generalNote?: string;
};

export type ChampionsTeam = {
  id?: string;
  userId?: string | null;
  name: string;
  mode: "champions";
  formatSupport: ChampionsFormatSupport;
  rulesetId: string;
  format: "singles" | "doubles";
  pokemon: ChampionsPokemon[];
  battlePlans: ChampionsBattlePlan[];
  teamNotes?: string;
  isPublic?: boolean;
  createdAt?: string;
  updatedAt?: string;
};
