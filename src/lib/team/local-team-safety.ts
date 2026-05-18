import type { Team } from "@/types/team";

export type LocalTeamSafetySummary = {
  pokemonCount: number;
  moveCount: number;
  hasCustomName: boolean;
  hasSelectedDetails: boolean;
  isCloudTeam: boolean;
};

export function getLocalTeamSafetySummary(team: Team): LocalTeamSafetySummary {
  const occupiedSlots = team.pokemon.filter((slot) => slot.pokemon);
  const moveCount = occupiedSlots.reduce(
    (total, slot) => total + slot.moves.filter((entry) => entry.move).length,
    0,
  );

  return {
    pokemonCount: occupiedSlots.length,
    moveCount,
    hasCustomName: team.name.trim().length > 0 && team.name.trim() !== "Untitled Team",
    hasSelectedDetails: occupiedSlots.some(
      (slot) => Boolean(slot.selectedAbility || slot.selectedItem || slot.isShiny),
    ),
    isCloudTeam: Boolean(team.id),
  };
}

export function hasMeaningfulLocalTeam(team: Team): boolean {
  const summary = getLocalTeamSafetySummary(team);
  return (
    summary.pokemonCount > 0 ||
    summary.moveCount > 0 ||
    summary.hasCustomName ||
    summary.hasSelectedDetails
  );
}

export function shouldWarnBeforeCloudLoad(currentTeam: Team, incomingTeamId: string): boolean {
  if (!hasMeaningfulLocalTeam(currentTeam)) {
    return false;
  }

  return currentTeam.id !== incomingTeamId;
}
