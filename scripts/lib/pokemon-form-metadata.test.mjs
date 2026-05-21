import { describe, expect, it } from "vitest";

import {
  applyPokemonFormMetadata,
  classifyPokemonForm,
} from "./pokemon-form-metadata.mjs";

describe("classifyPokemonForm", () => {
  it("classifies mega and gigantamax suffixes", () => {
    expect(classifyPokemonForm("venusaur-mega")).toEqual({
      form_kind: "mega",
      base_slug: "venusaur",
    });
    expect(classifyPokemonForm("charizard-mega-x")).toEqual({
      form_kind: "mega",
      base_slug: "charizard",
    });
    expect(classifyPokemonForm("venusaur-gmax")).toEqual({
      form_kind: "gigantamax",
      base_slug: "venusaur",
    });
  });

  it("classifies regional prefix and suffix forms", () => {
    expect(classifyPokemonForm("slowbro-galar")).toEqual({
      form_kind: "regional",
      base_slug: "slowbro",
    });
    expect(classifyPokemonForm("galarian-slowpoke")).toEqual({
      form_kind: "regional",
      base_slug: "slowpoke",
    });
  });

  it("treats standard species as default", () => {
    expect(classifyPokemonForm("meganium")).toEqual({
      form_kind: "default",
      base_slug: null,
    });
    expect(classifyPokemonForm("ditto")).toEqual({
      form_kind: "default",
      base_slug: null,
    });
  });
});

describe("applyPokemonFormMetadata", () => {
  it("groups Venusaur forms under display number 3", () => {
    const rows = [
      { id: 3, slug: "venusaur", species_slug: "venusaur" },
      { id: 10033, slug: "venusaur-mega", species_slug: "venusaur" },
      { id: 10195, slug: "venusaur-gmax", species_slug: "venusaur" },
    ];

    applyPokemonFormMetadata(rows);

    expect(rows.map((row) => row.pokedex_display_no)).toEqual([3, 3, 3]);
    expect(rows.map((row) => row.form_kind)).toEqual(["default", "mega", "gigantamax"]);
    expect(rows.map((row) => row.list_sort_rank)).toEqual([30, 31, 32]);
  });

  it("orders Slowbro default, mega, then regional on display 80", () => {
    const rows = [
      { id: 80, slug: "slowbro", species_slug: "slowbro" },
      { id: 10071, slug: "slowbro-mega", species_slug: "slowbro" },
      { id: 10172, slug: "slowbro-galar", species_slug: "slowbro" },
    ];

    applyPokemonFormMetadata(rows);

    expect(rows.every((row) => row.pokedex_display_no === 80)).toBe(true);
    expect(rows.map((row) => row.list_sort_rank)).toEqual([800, 801, 803]);
    expect(rows.find((row) => row.slug === "slowbro-galar")?.form_kind).toBe("regional");
  });
});
