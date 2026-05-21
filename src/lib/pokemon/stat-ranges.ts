import type { PokemonBaseStats } from "@/types/pokemon";

export type StatKey =
  | "hp"
  | "attack"
  | "defense"
  | "specialAttack"
  | "specialDefense"
  | "speed";

export type StatBarTier = "low" | "mid" | "high";

export interface StatRangeRow {
  key: StatKey;
  label: string;
  base: number;
  minLevel100: number;
  maxLevel100: number;
}

const LEVEL = 100;
const MAX_IV = 31;
const MAX_EV_BLOCK = Math.floor(252 / 4);
const BENEFICIAL_NATURE = 1.1;
const STAT_BAR_MAX = 255;

function calcHpLevel100(base: number, iv: number, evBlock: number): number {
  return Math.floor(((2 * base + iv + evBlock) * LEVEL) / 100) + LEVEL + 10;
}

function calcOtherLevel100(
  base: number,
  iv: number,
  evBlock: number,
  natureMultiplier: number,
): number {
  const core = Math.floor(((2 * base + iv + evBlock) * LEVEL) / 100) + 5;
  return Math.floor(core * natureMultiplier);
}

export function calcStatMinLevel100(base: number, isHp: boolean): number {
  if (isHp) {
    return calcHpLevel100(base, 0, 0);
  }

  return calcOtherLevel100(base, 0, 0, 1);
}

export function calcStatMaxLevel100(base: number, isHp: boolean): number {
  if (isHp) {
    return calcHpLevel100(base, MAX_IV, MAX_EV_BLOCK);
  }

  return calcOtherLevel100(base, MAX_IV, MAX_EV_BLOCK, BENEFICIAL_NATURE);
}

export function buildStatRangeRows(stats: PokemonBaseStats): StatRangeRow[] {
  return [
    {
      key: "hp",
      label: "HP",
      base: stats.hp,
      minLevel100: calcStatMinLevel100(stats.hp, true),
      maxLevel100: calcStatMaxLevel100(stats.hp, true),
    },
    {
      key: "attack",
      label: "Attack",
      base: stats.attack,
      minLevel100: calcStatMinLevel100(stats.attack, false),
      maxLevel100: calcStatMaxLevel100(stats.attack, false),
    },
    {
      key: "defense",
      label: "Defense",
      base: stats.defense,
      minLevel100: calcStatMinLevel100(stats.defense, false),
      maxLevel100: calcStatMaxLevel100(stats.defense, false),
    },
    {
      key: "specialAttack",
      label: "Sp. Atk",
      base: stats.specialAttack,
      minLevel100: calcStatMinLevel100(stats.specialAttack, false),
      maxLevel100: calcStatMaxLevel100(stats.specialAttack, false),
    },
    {
      key: "specialDefense",
      label: "Sp. Def",
      base: stats.specialDefense,
      minLevel100: calcStatMinLevel100(stats.specialDefense, false),
      maxLevel100: calcStatMaxLevel100(stats.specialDefense, false),
    },
    {
      key: "speed",
      label: "Speed",
      base: stats.speed,
      minLevel100: calcStatMinLevel100(stats.speed, false),
      maxLevel100: calcStatMaxLevel100(stats.speed, false),
    },
  ];
}

export function statBarWidthPercent(base: number): number {
  return Math.min(100, Math.round((base / STAT_BAR_MAX) * 100));
}

export function statBarTier(base: number): StatBarTier {
  if (base < 60) {
    return "low";
  }

  if (base <= 90) {
    return "mid";
  }

  return "high";
}

export function statBarColorClass(tier: StatBarTier): string {
  switch (tier) {
    case "low":
      return "bg-orange-500/85";
    case "mid":
      return "bg-amber-400/85";
    case "high":
      return "bg-emerald-500/85";
  }
}
