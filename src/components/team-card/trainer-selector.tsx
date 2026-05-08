/* eslint-disable @next/next/no-img-element */
"use client";

import { cn } from "@/utils";
import { TRAINER_PRESETS, type TrainerPreset } from "@/data/team-card-assets";

type TrainerSelectorProps = {
  selected: TrainerPreset;
  onChange: (trainer: TrainerPreset) => void;
};

export function TrainerSelector({ selected, onChange }: TrainerSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Trainer
      </p>
      <div className="flex flex-wrap gap-2">
        {TRAINER_PRESETS.map((trainer) => (
          <button
            key={trainer.slug}
            type="button"
            title={trainer.name}
            onClick={() => onChange(trainer)}
            aria-pressed={selected.slug === trainer.slug}
            className={cn(
              "group flex flex-col items-center gap-1 rounded-xl transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected.slug === trainer.slug
                ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                : "opacity-70 hover:opacity-100",
            )}
          >
            <div className="flex h-16 w-10 items-end justify-center rounded-lg border border-border/60 bg-card/80 px-1 py-1">
              <img
                src={trainer.imagePath}
                alt={trainer.name}
                className="h-full w-full object-contain"
              />
            </div>
            <span className="text-[10px] text-muted-foreground group-hover:text-foreground">
              {trainer.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
