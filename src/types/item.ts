export type ItemTag =
  | "choice_item"
  | "recovery"
  | "damage_boost"
  | "speed_boost"
  | "defense_boost"
  | "special_defense_boost"
  | "weather_item"
  | "terrain_item"
  | "focus_sash"
  | "utility";

export type ItemCompetitiveGroup =
  | "battle"
  | "berries"
  | "mega_stones"
  | "type_boosting"
  | "type_changing"
  | "gems"
  | "weather_terrain_support"
  | "incenses_niche"
  | "other";

export interface Item {
  id: number;
  name: string;
  slug: string;
  category?: string | null;
  competitiveGroup?: ItemCompetitiveGroup;
  competitiveGroupOrder?: number;
  sortOrder?: number;
  description?: string;
  shortEffect?: string | null;
  iconUrl?: string | null;
  iconStoragePath?: string | null;
  tags?: ItemTag[];
  isCompetitive?: boolean;
}
