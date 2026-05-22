import { buildTypeMatchupMatrix } from "@/lib/calculations/type-matchup-matrix";
import { cn } from "@/utils";
import { TYPE_COLORS } from "@/components/shared/type-badge";
import {
  formatMatchupMultiplier,
  formatTypeLabel,
  getTypeMatchupCellClassName,
  TYPE_CHART_ABBREVIATIONS,
  TYPE_MATCHUP_LEGEND_CHIP_CLASS,
} from "@/components/type-chart/type-chart-shared";

const MATRIX = buildTypeMatchupMatrix();

const STICKY_HEADER_CLASS = "bg-card";

type TypeChartMatrixProps = {
  className?: string;
  showFooter?: boolean;
};

export function TypeChartMatrix({ className, showFooter = true }: TypeChartMatrixProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="overflow-x-auto overscroll-x-contain touch-pan-x rounded-2xl border border-border/60 bg-card/50">
        <table className="w-max min-w-full border-collapse text-center text-xs">
          <thead>
            <tr>
              <th
                scope="col"
                className={cn(
                  "sticky left-0 z-20 min-w-[7.5rem] border-b border-r border-border/50 px-2 py-2 text-left text-[10px] font-medium uppercase tracking-wide text-muted-foreground",
                  STICKY_HEADER_CLASS,
                )}
              >
                Attacking ↓ / Defending →
              </th>
              {MATRIX.types.map((defendingType) => (
                <th
                  key={defendingType}
                  scope="col"
                  className={cn(
                    "min-w-[2.35rem] border-b border-border/40 px-1 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground",
                    STICKY_HEADER_CLASS,
                  )}
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
                    className={cn(
                      "sticky left-0 z-10 border-r border-border/50 px-2 py-1.5 text-left text-xs font-medium capitalize text-foreground",
                      STICKY_HEADER_CLASS,
                    )}
                    style={{ boxShadow: `inset 3px 0 0 ${accent}` }}
                  >
                    {formatTypeLabel(attackingType)}
                  </th>
                  {row.map((cell) => (
                    <td
                      key={`${cell.attackingType}-${cell.defendingType}`}
                      className={cn(
                        "min-w-[2.35rem] px-1 py-1.5 tabular-nums",
                        getTypeMatchupCellClassName(cell.multiplier),
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
        {(
          [
            { multiplier: 2 as const, label: "Super effective", display: "2" },
            { multiplier: 0.5 as const, label: "Not very effective", display: "½" },
            { multiplier: 0 as const, label: "No effect", display: "0" },
            { multiplier: 1 as const, label: "Neutral", display: "1" },
          ] as const
        ).map((item) => (
          <span key={item.label} className="inline-flex items-center gap-1.5">
            <span
              className={cn(
                TYPE_MATCHUP_LEGEND_CHIP_CLASS,
                getTypeMatchupCellClassName(item.multiplier),
              )}
            >
              {item.display}
            </span>
            {item.label}
          </span>
        ))}
      </div>

      {showFooter ? (
        <div className="space-y-1 text-xs text-muted-foreground">
          <p>
            Matchups follow Generation VI onward (from XY through current mainline games).
          </p>
          <p className="text-muted-foreground/80">
            Dual-type defenses combine multipliers in Builder; each cell here is single-type only.
          </p>
        </div>
      ) : null}
    </div>
  );
}
