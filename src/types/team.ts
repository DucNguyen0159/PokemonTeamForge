export interface TeamSlot {
  slot: number;
  pokemonName: string | null;
}

export interface Team {
  id: string;
  name: string;
  format: "singles" | "doubles" | "triples";
  slots: TeamSlot[];
}
