"use client";

import { memo, useMemo, useState } from "react";
import { Shield, Swords } from "lucide-react";

import { TypeBadge } from "@/components/shared/type-badge";
import { calculateDefensiveCoverage, calculateOffensiveCoverage } from "@/lib/calculations";
import { useTeamStore } from "@/store/team-store";
import type { DefensiveCoverageEntry, OffensiveCoverageEntry } from "@/types/coverage";
import { cn } from "@/utils";

type CoverageTab = "defensive" | "offensive";

const DefensiveCoverageRow = memo(function DefensiveCoverageRow({
  entry,
}: {
  entry: DefensiveCoverageEntry;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-xl px-2 py-1.5 transition-colors hover:bg-white/[0.03]",
        entry.weakCount >= 3 && "bg-red-500/5",
      )}
    >
      <TypeBadge type={entry.type} />
      <div className="flex items-center gap-3 text-xs">
        <span className="w-6 text-center font-medium text-red-400/80">{entry.weakCount}</span>
        <span className="w-6 text-center font-medium text-green-400/80">{entry.resistCount}</span>
        <span className="w-6 text-center font-medium text-sky-400/80">{entry.immuneCount}</span>
      </div>
    </div>
  );
});

const OffensiveCoverageRow = memo(function OffensiveCoverageRow({
  entry,
}: {
  entry: OffensiveCoverageEntry;
}) {
  return (
    <div className="flex items-start justify-between gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-white/[0.03]">
      <TypeBadge type={entry.targetType} />
      <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
        {entry.hasCoverage ? (
          <>
            <span className="mr-1 flex-shrink-0 text-[10px] font-medium uppercase tracking-wide text-green-400/80">
              Covered
            </span>
            {entry.superEffectiveMoveTypes.slice(0, 3).map((moveType) => (
              <TypeBadge key={`${entry.targetType}-${moveType}`} type={moveType} />
            ))}
            {entry.superEffectiveMoveTypes.length > 3 ? (
              <span className="text-xs text-muted-foreground">
                +{entry.superEffectiveMoveTypes.length - 3}
              </span>
            ) : null}
          </>
        ) : (
          <span className="text-[10px] font-medium uppercase tracking-wide text-yellow-400/80">
            Missing
          </span>
        )}
      </div>
    </div>
  );
});

const SummaryTypeList = memo(function SummaryTypeList({
  types,
  emptyLabel,
}: {
  types: string[];
  emptyLabel: string;
}) {
  if (types.length === 0) {
    return <span className="text-xs text-muted-foreground/60">{emptyLabel}</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {types.slice(0, 6).map((type) => (
        <TypeBadge key={type} type={type} />
      ))}
      {types.length > 6 ? (
        <span className="self-center text-xs text-muted-foreground">+{types.length - 6}</span>
      ) : null}
    </div>
  );
});

export function CoveragePanel() {
  const [tab, setTab] = useState<CoverageTab>("defensive");
  const team = useTeamStore((state) => state.team);

  const activePokemonCount = useMemo(
    () => team.pokemon.filter((slot) => slot.pokemon !== null).length,
    [team.pokemon],
  );

  const defensiveCoverage = useMemo(
    () => (tab === "defensive" ? calculateDefensiveCoverage(team) : null),
    [tab, team],
  );
  const offensiveCoverage = useMemo(
    () => (tab === "offensive" ? calculateOffensiveCoverage(team) : null),
    [tab, team],
  );

  const coverageHint =
    activePokemonCount === 0
      ? "Add Pokémon to start coverage analysis"
      : `Analyzing ${activePokemonCount} / 6 Pokémon`;

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-md">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground">Type Coverage</h2>

        <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-background/40 p-0.5">
          <button
            onClick={() => setTab("defensive")}
            aria-pressed={tab === "defensive"}
            className={cn(
              "flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              tab === "defensive"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Shield className="size-3" aria-hidden />
            Defense
          </button>
          <button
            onClick={() => setTab("offensive")}
            aria-pressed={tab === "offensive"}
            className={cn(
              "flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              tab === "offensive"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Swords className="size-3" aria-hidden />
            Offense
          </button>
        </div>
      </div>

      {tab === "defensive" && defensiveCoverage ? (
        <div className="grid gap-2 rounded-xl border border-border/40 bg-background/25 p-2">
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs text-muted-foreground">Major weaknesses</span>
            <SummaryTypeList
              types={defensiveCoverage.summary.majorWeaknesses}
              emptyLabel="No major stacked weakness"
            />
          </div>
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs text-muted-foreground">Immunities</span>
            <SummaryTypeList
              types={defensiveCoverage.summary.immunityTypes}
              emptyLabel="No immunities yet"
            />
          </div>
        </div>
      ) : offensiveCoverage ? (
        <div className="grid gap-2 rounded-xl border border-border/40 bg-background/25 p-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Covered types</span>
            <span className="text-xs font-medium text-green-400/80">
              {offensiveCoverage.summary.coveredTypes.length} / {offensiveCoverage.entries.length}
            </span>
          </div>
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs text-muted-foreground">Missing coverage</span>
            <SummaryTypeList
              types={offensiveCoverage.summary.missingTypes}
              emptyLabel="Complete basic coverage"
            />
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-3 px-2">
        {tab === "defensive" ? (
          <>
            <span className="w-6 text-center text-[10px] font-medium text-red-400/70">Weak</span>
            <span className="w-6 text-center text-[10px] font-medium text-green-400/70">Res.</span>
            <span className="w-6 text-center text-[10px] font-medium text-sky-400/70">Imm.</span>
          </>
        ) : (
          <span className="text-[10px] font-medium text-muted-foreground/70">
            Super-effective move types per target type
          </span>
        )}
      </div>

      <div className="-mx-1 flex max-h-[340px] flex-col overflow-y-auto pr-1">
        {tab === "defensive" && defensiveCoverage
          ? defensiveCoverage.entries.map((entry) => (
              <DefensiveCoverageRow key={entry.type} entry={entry} />
            ))
          : offensiveCoverage?.entries.map((entry) => (
              <OffensiveCoverageRow key={entry.targetType} entry={entry} />
            ))}
      </div>

      <p className="mt-1 text-center text-xs text-muted-foreground/60">{coverageHint}</p>
    </section>
  );
}
