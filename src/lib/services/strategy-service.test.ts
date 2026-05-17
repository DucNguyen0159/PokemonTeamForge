import { describe, expect, it } from "vitest";
import { hydrateStrategyPresetWithResolvers } from "@/lib/services/strategy-hydrator";
import type { StrategyTeamPreset } from "@/data/strategy-teams";

const preset: StrategyTeamPreset = {
  id: "test",
  name: "Test Team",
  slug: "test-team",
  strategyType: "balance",
  format: "singles",
  difficulty: "beginner",
  tags: ["test"],
  shortDescription: "test",
  pokemon: [
    {
      slot: 1,
      pokemonSlug: "pikachu",
      abilityName: "Static",
      itemName: "Leftovers",
      moveNames: ["Thunderbolt", "Volt Tackle"],
      role: "speed_control",
      explanation: "test slot",
    },
  ],
};

describe("strategy preset hydration", () => {
  it("hydrates from shared resolver sources", async () => {
    const hydrated = await hydrateStrategyPresetWithResolvers(preset, {
      resolvePokemon: async () => ({
        id: 25,
        name: "Pikachu",
        slug: "pikachu",
        generation: 1,
        region: "kanto",
        primaryType: "electric",
        secondaryType: null,
        stats: {
          hp: 35,
          attack: 55,
          defense: 40,
          specialAttack: 50,
          specialDefense: 50,
          speed: 90,
          total: 320,
        },
        spriteNormal: "/pikachu.png",
        spriteShiny: null,
        isLegendaryOrMythical: false,
        isFullyEvolved: false,
        roles: ["speed_control"],
        abilities: [{ id: 1, name: "Static", slug: "static", description: "" }],
        moves: [
          {
            id: 1,
            name: "Thunderbolt",
            slug: "thunderbolt",
            type: "electric",
            category: "special",
            power: 90,
            accuracy: 100,
            pp: 15,
            priority: 0,
          },
        ],
      }),
      resolveItem: () => ({
        id: 1,
        name: "Leftovers",
        slug: "leftovers",
      }),
    });

    expect(hydrated.pokemon[0].pokemon.slug).toBe("pikachu");
    expect(hydrated.pokemon[0].ability.name).toBe("Static");
    expect(hydrated.pokemon[0].item.name).toBe("Leftovers");
  });

  it("throws when preset references missing Pokemon", async () => {
    await expect(
      hydrateStrategyPresetWithResolvers(preset, {
        resolvePokemon: async () => null,
        resolveItem: () => ({ id: 1, name: "Leftovers", slug: "leftovers" }),
      }),
    ).rejects.toThrow(/unknown Pokemon/i);
  });
});
