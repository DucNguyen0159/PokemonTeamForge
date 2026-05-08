"use client";

import { cn } from "@/utils";
import { BACKGROUND_PRESETS, type BackgroundPreset } from "@/data/team-card-assets";

type BackgroundSelectorProps = {
  selected: BackgroundPreset;
  onChange: (bg: BackgroundPreset) => void;
};

const CATEGORIES = [
  { key: "dark", label: "Dark" },
  { key: "elemental", label: "Elemental" },
] as const;

export function BackgroundSelector({ selected, onChange }: BackgroundSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Background
      </p>
      {CATEGORIES.map(({ key, label }) => {
        const items = BACKGROUND_PRESETS.filter((bg) => bg.category === key);
        return (
          <div key={key} className="space-y-1.5">
            <p className="text-xs text-muted-foreground/70">{label}</p>
            <div className="flex flex-wrap gap-2">
              {items.map((bg) => (
                <button
                  key={bg.slug}
                  type="button"
                  title={bg.name}
                  onClick={() => onChange(bg)}
                  aria-pressed={selected.slug === bg.slug}
                  className={cn(
                    "group relative flex flex-col items-center gap-1 rounded-xl transition-all duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    selected.slug === bg.slug
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                      : "opacity-70 hover:opacity-100",
                  )}
                >
                  <div
                    className="h-10 w-16 rounded-lg border border-white/10"
                    style={{ background: bg.css }}
                  />
                  <span className="text-[10px] text-muted-foreground group-hover:text-foreground">
                    {bg.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
