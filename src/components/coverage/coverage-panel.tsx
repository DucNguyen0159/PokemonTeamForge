"use client";

import { memo, useMemo } from "react";

import { TypeBadge } from "@/components/shared/type-badge";
import { FORMAT_RULES } from "@/data/format-rules";
import { ALL_POKEMON_TYPES } from "@/data/type-chart";
import { calculateDefensiveCoverage, calculateOffensiveCoverage } from "@/lib/calculations";
import { useTeamStore } from "@/store/team-store";
import type { DefensiveCoverageEntry, OffensiveCoverageEntry } from "@/types/coverage";
import type { PokemonType } from "@/types/shared";
import { cn } from "@/utils";

const TYPE_DISPLAY_ORDER = [...ALL_POKEMON_TYPES].sort((a, b) => a.localeCompare(b));

function formatSignedScore(score: number): string {
  return score > 0 ? `+${score}` : String(score);
}

function sortEntriesByType<T extends { type?: PokemonType; targetType?: PokemonType }>(
  entries: T[],
): T[] {
  const byType = new Map(
    entries.map((entry) => [entry.type ?? entry.targetType, entry] as const),
  );

  return TYPE_DISPLAY_ORDER.map((type) => byType.get(type)).filter((entry): entry is T =>
    Boolean(entry),
  );
}

type CoverageTooltipRow = {
  label: string;
  value?: string;
};

const CoverageTooltip = memo(function CoverageTooltip({
  rows,
}: {
  rows: CoverageTooltipRow[];
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute left-1/2 top-full z-50 mt-1 w-max max-w-56 -translate-x-1/2",
        "rounded-lg border border-border/60 bg-zinc-900/95 px-2.5 py-2 text-left text-[10px] text-foreground shadow-xl",
        "opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100",
      )}
      role="tooltip"
    >
      <div className="space-y-1">
        {rows.map((row) => (
          <div key={`${row.label}-${row.value ?? ""}`} className="flex items-center justify-between gap-3">
            <span className="truncate text-muted-foreground">{row.label}</span>
            {row.value ? (
              <span className="shrink-0 font-medium tabular-nums text-foreground">{row.value}</span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
});

const DefensiveCoverageRow = memo(function DefensiveCoverageRow({
  entry,
}: {
  entry: DefensiveCoverageEntry;
}) {
  const tooltipRows = entry.affectedPokemon.map((match) => ({
    label: match.pokemonName,
    value: `${match.multiplier}x`,
  }));

  return (
    <div
      tabIndex={0}
      className={cn(
        "group relative flex items-center justify-between gap-2 rounded-lg border border-border/35 bg-background/25 px-2 py-1.5",
        "transition-colors hover:border-border/70 hover:bg-background/45 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        entry.netScore < 0 && "bg-red-500/5",
      )}
    >
      <TypeBadge type={entry.type} />
      <span
        className={cn(
          "min-w-6 text-right text-xs font-semibold tabular-nums",
          entry.netScore > 0 && "text-green-400/90",
          entry.netScore < 0 && "text-red-400/90",
          entry.netScore === 0 && "text-muted-foreground/70",
        )}
      >
        {formatSignedScore(entry.netScore)}
      </span>
      <CoverageTooltip rows={tooltipRows} />
    </div>
  );
});

const OffensiveCoverageRow = memo(function OffensiveCoverageRow({
  entry,
}: {
  entry: OffensiveCoverageEntry;
}) {
  const tooltipRows =
    entry.matchingMoves.length > 0
      ? entry.matchingMoves
          .map((match) => ({
            label: match.pokemonName,
            value: `${match.moveName} (${match.moveType})`,
          }))
      : [{ label: "No selected attacking move hits this type super-effectively." }];

  return (
    <div
      tabIndex={0}
      className="group relative flex items-center justify-between gap-2 rounded-lg border border-border/35 bg-background/25 px-2 py-1.5 transition-colors hover:border-border/70 hover:bg-background/45 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      <TypeBadge type={entry.targetType} />
      <span
        className={cn(
          "min-w-6 text-right text-xs font-semibold tabular-nums",
          entry.coverageCount > 0 ? "text-green-400/90" : "text-muted-foreground/70",
        )}
      >
        {entry.coverageCount > 0 ? `+${entry.coverageCount}` : "0"}
      </span>
      <CoverageTooltip rows={tooltipRows} />
    </div>
  );
});

export function CoveragePanel() {
  const team = useTeamStore((state) => state.team);
  const formatRules = FORMAT_RULES[team.format];

  const activePokemonCount = useMemo(
    () => team.pokemon.filter((slot) => slot.pokemon !== null).length,
    [team.pokemon],
  );

  const defensiveCoverage = useMemo(
    () => calculateDefensiveCoverage(team),
    [team],
  );
  const offensiveCoverage = useMemo(
    () => calculateOffensiveCoverage(team),
    [team],
  );

  const defensiveEntries = useMemo(
    () => sortEntriesByType(defensiveCoverage.entries),
    [defensiveCoverage.entries],
  );
  const offensiveEntries = useMemo(
    () => sortEntriesByType(offensiveCoverage.entries),
    [offensiveCoverage.entries],
  );

  const coverageHint =
    activePokemonCount === 0
      ? "Add Pokémon to start coverage analysis"
      : `Analyzing ${activePokemonCount} / 6 Pokémon`;

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-md">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Type Coverage</h2>
          <p className="mt-1 text-xs text-muted-foreground/70">{formatRules.coverageNote}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-border/40 bg-background/20 p-2 text-center text-[10px] text-muted-foreground">
        <span><strong className="text-green-400">+</strong> covered</span>
        <span><strong className="text-muted-foreground">0</strong> neutral</span>
        <span><strong className="text-red-400">-</strong> stacked risk</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-foreground">Team Defense</h3>
          <span className="text-[10px] text-muted-foreground/70">Res./imm. minus weaknesses</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {defensiveEntries.map((entry) => (
            <DefensiveCoverageRow key={entry.type} entry={entry} />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-foreground">Team Type Coverage</h3>
          <span className="text-[10px] text-muted-foreground/70">Super-effective attacks</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {offensiveEntries.map((entry) => (
            <OffensiveCoverageRow key={entry.targetType} entry={entry} />
          ))}
        </div>
      </div>

      <p className="mt-1 text-center text-xs text-muted-foreground/60">{coverageHint}</p>
    </section>
  );
}
