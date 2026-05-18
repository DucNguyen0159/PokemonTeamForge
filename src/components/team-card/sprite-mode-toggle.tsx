"use client";

import { memo } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/utils";
import type { TeamCardSpriteMode } from "@/types/team-card";

type SpriteSlotOption = {
  slot: number;
  name: string;
  hasPokemon: boolean;
  mode: TeamCardSpriteMode;
};

type SpriteModeToggleProps = {
  mode: TeamCardSpriteMode;
  onChange: (mode: TeamCardSpriteMode) => void;
  slots: SpriteSlotOption[];
  onSlotModeChange: (slot: number, mode: TeamCardSpriteMode) => void;
  onClearOverrides: () => void;
};

function SpriteModeToggleComponent({
  mode,
  onChange,
  slots,
  onSlotModeChange,
  onClearOverrides,
}: SpriteModeToggleProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Sprites
      </p>
      <div className="flex items-center gap-1 rounded-xl border border-border/60 bg-card/60 p-1 w-fit">
        <button
          type="button"
          onClick={() => onChange("normal")}
          aria-pressed={mode === "normal"}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            mode === "normal"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Normal
        </button>
        <button
          type="button"
          onClick={() => onChange("shiny")}
          aria-pressed={mode === "shiny"}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            mode === "shiny"
              ? "bg-amber-500/90 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Sparkles className="size-3" aria-hidden />
          Shiny
        </button>
      </div>

      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-medium text-muted-foreground">
            Per-Pokémon override
          </p>
          <button
            type="button"
            className="text-[11px] text-muted-foreground transition-colors hover:text-foreground"
            onClick={onClearOverrides}
          >
            Clear overrides
          </button>
        </div>

        <div className="space-y-1.5">
          {slots.map((slot) => (
            <div
              key={slot.slot}
              className="rounded-lg border border-border/50 bg-card/50 px-2 py-1.5"
            >
              <div className="mb-1 flex items-center justify-between text-[11px]">
                <span className="font-medium text-foreground">
                  {slot.slot}. {slot.name}
                </span>
                <span className="text-muted-foreground">
                  {slot.mode === "shiny" ? "Shiny" : "Normal"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onSlotModeChange(slot.slot, "normal")}
                  disabled={!slot.hasPokemon}
                  className={cn(
                    "rounded-md px-2 py-1 text-[10px] font-medium transition-colors",
                    slot.mode === "normal"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                    !slot.hasPokemon && "cursor-not-allowed opacity-50",
                  )}
                >
                  Normal
                </button>
                <button
                  type="button"
                  onClick={() => onSlotModeChange(slot.slot, "shiny")}
                  disabled={!slot.hasPokemon}
                  className={cn(
                    "rounded-md px-2 py-1 text-[10px] font-medium transition-colors",
                    slot.mode === "shiny"
                      ? "bg-amber-500/90 text-white"
                      : "text-muted-foreground hover:text-foreground",
                    !slot.hasPokemon && "cursor-not-allowed opacity-50",
                  )}
                >
                  Shiny
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const SpriteModeToggle = memo(SpriteModeToggleComponent);
