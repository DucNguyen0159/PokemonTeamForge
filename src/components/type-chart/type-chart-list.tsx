import { buildTypeOffenseProfiles } from "@/lib/calculations/type-matchup-matrix";
import { cn } from "@/utils";
import type { PokemonType } from "@/types/shared";
import { TypeBadge } from "@/components/shared/type-badge";
import { formatTypeLabel } from "@/components/type-chart/type-chart-shared";

const OFFENSE_PROFILES = buildTypeOffenseProfiles();

function TypeGroup({
  label,
  types,
  tone,
}: {
  label: string;
  types: PokemonType[];
  tone: "super" | "weak" | "immune";
}) {
  if (types.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1.5">
      <p
        className={cn(
          "text-[11px] font-medium uppercase tracking-wide",
          tone === "super" && "text-emerald-400",
          tone === "weak" && "text-rose-300",
          tone === "immune" && "text-zinc-400",
        )}
      >
        {label}
      </p>
      <div className="flex flex-wrap gap-1">
        {types.map((type) => (
          <TypeBadge key={type} type={type} size="sm" />
        ))}
      </div>
    </div>
  );
}

type TypeChartListProps = {
  className?: string;
};

export function TypeChartList({ className }: TypeChartListProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {OFFENSE_PROFILES.map((profile) => (
        <article
          key={profile.attackingType}
          className="rounded-2xl border border-border/60 bg-card/50 p-4"
        >
          <div className="flex flex-wrap items-center gap-2">
            <TypeBadge type={profile.attackingType} size="md" />
            <h3 className="text-sm font-semibold text-foreground">
              {formatTypeLabel(profile.attackingType)} attacking
            </h3>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <TypeGroup label="2× · Super effective" types={profile.superEffective} tone="super" />
            <TypeGroup label="½× · Not very effective" types={profile.notVeryEffective} tone="weak" />
            <TypeGroup label="0× · No effect" types={profile.noEffect} tone="immune" />
          </div>
        </article>
      ))}
    </div>
  );
}
