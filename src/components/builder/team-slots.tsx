"use client";

import { useTeamStore } from "@/store/team-store";
import { PokemonSlot } from "./pokemon-slot";

export function TeamSlots() {
  const team = useTeamStore((s) => s.team);
  const removePokemon = useTeamStore((s) => s.removePokemon);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {team.pokemon.map((teamSlot) => (
        <PokemonSlot
          key={teamSlot.slot}
          teamSlot={teamSlot}
          onRemove={teamSlot.pokemon ? () => removePokemon(teamSlot.slot) : undefined}
        />
      ))}
    </div>
  );
}
