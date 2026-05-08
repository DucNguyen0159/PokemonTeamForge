export type PokemonType =
  | "normal"
  | "fire"
  | "water"
  | "electric"
  | "grass"
  | "ice"
  | "fighting"
  | "poison"
  | "ground"
  | "flying"
  | "psychic"
  | "bug"
  | "rock"
  | "ghost"
  | "dragon"
  | "dark"
  | "steel"
  | "fairy";

export type BattleFormat = "singles" | "doubles" | "triples";

export type MoveCategory = "physical" | "special" | "status";

export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

export type StatTier = "any" | "low" | "medium" | "high" | "very_high";

export type TeamRole =
  | "physical_attacker"
  | "special_attacker"
  | "mixed_attacker"
  | "physical_wall"
  | "special_wall"
  | "tank"
  | "support"
  | "pivot"
  | "hazard_setter"
  | "hazard_remover"
  | "setup_sweeper"
  | "wallbreaker"
  | "speed_control"
  | "weather_setter"
  | "weather_abuser"
  | "trick_room_setter"
  | "trick_room_abuser"
  | "intimidate_support"
  | "redirection_support"
  | "status_spreader"
  | "priority_user"
  | "trap_user";

export type Nullable<T> = T | null;
