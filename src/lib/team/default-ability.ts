import type { Ability } from "@/types/ability";
import type { Pokemon } from "@/types/pokemon";

export function getDefaultAbility(pokemon: Pokemon | null): Ability | null {
  const abilities = pokemon?.abilities ?? [];
  if (abilities.length === 0) {
    return null;
  }

  if (abilities.length === 1) {
    return abilities[0] ?? null;
  }

  return abilities.find((ability) => !ability.isHidden) ?? abilities[0] ?? null;
}
