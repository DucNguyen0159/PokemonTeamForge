import { buildTypeMatchupMatrix } from "@/lib/calculations/type-matchup-matrix";
import type { TypeMatchupMultiplier } from "@/lib/calculations/type-matchup-matrix";
import { cn } from "@/utils";
import { TYPE_COLORS } from "@/components/shared/type-badge";
import {
  formatMatchupMultiplier,
  formatTypeLabel,
  TYPE_CHART_ABBREVIATIONS,
} from "@/components/type-chart/type-chart-shared";

const MATRIX = buildTypeMatchupMatrix();

function cellClassName(multiplier: TypeMatchupMultiplier): string {
  switch (multiplier) {
    case 2:
      return "bg-emerald-600/90 font-semibold text-white";
    case 0.5:
      return "bg-rose-900/85 font-semibold text-rose-50";
    case 0:
      return "bg-zinc-950 font-semibold text-zinc-100";
    default:
      return "bg-background/20 text-muted-foreground/45";
  }
}

type TypeChartMatrixProps = {
  className?: string;
  showFooter?: boolean;
};

export function TypeChartMatrix({ className, showFooter = true }: TypeChartMatrixProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="overflow-x-auto rounded-2xl border border-border/50 bg-background/30">
        <table className="w-max min-w-full border-collapse text-center text-xs">
          <thead>
            <tr>
              <th
                scope="col"
                className="sticky left-0 z-20 min-w-[7.5rem] border-b border-r border-border/50 bg-card/95 px-2 py-2 text-left text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
              >
                Attacking ↓ / Defending →
              </th>
              {MATRIX.types.map((defendingType) => (
                <th
                  key={defendingType}
                  scope="col"
                  className="min-w-[2.35rem] border-b border-border/40 bg-card/70 px-1 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                  title={formatTypeLabel(defendingType)}
                >
                  {TYPE_CHART_ABBREVIATIONS[defendingType]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MATRIX.cells.map((row) => {
              const attackingType = row[0]?.attackingType;
              if (!attackingType) {
                return null;
              }

              const accent = TYPE_COLORS[attackingType] ?? "#9ca3af";

              return (
                <tr key={attackingType} className="border-t border-border/30">
                  <th
                    scope="row"
                    className="sticky left-0 z-10 border-r border-border/50 bg-card/95 px-2 py-1.5 text-left text-xs font-medium capitalize text-foreground"
                    style={{ boxShadow: `inset 3px 0 0 ${accent}` }}
                  >
                    {formatTypeLabel(attackingType)}
                  </th>
                  {row.map((cell) => (
                    <td
                      key={`${cell.attackingType}-${cell.defendingType}`}
                      className={cn(
                        "min-w-[2.35rem] px-1 py-1.5 tabular-nums",
                        cellClassName(cell.multiplier),
                      )}
                      title={`${formatTypeLabel(cell.attackingType)} → ${formatTypeLabel(cell.defendingType)}: ${cell.multiplier}x`}
                    >
                      {formatMatchupMultiplier(cell.multiplier)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Legend:</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-flex min-w-[1.5rem] justify-center rounded bg-emerald-600/90 px-1.5 py-0.5 font-semibold text-white">
            2
          </span>
          Super effective
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-flex min-w-[1.5rem] justify-center rounded bg-rose-900/85 px-1.5 py-0.5 font-semibold text-rose-50">
            ½
          </span>
          Not very effective
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-flex min-w-[1.5rem] justify-center rounded bg-zinc-950 px-1.5 py-0.5 font-semibold text-zinc-100">
            0
          </span>
          No effect
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-flex min-w-[1.5rem] justify-center rounded bg-background/20 px-1.5 py-0.5 text-muted-foreground/50">
            1
          </span>
          Neutral
        </span>
      </div>

      {showFooter ? (
        <p className="text-xs text-muted-foreground">
          Matchups follow Generation VI onward (from XY through current mainline games).
        </p>
      ) : null}
    </div>
  );
}
