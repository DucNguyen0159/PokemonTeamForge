import type { ChampionsSpSpread } from "@/types/champions";

export const CHAMPIONS_SP_BUDGET = 66;
export const CHAMPIONS_SP_STAT_CAP = 32;

export function slotSpTotal(sp: ChampionsSpSpread): number {
  return sp.hp + sp.atk + sp.def + sp.spa + sp.spd + sp.spe;
}

export function clampSpValue(
  current: ChampionsSpSpread,
  stat: keyof ChampionsSpSpread,
  nextRawValue: number,
): ChampionsSpSpread {
  const requested = Math.max(
    0,
    Math.min(CHAMPIONS_SP_STAT_CAP, Math.floor(Number.isFinite(nextRawValue) ? nextRawValue : 0)),
  );
  const otherTotal = slotSpTotal(current) - current[stat];
  const maxAllowed = Math.max(0, Math.min(CHAMPIONS_SP_STAT_CAP, CHAMPIONS_SP_BUDGET - otherTotal));
  return { ...current, [stat]: Math.min(requested, maxAllowed) };
}

export function spBudgetStatus(total: number): "ok" | "warning" | "error" {
  if (total > CHAMPIONS_SP_BUDGET) {
    return "error";
  }
  if (total < CHAMPIONS_SP_BUDGET) {
    return "warning";
  }
  return "ok";
}
