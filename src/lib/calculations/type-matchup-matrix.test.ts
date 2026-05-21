import { describe, expect, it } from "vitest";

import {
  buildTypeMatchupMatrix,
  getMatrixCell,
} from "@/lib/calculations/type-matchup-matrix";

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
});
