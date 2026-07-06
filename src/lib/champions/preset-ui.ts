import type { ChampionsPresetAccentTheme } from "@/data/champions-presets";
import { cn } from "@/utils";

export function presetAccentClasses(theme: ChampionsPresetAccentTheme): string {
  switch (theme) {
    case "rain":
      return "border-t-sky-500/70 bg-[linear-gradient(180deg,rgba(56,189,248,0.08),transparent_28%)]";
    case "sun":
      return "border-t-amber-500/70 bg-[linear-gradient(180deg,rgba(245,158,11,0.1),transparent_28%)]";
    case "sand":
      return "border-t-yellow-600/70 bg-[linear-gradient(180deg,rgba(202,138,4,0.1),transparent_28%)]";
    case "snow":
      return "border-t-cyan-300/70 bg-[linear-gradient(180deg,rgba(103,232,249,0.1),transparent_28%)]";
    case "trick-room":
      return "border-t-violet-500/70 bg-[linear-gradient(180deg,rgba(139,92,246,0.1),transparent_28%)]";
    default:
      return "border-t-border/60";
  }
}

export function filterChipClass(isActive: boolean): string {
  return cn(
    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
    isActive
      ? "border-primary/50 bg-primary/15 text-primary"
      : "border-border/55 bg-background/40 text-muted-foreground hover:border-border/80 hover:text-foreground",
  );
}

export function difficultyLabel(difficulty: string): string {
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
}
