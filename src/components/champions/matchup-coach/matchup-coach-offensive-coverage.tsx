import { TYPE_COLORS } from "@/components/shared/type-badge";
import { ALL_POKEMON_TYPES } from "@/data/type-chart";
import type { OffensiveCoverageEntry } from "@/lib/champions/matchup-coach-analysis";
import { cn } from "@/utils";

function coverageIntensity(hitters: number, teamSize: number): string {
  if (teamSize === 0 || hitters === 0) {
    return "border-border/40 bg-muted/25 text-muted-foreground";
  }
  const ratio = hitters / teamSize;
  if (ratio >= 0.67) {
    return "border-emerald-500/50 bg-emerald-600/80 text-white";
  }
  if (ratio >= 0.34) {
    return "border-emerald-400/45 bg-emerald-500/45 text-emerald-50";
  }
  return "border-emerald-300/35 bg-emerald-400/20 text-emerald-100";
}

export function MatchupCoachOffensiveCoverage({
  coverage,
  teamSize,
}: {
  coverage: OffensiveCoverageEntry[];
  teamSize: number;
}) {
  const byType = new Map(coverage.map((entry) => [entry.type, entry]));
  const topGaps = [...coverage]
    .filter((entry) => entry.hitters === 0)
    .slice(0, 4);
  const topStrengths = coverage.filter((entry) => entry.hitters > 0).slice(0, 3);

  return (
    <article className="rounded-2xl border border-border/60 bg-card/70 p-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">Offensive coverage</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Types your selected moves hit super-effectively (status moves excluded).
        </p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-1.5 sm:grid-cols-6">
        {ALL_POKEMON_TYPES.map((type) => {
          const entry = byType.get(type) ?? { type, hitters: 0, moveCount: 0, contributors: [] };
          const accent = TYPE_COLORS[type] ?? "#9ca3af";
          return (
            <div
              key={type}
              className={cn(
                "flex flex-col items-center justify-center rounded-lg border px-1 py-2 text-center transition-colors",
                coverageIntensity(entry.hitters, teamSize),
              )}
              title={
                entry.hitters > 0
                  ? `${type}: ${entry.hitters} Pokémon · ${entry.moveCount} SE moves`
                  : `${type}: no super-effective coverage`
              }
            >
              <span
                className="text-[10px] font-semibold uppercase tracking-wide"
                style={{ color: entry.hitters > 0 ? undefined : accent }}
              >
                {type.slice(0, 3)}
              </span>
              <span className="mt-0.5 text-sm font-bold tabular-nums">{entry.hitters}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-3 space-y-1 text-xs text-muted-foreground">
        {topStrengths.length > 0 ? (
          <p>
            Strong hits:{" "}
            {topStrengths.map((entry, index) => (
              <span key={entry.type}>
                {index > 0 ? " · " : ""}
                <span className="font-medium capitalize text-foreground">{entry.type}</span> ({entry.hitters})
              </span>
            ))}
          </p>
        ) : null}
        {topGaps.length > 0 ? (
          <p>
            Coverage gaps:{" "}
            {topGaps.map((entry, index) => (
              <span key={entry.type}>
                {index > 0 ? " · " : ""}
                <span className="font-medium capitalize text-foreground">{entry.type}</span>
              </span>
            ))}
          </p>
        ) : null}
      </div>
    </article>
  );
}
