import { describe, expect, it } from "vitest";

import type { AlternateForm } from "@/lib/pokemon/pokemon-forms";
import {
  buildListFormFields,
  classifyPokemonFormFromSlug,
  comparePokemonListByNationalDex,
  groupAlternateFormsByKind,
  resolveEvolutionHighlightSlug,
} from "@/lib/pokemon/pokemon-forms";

describe("classifyPokemonFormFromSlug", () => {
  it("classifies mega, gigantamax, and regional slugs", () => {
    expect(classifyPokemonFormFromSlug("venusaur-mega").formKind).toBe("mega");
    expect(classifyPokemonFormFromSlug("venusaur-gmax").formKind).toBe("gigantamax");
    expect(classifyPokemonFormFromSlug("slowbro-galar").formKind).toBe("regional");
  });

  it("treats standard species as default", () => {
    expect(classifyPokemonFormFromSlug("meganium")).toEqual({
      formKind: "default",
      baseSlug: null,
    });
  });
});

describe("comparePokemonListByNationalDex", () => {
  it("orders Venusaur display group before Charmander", () => {
    const venusaur = { id: 3, pokedexDisplayNo: 3, listSortRank: 30 };
    const venusaurMega = { id: 10033, pokedexDisplayNo: 3, listSortRank: 31 };
    const charmander = { id: 4, pokedexDisplayNo: 4, listSortRank: 40 };

    expect(comparePokemonListByNationalDex(venusaur, venusaurMega)).toBeLessThan(0);
    expect(comparePokemonListByNationalDex(venusaurMega, charmander)).toBeLessThan(0);
  });

  it("orders Slowbro default, mega, then regional on display 80", () => {
    const slowbro = { id: 80, pokedexDisplayNo: 80, listSortRank: 800 };
    const slowbroMega = { id: 10071, pokedexDisplayNo: 80, listSortRank: 801 };
    const slowbroGalar = { id: 10172, pokedexDisplayNo: 80, listSortRank: 803 };

    expect(comparePokemonListByNationalDex(slowbro, slowbroMega)).toBeLessThan(0);
    expect(comparePokemonListByNationalDex(slowbroMega, slowbroGalar)).toBeLessThan(0);
  });
});

describe("groupAlternateFormsByKind", () => {
  it("groups mega and regional siblings separately", () => {
    const forms: AlternateForm[] = [
      {
        formKind: "regional",
        slug: "slowbro-galar",
        name: "Galarian Slowbro",
        primaryType: "poison",
        secondaryType: "psychic",
        total: 490,
        spriteNormal: "",
        pokedexDisplayNo: 80,
        listSortRank: 803,
      },
      {
        formKind: "mega",
        slug: "slowbro-mega",
        name: "Mega Slowbro",
        primaryType: "water",
        secondaryType: "psychic",
        total: 590,
        spriteNormal: "",
        pokedexDisplayNo: 80,
        listSortRank: 801,
      },
    ];

    const grouped = groupAlternateFormsByKind(forms);

    expect(grouped.mega?.map((entry) => entry.slug)).toEqual(["slowbro-mega"]);
    expect(grouped.regional?.map((entry) => entry.slug)).toEqual(["slowbro-galar"]);
  });
});

describe("resolveEvolutionHighlightSlug", () => {
  it("highlights base species when viewing a mega form", () => {
    expect(resolveEvolutionHighlightSlug("venusaur-mega", "mega", "venusaur")).toBe("venusaur");
  });

  it("highlights current slug for default forms", () => {
    expect(resolveEvolutionHighlightSlug("bulbasaur", "default", null)).toBe("bulbasaur");
  });
});

describe("buildListFormFields", () => {
  it("uses explicit display metadata when provided", () => {
    expect(
      buildListFormFields("venusaur-mega", 10033, {
        pokedexDisplayNo: 3,
        formKind: "mega",
        baseSlug: "venusaur",
      }),
    ).toEqual({
      formKind: "mega",
      baseSlug: "venusaur",
      pokedexDisplayNo: 3,
      listSortRank: 31,
    });
  });
});
