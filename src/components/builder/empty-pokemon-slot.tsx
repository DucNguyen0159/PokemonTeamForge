"use client";

import { Plus } from "lucide-react";

import { cn } from "@/utils";

type EmptyPokemonSlotProps = {
  slot: number;
  onAdd?: () => void;
  className?: string;
};

export function EmptyPokemonSlot({ slot, onAdd, className }: EmptyPokemonSlotProps) {
  return (
    <button
      onClick={onAdd}
      aria-label={`Add Pokémon to slot ${slot}`}
      suppressHydrationWarning
      className={cn(
        "group relative flex min-h-[220px] w-full flex-col items-center justify-center gap-3",
        "rounded-2xl border border-dashed border-border/50 bg-card/30",
        "text-muted-foreground transition-all duration-150",
        "hover:border-primary/40 hover:bg-card/60 hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      <span className="absolute left-3 top-2.5 text-xs font-medium text-muted-foreground/50">
        #{slot}
      </span>
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-current opacity-40 transition-opacity group-hover:opacity-70">
        <Plus className="size-4" aria-hidden />
      </div>
      <span className="text-sm font-medium">Add Pokémon</span>
    </button>
  );
}
