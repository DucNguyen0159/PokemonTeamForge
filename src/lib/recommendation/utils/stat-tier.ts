import type { StatTier } from "@/types/shared";

export function getStatTier(value: number): Exclude<StatTier, "any"> {
  if (value < 70) {
    return "low";
  }

  if (value <= 100) {
    return "medium";
  }

  if (value <= 130) {
    return "high";
  }

  return "very_high";
}

export function statMatchesTier(value: number, tier: StatTier): boolean {
  if (tier === "any") {
    return true;
  }

  return getStatTier(value) === tier;
}

