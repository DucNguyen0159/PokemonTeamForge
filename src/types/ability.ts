import type { PokemonType } from "./shared";

export type AbilityTag =
  | "weather"
  | "terrain"
  | "immunity"
  | "damage_boost"
  | "defense_boost"
  | "speed_control"
  | "status"
  | "healing"
  | "redirection"
  | "priority"
  | "anti_priority"
  | "switching"
  | "contact_punish"
  | "item_interaction"
  | "form_change"
  | "utility";

export const HIDDEN_ABILITY_LABEL = "(hidden)";

export interface Ability {
  id: number;
  name: string;
  slug: string;
  description: string;
  fullEffect?: string;
  isHidden?: boolean;
  tags?: AbilityTag[];
}

export interface AbilityListItem {
  id: number;
  name: string;
  slug: string;
  description: string;
  tags: AbilityTag[];
}

export interface AbilityPokemonReference {
  id: number;
  name: string;
  slug: string;
  primaryType: PokemonType;
  secondaryType?: PokemonType | null;
  spriteNormal: string;
  isHidden: boolean;
  hiddenLabel?: typeof HIDDEN_ABILITY_LABEL;
}

export interface AbilityDetail extends AbilityListItem {
  pokemon: AbilityPokemonReference[];
}
