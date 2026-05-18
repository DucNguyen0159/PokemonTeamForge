import { describe, expect, it } from "vitest";

import { filterAndSortSavedTeams } from "@/lib/team/saved-team-filters";
import type { SavedTeamSummary } from "@/types/saved-team";

function team(overrides: Partial<SavedTeamSummary>): SavedTeamSummary {
  return {
    id: "team",
    name: "Untitled Team",
    format: "singles",
    isPublic: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    filledSlotCount: 0,
    pokemonPreviews: [],
    ...overrides,
  };
}

describe("filterAndSortSavedTeams", () => {
  it("filters by name, format, and preview Pokémon", () => {
    const teams = [
      team({ id: "rain", name: "Rain Core", format: "doubles" }),
      team({
        id: "offense",
        name: "Weatherless Offense",
        pokemonPreviews: [
          {
            id: 149,
            name: "Dragonite",
            slug: "dragonite",
            spriteNormal: null,
            slot: 1,
          },
        ],
      }),
    ];

    expect(filterAndSortSavedTeams(teams, { search: "rain", format: "all", sort: "recent" })).toHaveLength(1);
    expect(filterAndSortSavedTeams(teams, { search: "double", format: "all", sort: "recent" })).toHaveLength(1);
    expect(filterAndSortSavedTeams(teams, { search: "dragon", format: "all", sort: "recent" })).toHaveLength(1);
  });

  it("filters by format and sorts by filled slots", () => {
    const teams = [
      team({ id: "one", name: "One", format: "doubles", filledSlotCount: 1 }),
      team({ id: "full", name: "Full", format: "doubles", filledSlotCount: 6 }),
      team({ id: "singles", name: "Singles", format: "singles", filledSlotCount: 6 }),
    ];

    expect(
      filterAndSortSavedTeams(teams, { search: "", format: "doubles", sort: "filled" }).map(
        (entry) => entry.id,
      ),
    ).toEqual(["full", "one"]);
  });
});
