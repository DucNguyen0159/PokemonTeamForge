"use client";

import { memo } from "react";
import { WandSparkles } from "lucide-react";

import { cn } from "@/utils";
import {
  teamCardBackgroundCategoryLabel,
  type TeamCardBackgroundAsset,
} from "@/data/team-card-assets";

type BackgroundSelectorProps = {
  selected: TeamCardBackgroundAsset;
  onOpenPicker: () => void;
};

function BackgroundSelectorComponent({ selected, onOpenPicker }: BackgroundSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Background
      </p>
      <p className="text-[11px] leading-relaxed text-muted-foreground/75">
        Swaps only the artwork behind the card. Your selected theme, labels, frames, and layout stay
        unchanged.
      </p>
      <div className="rounded-xl border border-border/60 bg-card/50 p-2">
        <button
          type="button"
          onClick={onOpenPicker}
          className={cn(
            "group flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors",
            "hover:bg-white/5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          )}
        >
          <div
            className="h-16 w-24 shrink-0 rounded-lg border border-white/10 bg-cover bg-center"
            style={{
              backgroundImage: selected.imagePath
                ? `url(${selected.imagePath})`
                : selected.css,
            }}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{selected.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {teamCardBackgroundCategoryLabel(selected.category)}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-background/50 px-2 py-1 text-[11px] text-foreground">
            <WandSparkles className="size-3" aria-hidden />
            Change
          </span>
        </button>
      </div>
    </div>
  );
}

export const BackgroundSelector = memo(BackgroundSelectorComponent);
