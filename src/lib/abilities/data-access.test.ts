import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildAbilityListSearchParams,
  fetchAbilitiesFromApi,
  fetchAbilityDetailFromApi,
} from "@/lib/abilities/data-access";

describe("ability data access", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("builds ability list query params", () => {
    const params = buildAbilityListSearchParams({
      search: "  drain  ",
      tag: "healing",
      limit: 25,
    });

    expect(params.get("search")).toBe("drain");
    expect(params.get("tag")).toBe("healing");
    expect(params.get("limit")).toBe("25");
  });

  it("fetches ability list payloads", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          abilities: [
            {
              id: 144,
              name: "Regenerator",
              slug: "regenerator",
              description: "Restores HP when switching out.",
              tags: ["healing", "switching"],
            },
          ],
          total: 1,
        },
      }),
    });

    vi.stubGlobal("fetch", fetchMock);
    const payload = await fetchAbilitiesFromApi({ tag: "healing", limit: 25 });

    expect(fetchMock).toHaveBeenCalledWith("/api/abilities?tag=healing&limit=25");
    expect(payload.abilities[0]?.slug).toBe("regenerator");
  });

  it("fetches ability detail payloads", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          id: 22,
          name: "Intimidate",
          slug: "intimidate",
          description: "Lowers opposing Attack on switch-in.",
          tags: ["switching", "defense_boost", "utility"],
          pokemon: [
            {
              id: 59,
              name: "Arcanine",
              slug: "arcanine",
              primaryType: "fire",
              secondaryType: null,
              spriteNormal: "/arcanine.png",
              isHidden: true,
              hiddenLabel: "(hidden)",
            },
          ],
        },
      }),
    });

    vi.stubGlobal("fetch", fetchMock);
    const detail = await fetchAbilityDetailFromApi("intimidate");

    expect(fetchMock).toHaveBeenCalledWith("/api/abilities/intimidate");
    expect(detail.pokemon[0]?.hiddenLabel).toBe("(hidden)");
  });
});
