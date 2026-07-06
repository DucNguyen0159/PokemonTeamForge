import { describe, expect, it } from "vitest";

import { getLegalityAnchor, slotHasLegalityError } from "@/lib/champions/legality-anchors";
import { clampSpValue, slotSpTotal, spBudgetStatus } from "@/lib/champions/sp-budget";

describe("legality-anchors", () => {
  it("maps SP issues to slot sp field", () => {
    const anchor = getLegalityAnchor({
      severity: "error",
      message: "Slot 2 (Hawlucha) exceeds SP limit: 70/66.",
    });
    expect(anchor).toEqual({ kind: "slot", slot: 2, field: "sp" });
  });

  it("detects slot errors", () => {
    const issues = [
      { severity: "error" as const, message: "Slot 3 (X) exceeds SP limit: 70/66." },
      { severity: "warning" as const, message: "Team name is empty." },
    ];
    expect(slotHasLegalityError(issues, 3)).toBe(true);
    expect(slotHasLegalityError(issues, 1)).toBe(false);
  });
});

describe("sp-budget", () => {
  it("clamps stat values to team budget", () => {
    const sp = { hp: 32, atk: 32, def: 0, spa: 0, spd: 0, spe: 0 };
    const next = clampSpValue(sp, "def", 20);
    expect(next.def).toBe(2);
    expect(slotSpTotal(next)).toBe(66);
  });

  it("reports budget status", () => {
    expect(spBudgetStatus(66)).toBe("ok");
    expect(spBudgetStatus(60)).toBe("warning");
    expect(spBudgetStatus(67)).toBe("error");
  });
});
