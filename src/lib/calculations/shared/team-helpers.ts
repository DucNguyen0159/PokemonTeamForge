import type { Move } from "@/types/move";
import type { PokemonType } from "@/types/shared";
import type { Team, TeamPokemon } from "@/types/team";

export type ActiveTeamSlot = TeamPokemon & {
  pokemon: NonNullable<TeamPokemon["pokemon"]>;
};

export interface SelectedMoveWithOwner {
  pokemonId: number;
  pokemonName: string;
  moveSlot: 1 | 2 | 3 | 4;
  move: Move;
}

export function getActiveTeamSlots(team: Team): ActiveTeamSlot[] {
  return team.pokemon.filter(
    (slot): slot is ActiveTeamSlot => slot.pokemon !== null,
  );
}

export function getPokemonTypes(slot: ActiveTeamSlot): PokemonType[] {
  const { primaryType, secondaryType } = slot.pokemon;

  return secondaryType ? [primaryType, secondaryType] : [primaryType];
}

export function getSelectedMovesWithOwners(team: Team): SelectedMoveWithOwner[] {
  return getActiveTeamSlots(team).flatMap((slot) =>
    slot.moves
      .filter((selectedMove): selectedMove is { slot: 1 | 2 | 3 | 4; move: Move } => selectedMove.move !== null)
      .map((selectedMove) => ({
        pokemonId: slot.pokemon.id,
        pokemonName: slot.pokemon.name,
        moveSlot: selectedMove.slot,
        move: selectedMove.move,
      })),
  );
}
