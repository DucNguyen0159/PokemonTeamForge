import { ALL_POKEMON_TYPES } from "@/data/type-chart";
import type { TypeDefenseEntry } from "@/types/coverage";
import type { PokemonType } from "@/types/shared";
import { cn } from "@/utils";
import { TYPE_COLORS } from "@/components/shared/type-badge";
import { TYPE_CHART_ABBREVIATIONS } from "@/components/type-chart/type-chart-shared";

type PokemonTypeDefenseGridProps = {
  pokemonName: string;
  typeDefense: TypeDefenseEntry[];
};

function formatDefenseMultiplier(multiplier: number): string {
  if (multiplier === 0) {
    return "0";
  }

  if (multiplier === 0.5) {
    return "½";
  }

  if (multiplier === 2) {
    return "2";
  }

  if (multiplier === 4) {
    return "4";
  }

  return "—";
}

function defenseCellClass(multiplier: number): string {
  if (multiplier >= 2) {
    return "border-emerald-500/40 bg-emerald-600/90 text-white";
  }

  if (multiplier === 0) {
    return "border-zinc-700/60 bg-zinc-950 text-zinc-100";
  }

  if (multiplier <= 0.5) {
    return "border-rose-900/50 bg-rose-900/85 text-rose-50";
  }

  return "border-border/40 bg-background/25 text-muted-foreground/70";
}

function DefenseCell({
  attackingType,
  multiplier,
}: {
  attackingType: PokemonType;
  multiplier: number;
}) {
  const accent = TYPE_COLORS[attackingType] ?? "#9ca3af";

  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground"
        style={{ backgroundColor: `${accent}33`, color: accent }}
      >
        {TYPE_CHART_ABBREVIATIONS[attackingType]}
      </span>
      <span
        className={cn(
          "flex min-h-[1.75rem] min-w-[1.75rem] items-center justify-center rounded-md border text-xs font-semibold tabular-nums",
          defenseCellClass(multiplier),
        )}
      >
        {formatDefenseMultiplier(multiplier)}
      </span>
    </div>
  );
}

export function PokemonTypeDefenseGrid({ pokemonName, typeDefense }: PokemonTypeDefenseGridProps) {
  const multiplierByType = new Map(typeDefense.map((entry) => [entry.type, entry.multiplier]));

  return (
    <section className="rounded-2xl border border-border/60 bg-card/50 p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">Type defenses</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        The effectiveness of each type on {pokemonName}.
      </p>

      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6 md:grid-cols-9">
        {ALL_POKEMON_TYPES.map((attackingType) => (
          <DefenseCell
            key={attackingType}
            attackingType={attackingType}
            multiplier={multiplierByType.get(attackingType) ?? 1}
          />
        ))}
      </div>
    </section>
  );
}
