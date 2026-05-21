import { describe, expect, it } from "vitest";

import { hasAlternateFormsSection } from "@/components/pokemon/pokemon-alternate-forms";
import type { AlternateForm } from "@/lib/pokemon/pokemon-forms";

describe("hasAlternateFormsSection", () => {
  it("returns false when there are no alternate forms", () => {
    expect(hasAlternateFormsSection(undefined, undefined)).toBe(false);
    expect(hasAlternateFormsSection([], {})).toBe(false);
  });

  it("returns true when alternate form siblings exist", () => {
    const venusaurMega: AlternateForm = {
      formKind: "mega",
      slug: "venusaur-mega",
      name: "Mega Venusaur",
      primaryType: "grass",
      secondaryType: "poison",
      total: 625,
      spriteNormal: "",
      pokedexDisplayNo: 3,
      listSortRank: 31,
    };

    expect(hasAlternateFormsSection([venusaurMega], { mega: [venusaurMega] })).toBe(true);
  });
});
