import type { MoveCategory, PokemonType } from "./shared";

export type MoveTag =
  | "entry_hazard"
  | "hazard_removal"
  | "recovery"
  | "pivot"
  | "setup"
  | "status"
  | "priority"
  | "protect"
  | "fake_out"
  | "spread"
  | "speed_control"
  | "weather"
  | "trick_room"
  | "redirection"
  | "phazing"
  | "trap";

export interface Move {
  id: number;
  name: string;
  slug: string;
  type: PokemonType;
  category: MoveCategory;
  power?: number | null;
  accuracy?: number | null;
  pp?: number | null;
  priority: number;
  description?: string;
  tags?: MoveTag[];
}
