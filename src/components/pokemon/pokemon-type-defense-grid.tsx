"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

import { ALL_POKEMON_TYPES } from "@/data/type-chart";
import type { TypeDefenseEntry } from "@/types/coverage";
import type { PokemonType } from "@/types/shared";
import { cn } from "@/utils";
import { TypeBadge } from "@/components/shared/type-badge";

type PokemonTypeDefenseGridProps = {
  pokemonName: string;
  typeDefense: TypeDefenseEntry[];
};

type DefenseGroup = "weak" | "resist" | "immune" | "neutral";

function groupForMultiplier(multiplier: number): DefenseGroup {
  if (multiplier === 0) {
    return "immune";
  }

  if (multiplier >= 2) {
    return "weak";
  }

  if (multiplier <= 0.5) {
    return "resist";
  }

  return "neutral";
}

function formatMultiplier(multiplier: number): string {
  if (multiplier === 0) {
    return "0×";
  }

  if (multiplier === 0.25) {
    return "¼×";
  }

  if (multiplier === 0.5) {
    return "½×";
  }

  if (multiplier === 2) {
    return "2×";
  }

  if (multiplier === 4) {
    return "4×";
  }

  return "1×";
}

function multiplierClass(multiplier: number): string {
  const group = groupForMultiplier(multiplier);

  if (group === "weak") {
    return "border-rose-400/60 bg-rose-600/90 text-white";
  }

  if (group === "resist") {
    return "border-sky-400/55 bg-sky-800/85 text-sky-50";
  }

  if (group === "immune") {
    return "border-zinc-500/70 border-dashed bg-black text-white ring-1 ring-zinc-400/25";
  }

  return "border-slate-500/50 bg-slate-600/70 text-slate-100";
}

function SummaryRow({
  label,
  types,
  emptyText,
}: {
  label: string;
  types: PokemonType[];
  emptyText: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      {types.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {types.map((type) => (
            <TypeBadge key={type} type={type} size="sm" />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      )}
    </div>
  );
}

export function PokemonTypeDefenseGrid({ pokemonName, typeDefense }: PokemonTypeDefenseGridProps) {
  const [showNeutral, setShowNeutral] = useState(false);

  const entries = useMemo(() => {
    const multiplierByType = new Map(typeDefense.map((entry) => [entry.type, entry.multiplier]));

    return ALL_POKEMON_TYPES.map((type) => ({
      type,
      multiplier: multiplierByType.get(type) ?? 1,
      group: groupForMultiplier(multiplierByType.get(type) ?? 1),
    }));
  }, [typeDefense]);

  const weakTypes = entries.filter((entry) => entry.group === "weak").map((entry) => entry.type);
  const resistTypes = entries.filter((entry) => entry.group === "resist").map((entry) => entry.type);
  const immuneTypes = entries.filter((entry) => entry.group === "immune").map((entry) => entry.type);
  const neutralTypes = entries.filter((entry) => entry.group === "neutral").map((entry) => entry.type);

  return (
    <section className="rounded-2xl border border-border/60 bg-card/50 p-4 shadow-sm sm:p-5">
      <h2 className="text-lg font-semibold text-foreground">Type defenses</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Damage multipliers when {pokemonName} is hit by each type.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3 sm:gap-4">
        <SummaryRow label="Weak to (2×+)" types={weakTypes} emptyText="No major weaknesses." />
        <SummaryRow label="Resists (½×)" types={resistTypes} emptyText="No resistances." />
        <SummaryRow label="Immune (0×)" types={immuneTypes} emptyText="No immunities." />
      </div>

      <div className="mt-4 hidden flex-wrap gap-3 text-[11px] text-muted-foreground sm:flex">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="size-2.5 rounded-sm border border-rose-400/60 bg-rose-600/90"
            aria-hidden
          />
          Takes extra damage (2×+)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="size-2.5 rounded-sm border border-sky-400/55 bg-sky-800/85"
            aria-hidden
          />
          Takes less damage (½×)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="size-2.5 rounded-sm border border-slate-500/50 bg-slate-600/70"
            aria-hidden
          />
          Neutral (1×)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="size-2.5 rounded-sm border border-dashed border-zinc-500/70 bg-black ring-1 ring-zinc-400/25"
            aria-hidden
          />
          Immune (0×)
        </span>
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={() => setShowNeutral((prev) => !prev)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          aria-expanded={showNeutral}
        >
          <ChevronDown
            className={cn("size-4 transition-transform", showNeutral && "rotate-180")}
            aria-hidden
          />
          {showNeutral ? "Hide" : "Show"} all types ({neutralTypes.length} neutral)
        </button>
      </div>

      {showNeutral ? (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-6 md:grid-cols-9">
          {entries.map(({ type, multiplier }) => (
            <div key={type} className="flex flex-col items-center gap-1">
              <TypeBadge type={type} size="sm" />
              <span
                className={cn(
                  "flex min-h-[1.6rem] min-w-[2rem] items-center justify-center rounded-md border px-1 text-[11px] font-semibold tabular-nums",
                  multiplierClass(multiplier),
                )}
              >
                {formatMultiplier(multiplier)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {[...entries]
            .filter((entry) => entry.group !== "neutral")
            .map(({ type, multiplier }) => (
              <div
                key={type}
                className="flex items-center gap-1.5 rounded-lg border border-border/40 bg-background/30 px-2 py-1"
              >
                <TypeBadge type={type} size="sm" />
                <span
                  className={cn(
                    "rounded-md border px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
                    multiplierClass(multiplier),
                  )}
                >
                  {formatMultiplier(multiplier)}
                </span>
              </div>
            ))}
        </div>
      )}
    </section>
  );
}
