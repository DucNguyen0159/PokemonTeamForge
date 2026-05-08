import type { Move } from "@/types/move";
import type { PokemonType } from "@/types/shared";
import type { Team, TeamPokemon } from "@/types/team";

export type ActiveTeamSlot = TeamPokemon & {
  pokemon: NonNullable<TeamPokemon["pokemon"]>;
};

export interface SelectedMoveWithOwner {
  pokemonId: number;
  pokemonName: string;
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
      .map((selectedMove) => selectedMove.move)
      .filter((move): move is Move => move !== null)
      .map((move) => ({
        pokemonId: slot.pokemon.id,
        pokemonName: slot.pokemon.name,
        move,
      })),
  );
}
