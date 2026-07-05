import { describe, expect, it } from "vitest";

import { resolvePokemonSlug } from "@/lib/pokemon/pokemon-slug-aliases";

describe("resolvePokemonSlug", () => {
  it("maps gendered and form species to canonical slugs", () => {
    expect(resolvePokemonSlug("Indeedee")).toBe("indeedee-female");
    expect(resolvePokemonSlug("Meowstic")).toBe("meowstic-male");
    expect(resolvePokemonSlug("Mimikyu")).toBe("mimikyu-disguised");
    expect(resolvePokemonSlug("Basculegion")).toBe("basculegion-male");
    expect(resolvePokemonSlug("Aegislash")).toBe("aegislash-shield");
    expect(resolvePokemonSlug("Maushold")).toBe("maushold-family-of-four");
  });

  it("passes through slugs that are already canonical", () => {
    expect(resolvePokemonSlug("pelipper")).toBe("pelipper");
    expect(resolvePokemonSlug("indeedee-female")).toBe("indeedee-female");
  });
});
