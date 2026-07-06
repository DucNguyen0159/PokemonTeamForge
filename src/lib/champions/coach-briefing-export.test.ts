import { describe, expect, it } from "vitest";

import { formatCoachBriefingExport } from "@/lib/champions/coach-briefing-export";
import type {
  MegaDependencyInsight,
  ReadinessSummary,
  ThreatChecklistEntry,
  WeaknessEntry,
} from "@/lib/champions/matchup-coach-analysis";
import type { ChampionsTeam } from "@/types/champions";

const emptyTeam: ChampionsTeam = {
  name: "Test Squad",
  mode: "champions",
  format: "singles",
  formatSupport: "both",
  rulesetId: "champions-v1",
  pokemon: [
    {
      id: "s1",
      slot: 1,
      pokemonId: 1,
      pokemonName: "Pikachu",
      ability: "Static",
      item: "Light Ball",
      moves: ["Thunderbolt", "Volt Switch", "", ""],
      statAlignment: "Timid",
      sp: { hp: 0, atk: 0, def: 0, spa: 32, spd: 0, spe: 32 },
    },
  ],
  battlePlans: [],
  teamNotes: "",
  isPublic: false,
};

const readiness: ReadinessSummary = {
  score: 7.5,
  label: "Solid foundation",
  alerts: ["Roster incomplete (1/6 slots filled)."],
  tags: ["Strong speed"],
};

const weaknessMap: WeaknessEntry[] = [
  { type: "Ground", weak: 1, resist: 0, immune: 0 },
];

const threatChecklist: ThreatChecklistEntry[] = [
  {
    label: "Physical Ground",
    attackingTypes: ["Ground"],
    defensiveCoverage: 0,
    status: "exposed",
    answers: [],
  },
];

const megaInsight: MegaDependencyInsight = {
  megaUsers: [],
  multipleMegaUsers: false,
  planMissingMega: false,
  warnings: [],
};

describe("formatCoachBriefingExport", () => {
  it("includes team name, readiness, and roster lines", () => {
    const text = formatCoachBriefingExport({
      team: emptyTeam,
      readiness,
      weaknessMap,
      threatChecklist,
      selectedPlan: null,
      planWarnings: [],
      megaInsight,
    });

    expect(text).toContain("Test Squad");
    expect(text).toContain("7.5/10");
    expect(text).toContain("Pikachu");
    expect(text).toContain("Ground");
    expect(text).toContain("Physical Ground");
  });
});
