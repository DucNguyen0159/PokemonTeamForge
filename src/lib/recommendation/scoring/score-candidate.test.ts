import { describe, expect, it } from "vitest";

import { scoreCandidate } from "@/lib/recommendation/scoring/score-candidate";
import type { TeamAnalysis } from "@/lib/recommendation/types";
import type { Pokemon } from "@/types/pokemon";
import type { RecommendationFilters } from "@/types/recommendation";
import type { Team } from "@/types/team";

const baseTeam: Team = {
  name: "Test Team",
  format: "singles",
  pokemon: [],
};

const baseAnalysis: TeamAnalysis = {
  team: baseTeam,
  presentRoles: new Set(),
  missingRoles: [],
  duplicateRoles: [],
  majorWeaknesses: [],
  missingCoverage: [],
  teamTypeCounts: new Map(),
};

const baseFilters: RecommendationFilters = {
  excludeLegendaryOrMythical: true,
  region: "all",
  generation: "all",
  type: "all",
  role: "all",
  format: "singles",
  attackTier: "any",
  defenseTier: "any",
  specialAttackTier: "any",
  specialDefenseTier: "any",
  speedTier: "any",
};

function createCandidate(overrides: Partial<Pokemon>): Pokemon {
  return {
    id: 1,
    name: "Candidate",
    slug: "candidate",
    generation: 1,
    region: "Kanto",
    primaryType: "normal",
    secondaryType: null,
    stats: {
      hp: 80,
      attack: 80,
      defense: 80,
      specialAttack: 80,
      specialDefense: 80,
      speed: 80,
      total: 480,
    },
    spriteNormal: "",
    spriteShiny: null,
    isLegendaryOrMythical: false,
    isFullyEvolved: true,
    abilities: [],
    moves: [],
    roles: [],
    ...overrides,
  };
}

describe("scoreCandidate ability synergy", () => {
  it("rewards ability-based immunity against major team weaknesses", () => {
    const scored = scoreCandidate(
      createCandidate({
        abilities: [
          {
            id: 26,
            name: "Levitate",
            slug: "levitate",
            description: "Immune to Ground-type moves.",
          },
        ],
      }),
      {
        ...baseAnalysis,
        majorWeaknesses: ["ground"],
      },
      baseFilters,
    );

    const abilityReason = scored.reasons.find((reason) => reason.type === "ability_synergy");
    expect(abilityReason?.message).toContain("Ground immunity");
    expect(abilityReason?.scoreImpact).toBeGreaterThan(0);
  });

  it("mentions multi-target support ability value in doubles", () => {
    const scored = scoreCandidate(
      createCandidate({
        abilities: [
          {
            id: 22,
            name: "Intimidate",
            slug: "intimidate",
            description: "Lowers opposing Attack on switch-in.",
          },
        ],
      }),
      baseAnalysis,
      {
        ...baseFilters,
        format: "doubles",
      },
    );

    const abilityReason = scored.reasons.find((reason) => reason.type === "ability_synergy");
    expect(abilityReason?.message).toContain("multi-target formats");
  });

  it("uses recovery and utility tags for ability explanations", () => {
    const scored = scoreCandidate(
      createCandidate({
        abilities: [
          {
            id: 144,
            name: "Regenerator",
            slug: "regenerator",
            description: "Restores HP when switching out.",
          },
        ],
      }),
      baseAnalysis,
      baseFilters,
    );

    const abilityReason = scored.reasons.find((reason) => reason.type === "ability_synergy");
    expect(abilityReason?.message).toContain("recovery value");
    expect(abilityReason?.message).toContain("flexible utility");
  });
});
