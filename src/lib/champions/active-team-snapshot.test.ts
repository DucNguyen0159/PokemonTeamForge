import { describe, expect, it } from "vitest";

import {
  buildActiveTeamNextStep,
  buildActiveTeamSnapshot,
  hasMeaningfulChampionsTeam,
} from "@/lib/champions/active-team-snapshot";
import type { ChampionsTeam } from "@/types/champions";

function createTeam(overrides: Partial<ChampionsTeam> = {}): ChampionsTeam {
  const base: ChampionsTeam = {
    name: "Untitled Champions Team",
    mode: "champions",
    format: "singles",
    formatSupport: "both",
    rulesetId: "champions-v1",
    pokemon: Array.from({ length: 6 }, (_, index) => ({
      id: `slot-${index + 1}`,
      slot: index + 1,
      pokemonId: null,
      pokemonName: "",
      ability: "",
      item: "",
      moves: ["", "", "", ""],
      statAlignment: "Serious",
      sp: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
    })),
    battlePlans: [],
    teamNotes: "",
    isPublic: false,
  };
  return { ...base, ...overrides };
}

function fillSlot(team: ChampionsTeam, slot: number, name: string): ChampionsTeam {
  return {
    ...team,
    pokemon: team.pokemon.map((entry) =>
      entry.slot === slot
        ? {
            ...entry,
            pokemonName: name,
            ability: "Overgrow",
            moves: ["Tackle", "Growl", "", ""],
            sp: { hp: 11, atk: 11, def: 11, spa: 11, spd: 11, spe: 11 },
          }
        : entry,
    ),
  };
}

describe("buildActiveTeamSnapshot", () => {
  it("counts roster fill and SP totals", () => {
    let team = createTeam();
    team = fillSlot(team, 1, "Pelipper");
    team = fillSlot(team, 2, "Swampert");

    const snapshot = buildActiveTeamSnapshot(team);
    expect(snapshot.rosterFilled).toBe(2);
    expect(snapshot.firstEmptySlot).toBe(3);
    expect(snapshot.spBudgetTotal).toBe(132);
    expect(snapshot.spAllocatedTotal).toBe(132);
  });

  it("detects duplicate species errors", () => {
    let team = createTeam();
    for (let slot = 1; slot <= 6; slot += 1) {
      team = fillSlot(team, slot, "Pelipper");
    }
    const snapshot = buildActiveTeamSnapshot(team);
    expect(snapshot.errorCount).toBeGreaterThan(0);
  });
});

describe("buildActiveTeamNextStep", () => {
  it("routes empty roster to presets", () => {
    const snapshot = buildActiveTeamSnapshot(createTeam());
    const step = buildActiveTeamNextStep(snapshot);
    expect(step.label).toBe("Browse Strategy Presets");
    expect(step.href).toContain("/presets");
  });

  it("routes incomplete roster to first empty slot", () => {
    let team = fillSlot(createTeam(), 1, "Pelipper");
    const snapshot = buildActiveTeamSnapshot(team);
    const step = buildActiveTeamNextStep(snapshot);
    expect(step.label).toBe("Fill slot 2");
    expect(step.href).toContain("slot=2");
  });

  it("routes full roster without plans to builder plans tab", () => {
    let team = createTeam();
    for (let slot = 1; slot <= 6; slot += 1) {
      team = fillSlot(team, slot, `Mon${slot}`);
    }
    const snapshot = buildActiveTeamSnapshot(team);
    expect(snapshot.errorCount).toBe(0);
    const step = buildActiveTeamNextStep(snapshot);
    expect(step.label).toBe("Create your first battle plan");
    expect(step.href).toContain("tab=plans");
  });

  it("routes saved clean team to publish", () => {
    let team = createTeam({ id: "team-1", isPublic: false });
    for (let slot = 1; slot <= 6; slot += 1) {
      team = fillSlot(team, slot, `Mon${slot}`);
    }
    team = {
      ...team,
      battlePlans: [
        {
          id: "plan-1",
          name: "Standard",
          format: "single",
          matchupLabel: "Balanced",
          selectedPokemonIds: ["slot-1", "slot-2", "slot-3"],
          leadPokemonIds: ["slot-1"],
        },
      ],
    };
    const snapshot = buildActiveTeamSnapshot(team);
    const step = buildActiveTeamNextStep(snapshot, team);
    expect(step.label).toBe("Publish to Community");
  });
});

describe("hasMeaningfulChampionsTeam", () => {
  it("returns false for empty default team", () => {
    expect(hasMeaningfulChampionsTeam(createTeam())).toBe(false);
  });

  it("returns true when any slot is filled", () => {
    expect(hasMeaningfulChampionsTeam(fillSlot(createTeam(), 1, "Pelipper"))).toBe(true);
  });
});
