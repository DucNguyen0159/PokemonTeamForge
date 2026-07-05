import Link from "next/link";
import { CheckCircle2, GitCompare, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PresetComparisonResult } from "@/lib/champions/matchup-coach-analysis";
import { cn } from "@/utils";

export function MatchupCoachPresetCompare({
  comparison,
  presetId,
}: {
  comparison: PresetComparisonResult;
  presetId: string;
}) {
  const isAligned = comparison.changedSlots === 0;

  return (
    <article className="rounded-2xl border border-border/60 bg-card/70 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <GitCompare className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div>
            <h2 className="text-base font-semibold text-foreground">Compare to preset</h2>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              You loaded{" "}
              <span className="font-medium text-foreground">{comparison.presetName}</span> from
              Strategy Presets. This checks whether your current roster still matches that template
              (species, nature, SP, moves, item).
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {comparison.matchedSlots} slots match · {comparison.changedSlots} diverged
            </p>
          </div>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href={`/champions/presets/${presetId}`}>View preset</Link>
        </Button>
      </div>

      {isAligned ? (
        <p className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/8 px-3 py-2 text-xs text-foreground">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          Your roster still matches the preset template on all filled slots.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {comparison.diffs
            .filter((diff) => diff.status !== "match")
            .map((diff) => (
              <li
                key={`preset-diff-${diff.slot}`}
                className={cn(
                  "rounded-xl border px-3 py-2 text-sm",
                  diff.status === "missing"
                    ? "border-rose-500/30 bg-rose-500/8"
                    : "border-amber-500/25 bg-amber-500/8",
                )}
              >
                <div className="flex items-center gap-2">
                  {diff.status === "missing" ? (
                    <TriangleAlert className="h-4 w-4 shrink-0 text-rose-500" />
                  ) : (
                    <TriangleAlert className="h-4 w-4 shrink-0 text-amber-500" />
                  )}
                  <span className="font-medium text-foreground">
                    Slot {diff.slot}: {diff.pokemonName}
                  </span>
                </div>
                <ul className="mt-1 space-y-0.5 pl-6 text-xs text-muted-foreground">
                  {diff.changes.map((change) => (
                    <li key={`${diff.slot}-${change}`}>{change}</li>
                  ))}
                </ul>
              </li>
            ))}
        </ul>
      )}
    </article>
  );
}
