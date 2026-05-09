/* eslint-disable @next/next/no-img-element */
"use client";

import { memo } from "react";
import { UserRoundSearch } from "lucide-react";

import { cn } from "@/utils";
import type { TeamCardTrainerCharacter, TeamCardTrainerVariant } from "@/data/team-card-assets";

type TrainerSelectorProps = {
  selectedVariant: TeamCardTrainerVariant;
  selectedCharacter: TeamCardTrainerCharacter | null;
  onOpenPicker: () => void;
};

function TrainerSelectorComponent({
  selectedVariant,
  selectedCharacter,
  onOpenPicker,
}: TrainerSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Trainer
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
          <div className="flex h-16 w-12 shrink-0 items-end justify-center rounded-lg border border-border/60 bg-card/80 px-1 py-1">
            <img src={selectedVariant.imagePath} alt={selectedVariant.name} className="h-full w-full object-contain" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{selectedVariant.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {selectedCharacter?.name ?? "Unknown Character"}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-background/50 px-2 py-1 text-[11px] text-foreground">
            <UserRoundSearch className="size-3" aria-hidden />
            Change
          </span>
        </button>
      </div>
    </div>
  );
}

export const TrainerSelector = memo(TrainerSelectorComponent);
