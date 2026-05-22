import { ALL_POKEMON_TYPES } from "@/data/type-chart";
import { calculateTypeEffectiveness } from "@/lib/calculations/shared/type-effectiveness";
import type { PokemonType } from "@/types/shared";

export type TypeMatchupMultiplier = 0 | 0.5 | 1 | 2;

export interface TypeMatchupCell {
  attackingType: PokemonType;
  defendingType: PokemonType;
  multiplier: TypeMatchupMultiplier;
}

export interface TypeMatchupMatrix {
  types: PokemonType[];
  cells: TypeMatchupCell[][];
}

function normalizeMultiplier(value: number): TypeMatchupMultiplier {
  if (value === 0) {
    return 0;
  }

  if (value === 0.5) {
    return 0.5;
  }

  if (value === 2) {
    return 2;
  }

  return 1;
}

export function buildTypeMatchupMatrix(): TypeMatchupMatrix {
  const types = [...ALL_POKEMON_TYPES];

  const cells = types.map((attackingType) =>
    types.map((defendingType) => ({
      attackingType,
      defendingType,
      multiplier: normalizeMultiplier(
        calculateTypeEffectiveness(attackingType, [defendingType]),
      ),
    })),
  );

  return { types, cells };
}

export function getMatrixCell(
  matrix: TypeMatchupMatrix,
  attackingType: PokemonType,
  defendingType: PokemonType,
): TypeMatchupCell | undefined {
  const rowIndex = matrix.types.indexOf(attackingType);
  const colIndex = matrix.types.indexOf(defendingType);

  if (rowIndex === -1 || colIndex === -1) {
    return undefined;
  }

  return matrix.cells[rowIndex]?.[colIndex];
}

export interface TypeOffenseProfile {
  attackingType: PokemonType;
  superEffective: PokemonType[];
  notVeryEffective: PokemonType[];
  noEffect: PokemonType[];
}

/** List-view buckets derived from the same math as {@link buildTypeMatchupMatrix}. */
export function buildTypeOffenseProfiles(): TypeOffenseProfile[] {
  const types = [...ALL_POKEMON_TYPES];

  return types.map((attackingType) => {
    const superEffective: PokemonType[] = [];
    const notVeryEffective: PokemonType[] = [];
    const noEffect: PokemonType[] = [];

    for (const defendingType of types) {
      const multiplier = normalizeMultiplier(
        calculateTypeEffectiveness(attackingType, [defendingType]),
      );

      if (multiplier === 2) {
        superEffective.push(defendingType);
      } else if (multiplier === 0.5) {
        notVeryEffective.push(defendingType);
      } else if (multiplier === 0) {
        noEffect.push(defendingType);
      }
    }

    return {
      attackingType,
      superEffective,
      notVeryEffective,
      noEffect,
    };
  });
}

export function getOffenseProfile(
  profiles: TypeOffenseProfile[],
  attackingType: PokemonType,
): TypeOffenseProfile | undefined {
  return profiles.find((profile) => profile.attackingType === attackingType);
}
