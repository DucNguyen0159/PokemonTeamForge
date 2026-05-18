import type { Team } from "@/types/team";

export type GuestTeamSyncSummary = {
  pokemonCount: number;
  moveCount: number;
  hasCustomName: boolean;
  hasSelectedDetails: boolean;
};

export function getGuestTeamSyncSummary(team: Team): GuestTeamSyncSummary {
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
  };
}

export function hasMeaningfulGuestTeam(team: Team): boolean {
  if (team.id) {
    return false;
  }

  const summary = getGuestTeamSyncSummary(team);
  return (
    summary.pokemonCount > 0 ||
    summary.moveCount > 0 ||
    summary.hasCustomName ||
    summary.hasSelectedDetails
  );
}

export function guestTeamSyncSignature(team: Team): string {
  const slotSignature = team.pokemon
    .map((slot) => {
      const moveIds = slot.moves.map((entry) => entry.move?.id ?? "x").join(".");
      return [
        slot.slot,
        slot.pokemon?.id ?? "empty",
        slot.selectedAbility?.id ?? "none",
        slot.selectedItem?.id ?? "none",
        slot.isShiny ? "shiny" : "normal",
        moveIds,
      ].join("-");
    })
    .join("|");

  return `${team.name.trim() || "Untitled Team"}:${team.format}:${slotSignature}`;
}

export function guestTeamSyncDismissKey(userId: string, team: Team): string {
  return `ptf-guest-team-sync-dismissed:${userId}:${guestTeamSyncSignature(team)}`;
}
