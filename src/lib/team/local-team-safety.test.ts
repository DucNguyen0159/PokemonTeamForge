import { describe, expect, it } from "vitest";

import {
  getLocalTeamSafetySummary,
  hasMeaningfulLocalTeam,
  shouldWarnBeforeCloudLoad,
} from "@/lib/team/local-team-safety";
import type { Pokemon } from "@/types/pokemon";
import type { Team } from "@/types/team";

const samplePokemon: Pokemon = {
  id: 25,
  name: "Pikachu",
  slug: "pikachu",
  generation: 1,
  region: "Kanto",
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
  spriteNormal: "",
  spriteShiny: null,
  isLegendaryOrMythical: false,
  isFullyEvolved: false,
  abilities: [],
  moves: [],
  roles: [],
};

function createTeam(overrides: Partial<Team> = {}): Team {
  return {
    name: "Untitled Team",
    format: "singles",
    pokemon: Array.from({ length: 6 }, (_, index) => ({
      slot: index + 1,
      pokemon: null,
      selectedAbility: null,
      selectedItem: null,
      moves: [1, 2, 3, 4].map((slot) => ({
        slot: slot as 1 | 2 | 3 | 4,
        move: null,
      })),
      isShiny: false,
    })),
    ...overrides,
  };
}

describe("local team safety helpers", () => {
  it("does not warn for empty local builder state", () => {
    const team = createTeam();

    expect(hasMeaningfulLocalTeam(team)).toBe(false);
    expect(shouldWarnBeforeCloudLoad(team, "cloud-team-id")).toBe(false);
  });

  it("summarizes meaningful local builder state", () => {
    const team = createTeam({
      name: "Local Draft",
      pokemon: createTeam().pokemon.map((slot) =>
        slot.slot === 1 ? { ...slot, pokemon: samplePokemon } : slot,
      ),
    });

    expect(hasMeaningfulLocalTeam(team)).toBe(true);
    expect(getLocalTeamSafetySummary(team)).toMatchObject({
      pokemonCount: 1,
      hasCustomName: true,
      isCloudTeam: false,
    });
  });

  it("warns before replacing different meaningful cloud or local work", () => {
    const team = createTeam({
      id: "current-cloud-team",
      pokemon: createTeam().pokemon.map((slot) =>
        slot.slot === 1 ? { ...slot, pokemon: samplePokemon } : slot,
      ),
    });

    expect(shouldWarnBeforeCloudLoad(team, "current-cloud-team")).toBe(false);
    expect(shouldWarnBeforeCloudLoad(team, "different-cloud-team")).toBe(true);
  });
});
