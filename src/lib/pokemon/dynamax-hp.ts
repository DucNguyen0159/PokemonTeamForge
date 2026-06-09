import { calcStatMaxLevel100, calcStatMinLevel100 } from "@/lib/pokemon/stat-ranges";

const DYNAMAX_MIN_MULTIPLIER = 1.5;
const DYNAMAX_MAX_MULTIPLIER = 2;

export type DynamaxHpPreview = {
  baseMinLevel100: number;
  baseMaxLevel100: number;
  boostedMinLevel100: number;
  boostedMaxLevel100: number;
};

export function getDynamaxHpMultipliers(): { min: number; max: number } {
  return {
    min: DYNAMAX_MIN_MULTIPLIER,
    max: DYNAMAX_MAX_MULTIPLIER,
  };
}

export function buildDynamaxHpPreview(baseHp: number): DynamaxHpPreview {
  const baseMinLevel100 = calcStatMinLevel100(baseHp, true);
  const baseMaxLevel100 = calcStatMaxLevel100(baseHp, true);

  return {
    baseMinLevel100,
    baseMaxLevel100,
    boostedMinLevel100: Math.floor(baseMinLevel100 * DYNAMAX_MIN_MULTIPLIER),
    boostedMaxLevel100: Math.floor(baseMaxLevel100 * DYNAMAX_MAX_MULTIPLIER),
  };
}
