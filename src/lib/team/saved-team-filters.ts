import type { SavedTeamSummary } from "@/types/saved-team";
import type { BattleFormat } from "@/types/shared";

export type SavedTeamFormatFilter = BattleFormat | "all";
export type SavedTeamSortOption = "recent" | "oldest" | "name" | "filled";

export type SavedTeamFilterOptions = {
  search: string;
  format: SavedTeamFormatFilter;
  sort: SavedTeamSortOption;
};

function normalizedSearch(value: string): string {
  return value.trim().toLowerCase();
}

export function filterAndSortSavedTeams(
  teams: SavedTeamSummary[],
  options: SavedTeamFilterOptions,
): SavedTeamSummary[] {
  const search = normalizedSearch(options.search);

  return [...teams]
    .filter((team) => {
      if (options.format !== "all" && team.format !== options.format) {
        return false;
      }

      if (!search) {
        return true;
      }

      return (
        team.name.toLowerCase().includes(search) ||
        team.format.toLowerCase().includes(search) ||
        team.pokemonPreviews.some((pokemon) =>
          pokemon.name.toLowerCase().includes(search),
        )
      );
    })
    .sort((a, b) => {
      if (options.sort === "name") {
        return a.name.localeCompare(b.name);
      }

      if (options.sort === "filled") {
        return b.filledSlotCount - a.filledSlotCount || b.updatedAt.localeCompare(a.updatedAt);
      }

      if (options.sort === "oldest") {
        return a.updatedAt.localeCompare(b.updatedAt);
      }

      return b.updatedAt.localeCompare(a.updatedAt);
    });
}
