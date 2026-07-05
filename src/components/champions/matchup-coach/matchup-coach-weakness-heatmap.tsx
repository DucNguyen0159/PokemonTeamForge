import { TYPE_COLORS } from "@/components/shared/type-badge";
import { ALL_POKEMON_TYPES } from "@/data/type-chart";
import type { WeaknessEntry } from "@/lib/champions/matchup-coach-analysis";
import { cn } from "@/utils";

function weaknessIntensity(weak: number, teamSize: number): string {
  if (teamSize === 0 || weak === 0) {
    return "border-border/40 bg-muted/25 text-muted-foreground";
  }
  const ratio = weak / teamSize;
  if (ratio >= 0.67) {
    return "border-rose-500/50 bg-rose-600/85 text-white";
  }
  if (ratio >= 0.34) {
    return "border-rose-400/45 bg-rose-500/55 text-rose-50";
  }
  return "border-rose-300/35 bg-rose-400/25 text-rose-100";
}

export function MatchupCoachWeaknessHeatmap({
  weaknessMap,
  teamSize,
}: {
  weaknessMap: WeaknessEntry[];
  teamSize: number;
}) {
  const byType = new Map(weaknessMap.map((entry) => [entry.type, entry]));
  const topWeak = weaknessMap.filter((entry) => entry.weak > 0).slice(0, 3);

  return (
    <article className="rounded-2xl border border-border/60 bg-card/70 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-foreground">Defensive weakness heatmap</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            How many roster members are weak to each attacking type.
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-1.5 sm:grid-cols-6">
        {ALL_POKEMON_TYPES.map((type) => {
          const entry = byType.get(type) ?? { type, weak: 0, resist: 0, immune: 0 };
          const accent = TYPE_COLORS[type] ?? "#9ca3af";
          return (
            <div
              key={type}
              className={cn(
                "flex flex-col items-center justify-center rounded-lg border px-1 py-2 text-center transition-colors",
                weaknessIntensity(entry.weak, teamSize),
              )}
              title={`${type}: ${entry.weak} weak · ${entry.resist} resist · ${entry.immune} immune`}
            >
              <span
                className="text-[10px] font-semibold uppercase tracking-wide"
                style={{ color: entry.weak > 0 ? undefined : accent }}
              >
                {type.slice(0, 3)}
              </span>
              <span className="mt-0.5 text-sm font-bold tabular-nums">{entry.weak}</span>
              {entry.immune > 0 ? (
                <span className="text-[9px] opacity-80">{entry.immune} imm</span>
              ) : null}
            </div>
          );
        })}
      </div>

      {topWeak.length > 0 ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Priority gaps:{" "}
          {topWeak.map((entry, index) => (
            <span key={entry.type}>
              {index > 0 ? " · " : ""}
              <span className="font-medium capitalize text-foreground">{entry.type}</span> ({entry.weak})
            </span>
          ))}
        </p>
      ) : null}
    </article>
  );
}
