"use client";

import { memo } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/utils";
import type { SpriteMode } from "./team-card-preview";

type SpriteModeToggleProps = {
  mode: SpriteMode;
  onChange: (mode: SpriteMode) => void;
};

function SpriteModeToggleComponent({ mode, onChange }: SpriteModeToggleProps) {
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
    </div>
  );
}

export const SpriteModeToggle = memo(SpriteModeToggleComponent);
