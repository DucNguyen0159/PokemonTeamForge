import {
  buildStatRangeRows,
  statBarColorClass,
  statBarTier,
  statBarWidthPercent,
} from "@/lib/pokemon/stat-ranges";
import type { PokemonBaseStats } from "@/types/pokemon";
import { cn } from "@/utils";

type PokemonBaseStatsTableProps = {
  stats: PokemonBaseStats;
};

export function PokemonBaseStatsTable({ stats }: PokemonBaseStatsTableProps) {
  const rows = buildStatRangeRows(stats);

  return (
    <div className="overflow-x-auto rounded-2xl border border-border/50 bg-background/30">
      <table className="w-full min-w-[32rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border/50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
            <th scope="col" className="px-3 py-2 font-medium">
              Stat
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium tabular-nums">
              Base
            </th>
            <th scope="col" className="min-w-[9rem] px-3 py-2 font-medium">
              Bar
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium tabular-nums">
              Min Lv100
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium tabular-nums">
              Max Lv100
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const tier = statBarTier(row.base);
            const width = statBarWidthPercent(row.base);

            return (
              <tr key={row.key} className="border-t border-border/35">
                <th scope="row" className="px-3 py-2 font-medium text-foreground">
                  {row.label}
                </th>
                <td className="px-3 py-2 text-right font-semibold tabular-nums text-foreground">
                  {row.base}
                </td>
                <td className="px-3 py-2">
                  <div className="h-2.5 overflow-hidden rounded-full bg-muted/50">
                    <div
                      className={cn("h-full rounded-full transition-[width]", statBarColorClass(tier))}
                      style={{ width: `${width}%` }}
                      role="presentation"
                    />
                  </div>
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                  {row.minLevel100}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                  {row.maxLevel100}
                </td>
              </tr>
            );
          })}
          <tr className="border-t border-border/50 bg-primary/5">
            <th scope="row" className="px-3 py-2 font-semibold text-primary">
              Total
            </th>
            <td className="px-3 py-2 text-right font-semibold tabular-nums text-primary">
              {stats.total}
            </td>
            <td className="px-3 py-2" />
            <td className="px-3 py-2" />
            <td className="px-3 py-2" />
          </tr>
        </tbody>
      </table>
    </div>
  );
}
