export const POKEMON_LIST_SORT_KEYS = [
  "id",
  "name",
  "total",
  "hp",
  "attack",
  "defense",
  "specialAttack",
  "specialDefense",
  "speed",
] as const;

export type PokemonListSortKey = (typeof POKEMON_LIST_SORT_KEYS)[number];

export type PokemonListSortDirection = "asc" | "desc";

export function isPokemonListSortKey(value: string): value is PokemonListSortKey {
  return (POKEMON_LIST_SORT_KEYS as readonly string[]).includes(value);
}
