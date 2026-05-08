"use client";

import { useTeamStore } from "@/store/team-store";
import { PokemonSlot } from "./pokemon-slot";

export function TeamSlots() {
  const team = useTeamStore((s) => s.team);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:items-start">
      {team.pokemon.map((teamSlot) => (
        <PokemonSlot key={teamSlot.slot} teamSlot={teamSlot} />
      ))}
    </div>
  );
}
