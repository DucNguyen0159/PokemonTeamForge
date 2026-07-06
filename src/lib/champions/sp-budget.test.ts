import { describe, expect, it } from "vitest";

import {
  CHAMPIONS_SP_BUDGET,
  CHAMPIONS_SP_STAT_CAP,
  clampSpValue,
  slotSpTotal,
  spBudgetStatus,
} from "@/lib/champions/sp-budget";

describe("slotSpTotal", () => {
  it("sums all stat values", () => {
    expect(
      slotSpTotal({ hp: 4, atk: 28, def: 0, spa: 28, spd: 4, spe: 2 }),
    ).toBe(66);
  });
});

describe("clampSpValue", () => {
  const base = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };

  it("clamps to stat cap", () => {
    expect(clampSpValue(base, "atk", 99).atk).toBe(CHAMPIONS_SP_STAT_CAP);
  });

  it("respects total budget", () => {
    const spread = { hp: 32, atk: 32, def: 2, spa: 0, spd: 0, spe: 0 };
    expect(clampSpValue(spread, "def", 32).def).toBe(2);
  });

  it("rejects negative values", () => {
    expect(clampSpValue(base, "spe", -5).spe).toBe(0);
  });
});

describe("spBudgetStatus", () => {
  it("returns ok at exact budget", () => {
    expect(spBudgetStatus(CHAMPIONS_SP_BUDGET)).toBe("ok");
  });

  it("returns warning when under budget", () => {
    expect(spBudgetStatus(60)).toBe("warning");
  });

  it("returns error when over budget", () => {
    expect(spBudgetStatus(67)).toBe("error");
  });
});
