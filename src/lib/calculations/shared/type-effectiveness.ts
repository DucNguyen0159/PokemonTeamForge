import { TYPE_CHART } from "@/data/type-chart";
import type { PokemonType } from "@/types/shared";

export function calculateTypeEffectiveness(
  attackingType: PokemonType,
  defendingTypes: PokemonType[],
): number {
  if (defendingTypes.length === 0) {
    return 1;
  }

  const hasImmunity = defendingTypes.some((defendingType) =>
    TYPE_CHART[defendingType].immuneTo.includes(attackingType),
  );

  if (hasImmunity) {
    return 0;
  }

  return defendingTypes.reduce((multiplier, defendingType) => {
    const interaction = TYPE_CHART[defendingType];

    if (interaction.weakTo.includes(attackingType)) {
      return multiplier * 2;
    }

    if (interaction.resistantTo.includes(attackingType)) {
      return multiplier * 0.5;
    }

    return multiplier;
  }, 1);
}

export function isSuperEffectiveAgainst(
  attackingType: PokemonType,
  targetType: PokemonType,
): boolean {
  return TYPE_CHART[targetType].weakTo.includes(attackingType);
}
