"use client";

import Image from "next/image";
import { ChevronDown, Trash2 } from "lucide-react";

import { cn } from "@/utils";
import type { TeamPokemon } from "@/types/team";
import { TypeBadge } from "@/components/shared/type-badge";
import { EmptyPokemonSlot } from "./empty-pokemon-slot";

type PokemonSlotProps = {
  teamSlot: TeamPokemon;
  onAdd?: () => void;
  onRemove?: () => void;
  className?: string;
};

function SelectRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/40 bg-background/40 px-3 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1 text-foreground/70">
        <span className="text-xs">{value ?? `— ${label} —`}</span>
        <ChevronDown className="size-3 text-muted-foreground" aria-hidden />
      </div>
    </div>
  );
}

function MoveRow({ slot, name }: { slot: number; name?: string | null }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/40 bg-background/40 px-3 py-2 text-sm">
      <span className="text-xs text-muted-foreground/60">Move {slot}</span>
      <div className="flex items-center gap-1">
        <span className="text-xs text-foreground/70">{name ?? "— Select Move —"}</span>
        <ChevronDown className="size-3 text-muted-foreground" aria-hidden />
      </div>
    </div>
  );
}

export function PokemonSlot({ teamSlot, onAdd, onRemove, className }: PokemonSlotProps) {
  const { slot, pokemon, selectedAbility, selectedItem, moves } = teamSlot;

  if (!pokemon) {
    return <EmptyPokemonSlot slot={slot} onAdd={onAdd} className={className} />;
  }

  return (
    <div
      className={cn(
        "relative flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-md",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-background/60">
            {pokemon.spriteNormal ? (
              <Image
                src={pokemon.spriteNormal}
                alt={pokemon.name}
                fill
                sizes="48px"
                className="object-contain"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-bold text-muted-foreground/30">
                {slot}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold capitalize leading-tight text-foreground">
              {pokemon.name}
            </p>
            <div className="mt-1 flex flex-wrap gap-1">
              <TypeBadge type={pokemon.primaryType} />
              {pokemon.secondaryType && <TypeBadge type={pokemon.secondaryType} />}
            </div>
          </div>
        </div>

        <button
          onClick={onRemove}
          aria-label={`Remove ${pokemon.name} from slot ${slot}`}
          className="flex-shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <Trash2 className="size-4" aria-hidden />
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        <SelectRow label="Ability" value={selectedAbility?.name} />
        <SelectRow label="Item" value={selectedItem?.name} />
      </div>

      <div className="flex flex-col gap-1.5">
        {moves.map((entry) => (
          <MoveRow key={entry.slot} slot={entry.slot} name={entry.move?.name} />
        ))}
      </div>
    </div>
  );
}
