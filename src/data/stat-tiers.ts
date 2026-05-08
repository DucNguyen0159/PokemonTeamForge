import type { StatTier } from "@/types/shared";

export interface StatTierRange {
  min: number;
  max: number;
}

export interface StatTierDefinition {
  low: StatTierRange;
  medium: StatTierRange;
  high: StatTierRange;
  very_high: StatTierRange;
}

export const ATTACK_TIER_RANGES: StatTierDefinition = {
  low: { min: 0, max: 69 },
  medium: { min: 70, max: 110 },
  high: { min: 111, max: 130 },
  very_high: { min: 131, max: 999 },
};

export const DEFENSE_TIER_RANGES: StatTierDefinition = {
  low: { min: 0, max: 69 },
  medium: { min: 70, max: 100 },
  high: { min: 101, max: 130 },
  very_high: { min: 131, max: 999 },
};

export const SPECIAL_ATTACK_TIER_RANGES: StatTierDefinition = {
  low: { min: 0, max: 69 },
  medium: { min: 70, max: 110 },
  high: { min: 111, max: 130 },
  very_high: { min: 131, max: 999 },
};

export const SPECIAL_DEFENSE_TIER_RANGES: StatTierDefinition = {
  low: { min: 0, max: 69 },
  medium: { min: 70, max: 100 },
  high: { min: 101, max: 130 },
  very_high: { min: 131, max: 999 },
};

export const SPEED_TIER_RANGES: StatTierDefinition = {
  low: { min: 0, max: 59 },
  medium: { min: 60, max: 100 },
  high: { min: 101, max: 130 },
  very_high: { min: 131, max: 999 },
};

export const STAT_TIER_RANGES = {
  attack: ATTACK_TIER_RANGES,
  defense: DEFENSE_TIER_RANGES,
  specialAttack: SPECIAL_ATTACK_TIER_RANGES,
  specialDefense: SPECIAL_DEFENSE_TIER_RANGES,
  speed: SPEED_TIER_RANGES,
} as const;

export function getStatTier(
  value: number,
  ranges: StatTierDefinition,
): Exclude<StatTier, "any"> {
  if (value <= ranges.low.max) {
    return "low";
  }
  if (value <= ranges.medium.max) {
    return "medium";
  }
  if (value <= ranges.high.max) {
    return "high";
  }
  return "very_high";
}
