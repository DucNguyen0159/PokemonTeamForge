import { describe, expect, it } from "vitest";

import {
  buildPokedexHref,
  buildPokemonDetailHref,
  parsePokedexReturnState,
  resolvePokedexReturnHref,
} from "@/lib/pokemon/pokedex-return-url";

describe("buildPokedexHref", () => {
  it("returns plain pokedex path when state is default", () => {
    expect(buildPokedexHref({})).toBe("/pokedex");
  });

  it("serializes non-default explorer state", () => {
    expect(
      buildPokedexHref({
        view: "table",
        q: "eevee",
        sortBy: "total",
        sortDirection: "desc",
        generation: 1,
        type: "fire",
        ability: "adaptability",
      }),
    ).toBe("/pokedex?view=table&q=eevee&sort=total&dir=desc&gen=1&type=fire&ability=adaptability");
  });
});

describe("parsePokedexReturnState", () => {
  it("round-trips serialized state", () => {
    const params = new URLSearchParams(
      "view=table&q=pika&sort=speed&dir=desc&gen=3&type=electric&ability=static",
    );

    expect(parsePokedexReturnState(params)).toEqual({
      view: "table",
      q: "pika",
      sortBy: "speed",
      sortDirection: "desc",
      generation: 3,
      type: "electric",
      ability: "static",
    });
  });

  it("ignores unsafe values", () => {
    expect(
      parsePokedexReturnState({
        view: "invalid",
        sort: "not-a-stat",
        type: "../x",
        ability: "Bad Ability!",
      }),
    ).toEqual({});
  });
});

describe("buildPokemonDetailHref", () => {
  it("embeds return state in the detail url", () => {
    const { href, storeReturnHrefInSession } = buildPokemonDetailHref("eevee", {
      q: "ee",
      type: "normal",
    });

    expect(storeReturnHrefInSession).toBe(false);
    expect(href).toContain("/pokemon/eevee?");
    expect(href).toContain("from=pokedex");
    expect(href).toContain("q=ee");
    expect(href).toContain("type=normal");
  });

  it("falls back to session storage marker when the url is too long", () => {
    const longQuery = "x".repeat(1180);
    const { href, storeReturnHrefInSession, returnHref } = buildPokemonDetailHref("mewtwo", {
      q: longQuery,
      ability: "pressure",
    });

    expect(storeReturnHrefInSession).toBe(true);
    expect(href).toBe("/pokemon/mewtwo?from=pokedex&pokedexReturn=stored");
    expect(returnHref).toContain(`q=${longQuery}`);
  });
});

describe("resolvePokedexReturnHref", () => {
  it("reconstructs pokedex href from detail query params", () => {
    const params = new URLSearchParams("from=pokedex&q=bulba&type=grass");
    expect(resolvePokedexReturnHref(params)).toBe("/pokedex?q=bulba&type=grass");
  });

  it("returns base pokedex path when session marker is used", () => {
    expect(resolvePokedexReturnHref(new URLSearchParams("from=pokedex&pokedexReturn=stored"))).toBe(
      "/pokedex",
    );
  });
});
