import { describe, expect, it } from "vitest";

import {
  buildTypeMatchupMatrix,
  buildTypeOffenseProfiles,
  getMatrixCell,
  getOffenseProfile,
  type TypeMatchupMultiplier,
} from "@/lib/calculations/type-matchup-matrix";
import type { PokemonType } from "@/types/shared";

const ALLOWED_MULTIPLIERS: TypeMatchupMultiplier[] = [0, 0.5, 1, 2];

function defendingTypesForMultiplier(
  attackingType: PokemonType,
  multiplier: TypeMatchupMultiplier,
  matrix: ReturnType<typeof buildTypeMatchupMatrix>,
): PokemonType[] {
  const rowIndex = matrix.types.indexOf(attackingType);
  const row = matrix.cells[rowIndex] ?? [];

  return row
    .filter((cell) => cell.multiplier === multiplier)
    .map((cell) => cell.defendingType)
    .sort();
}

describe("buildTypeMatchupMatrix", () => {
  const matrix = buildTypeMatchupMatrix();

  it("builds an 18x18 matrix aligned with ALL_POKEMON_TYPES", () => {
    expect(matrix.types).toHaveLength(18);
    expect(matrix.cells).toHaveLength(18);
    expect(matrix.cells.every((row) => row.length === 18)).toBe(true);
  });

  it("marks super-effective matchups as 2", () => {
    expect(getMatrixCell(matrix, "fire", "grass")?.multiplier).toBe(2);
    expect(getMatrixCell(matrix, "water", "fire")?.multiplier).toBe(2);
    expect(getMatrixCell(matrix, "electric", "water")?.multiplier).toBe(2);
  });

  it("marks resisted matchups as 0.5", () => {
    expect(getMatrixCell(matrix, "fire", "fire")?.multiplier).toBe(0.5);
    expect(getMatrixCell(matrix, "fighting", "psychic")?.multiplier).toBe(0.5);
    expect(getMatrixCell(matrix, "psychic", "fighting")?.multiplier).toBe(2);
  });

  it("marks immunities as 0", () => {
    expect(getMatrixCell(matrix, "ghost", "normal")?.multiplier).toBe(0);
    expect(getMatrixCell(matrix, "normal", "ghost")?.multiplier).toBe(0);
    expect(getMatrixCell(matrix, "ground", "flying")?.multiplier).toBe(0);
    expect(getMatrixCell(matrix, "electric", "ground")?.multiplier).toBe(0);
  });

  it("marks neutral matchups as 1", () => {
    expect(getMatrixCell(matrix, "normal", "water")?.multiplier).toBe(1);
    expect(getMatrixCell(matrix, "dragon", "normal")?.multiplier).toBe(1);
  });

  it("uses only 0, 0.5, 1, or 2 for every matrix cell", () => {
    for (const row of matrix.cells) {
      for (const cell of row) {
        expect(ALLOWED_MULTIPLIERS).toContain(cell.multiplier);
      }
    }
  });
});

describe("buildTypeOffenseProfiles", () => {
  const matrix = buildTypeMatchupMatrix();
  const profiles = buildTypeOffenseProfiles();

  it("builds one profile per type", () => {
    expect(profiles).toHaveLength(18);
    expect(profiles.map((profile) => profile.attackingType)).toEqual(matrix.types);
  });

  it.each(["fire", "electric", "fighting", "water"] as const)(
    "matches matrix row buckets for %s",
    (attackingType) => {
      const profile = getOffenseProfile(profiles, attackingType);
      expect(profile).toBeDefined();

      expect([...profile!.superEffective].sort()).toEqual(
        defendingTypesForMultiplier(attackingType, 2, matrix),
      );
      expect([...profile!.notVeryEffective].sort()).toEqual(
        defendingTypesForMultiplier(attackingType, 0.5, matrix),
      );
      expect([...profile!.noEffect].sort()).toEqual(
        defendingTypesForMultiplier(attackingType, 0, matrix),
      );
    },
  );
});
