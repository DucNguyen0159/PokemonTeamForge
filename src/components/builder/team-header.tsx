"use client";

import { useTeamStore } from "@/store/team-store";
import { cn } from "@/utils";
import type { BattleFormat } from "@/types/shared";

const FORMAT_OPTIONS: { label: string; value: BattleFormat }[] = [
  { label: "Singles", value: "singles" },
  { label: "Doubles", value: "doubles" },
  { label: "Triples", value: "triples" },
];

export function TeamHeader() {
  const team = useTeamStore((s) => s.team);
  const setFormat = useTeamStore((s) => s.setFormat);
  const setTeamName = useTeamStore((s) => s.setTeamName);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1">
        <input
          type="text"
          value={team.name}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="Team name…"
          aria-label="Team name"
          className={cn(
            "w-full rounded-xl border border-transparent bg-transparent px-0",
            "text-xl font-bold text-foreground placeholder:text-muted-foreground/40",
            "focus:border-border focus:bg-card focus:px-3 focus:outline-none focus:ring-0",
            "transition-all duration-150",
          )}
        />
        <p className="text-xs text-muted-foreground">
          {team.pokemon.filter((s) => s.pokemon !== null).length} / 6 Pokémon
        </p>
      </div>

      <div className="flex items-center gap-1 rounded-xl border border-border/60 bg-card/60 p-1">
        {FORMAT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFormat(opt.value)}
            aria-pressed={team.format === opt.value}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              team.format === opt.value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
