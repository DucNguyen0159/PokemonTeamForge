import { describe, expect, it } from "vitest";

import {
  getGuestTeamSyncSummary,
  guestTeamSyncDismissKey,
  hasMeaningfulGuestTeam,
} from "@/lib/team/guest-team-sync";
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

describe("guest team sync helpers", () => {
  it("does not prompt for empty or already saved teams", () => {
    expect(hasMeaningfulGuestTeam(createTeam())).toBe(false);
    expect(hasMeaningfulGuestTeam(createTeam({ id: "cloud-team-id", name: "Rain" }))).toBe(false);
  });

  it("detects meaningful local guest teams", () => {
    const team = createTeam({
      pokemon: createTeam().pokemon.map((slot) =>
        slot.slot === 1 ? { ...slot, pokemon: samplePokemon } : slot,
      ),
    });

    expect(hasMeaningfulGuestTeam(team)).toBe(true);
    expect(getGuestTeamSyncSummary(team)).toMatchObject({
      pokemonCount: 1,
      moveCount: 0,
      hasCustomName: false,
    });
  });

  it("includes team content in dismissal keys", () => {
    const firstTeam = createTeam({ name: "Team A" });
    const secondTeam = createTeam({ name: "Team B" });

    expect(guestTeamSyncDismissKey("user-1", firstTeam)).not.toBe(
      guestTeamSyncDismissKey("user-1", secondTeam),
    );
  });
});
