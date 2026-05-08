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

export interface Item {
  id: number;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string | null;
  tags?: ItemTag[];
}
