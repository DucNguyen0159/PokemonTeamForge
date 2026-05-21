import { describe, expect, it } from "vitest";

import {
  buildStatRangeRows,
  calcStatMaxLevel100,
  calcStatMinLevel100,
  statBarTier,
  statBarWidthPercent,
} from "@/lib/pokemon/stat-ranges";

describe("calcStatMinLevel100", () => {
  it("calculates HP minimum with 0 IV and 0 EV", () => {
    expect(calcStatMinLevel100(45, true)).toBe(200);
  });

  it("calculates other stats minimum with neutral nature", () => {
    expect(calcStatMinLevel100(49, false)).toBe(103);
  });
});

describe("calcStatMaxLevel100", () => {
  it("calculates HP maximum with 31 IV and 252 EV", () => {
    expect(calcStatMaxLevel100(45, true)).toBe(294);
  });

  it("applies beneficial nature to non-HP stats", () => {
    expect(calcStatMaxLevel100(49, false)).toBe(216);
  });
});

describe("buildStatRangeRows", () => {
  it("returns six stat rows plus usable totals", () => {
    const rows = buildStatRangeRows({
      hp: 45,
      attack: 49,
      defense: 49,
      specialAttack: 65,
      specialDefense: 65,
      speed: 45,
      total: 318,
    });

    expect(rows).toHaveLength(6);
    expect(rows[0]?.minLevel100).toBeLessThan(rows[0]?.maxLevel100 ?? 0);
  });
});

describe("stat bar helpers", () => {
  it("scales base stats against 255", () => {
    expect(statBarWidthPercent(255)).toBe(100);
    expect(statBarWidthPercent(128)).toBe(50);
  });

  it("assigns color tiers by base value", () => {
    expect(statBarTier(50)).toBe("low");
    expect(statBarTier(75)).toBe("mid");
    expect(statBarTier(120)).toBe("high");
  });
});
