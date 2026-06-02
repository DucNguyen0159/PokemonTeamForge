"use client";

import { useMemo, useState } from "react";

import { useTeamStore } from "@/store/team-store";
import { cn } from "@/utils";
import { PokemonSprite } from "@/components/shared/pokemon-sprite";
import { PokemonSlot } from "./pokemon-slot";

export function TeamSlots() {
  const team = useTeamStore((s) => s.team);
  const initialActiveSlot = useMemo(() => {
    return team.pokemon.find((slot) => slot.pokemon)?.slot ?? 1;
  }, [team.pokemon]);
  const [activeSlot, setActiveSlot] = useState(initialActiveSlot);
  const activeTeamSlot = team.pokemon.find((slot) => slot.slot === activeSlot) ?? team.pokemon[0];

  return (
    <>
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1 sm:hidden">
        {team.pokemon.map((teamSlot) => {
          const selected = teamSlot.slot === activeSlot;

          return (
            <button
              key={teamSlot.slot}
              type="button"
              onClick={() => setActiveSlot(teamSlot.slot)}
              className={cn(
                "flex min-w-[5rem] shrink-0 flex-col items-center gap-1 rounded-xl border px-2 py-2",
                "transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                selected
                  ? "border-primary/55 bg-primary/10"
                  : "border-border/50 bg-card/40 hover:border-primary/35",
              )}
              aria-pressed={selected}
              aria-label={`Open slot ${teamSlot.slot}`}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {teamSlot.slot}
              </span>
              <span className="relative flex h-14 w-14 items-center justify-center overflow-hidden">
                {teamSlot.pokemon ? (
                  <PokemonSprite
                    src={teamSlot.pokemon.spriteNormal}
                    alt={teamSlot.pokemon.name}
                    size={56}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-sm text-muted-foreground/70">+</span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      <div className="sm:hidden">
        {activeTeamSlot ? <PokemonSlot teamSlot={activeTeamSlot} /> : null}
      </div>

      <div className="hidden grid-cols-1 gap-3 sm:grid sm:grid-cols-2 sm:items-start">
        {team.pokemon.map((teamSlot) => (
          <PokemonSlot key={teamSlot.slot} teamSlot={teamSlot} />
        ))}
      </div>
    </>
  );
}
