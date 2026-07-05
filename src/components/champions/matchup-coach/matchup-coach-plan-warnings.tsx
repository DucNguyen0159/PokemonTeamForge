import Link from "next/link";
import { AlertTriangle, CircleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PlanCoachWarning } from "@/lib/champions/matchup-coach-analysis";
import { cn } from "@/utils";

export function MatchupCoachPlanWarnings({ warnings }: { warnings: PlanCoachWarning[] }) {
  if (warnings.length === 0) {
    return null;
  }

  const criticalCount = warnings.filter((warning) => warning.severity === "critical").length;

  return (
    <article className="rounded-2xl border border-border/60 bg-card/70 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Battle plan warnings</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Bring-list issues, missing speed control, and shared weaknesses.
          </p>
        </div>
        <Button asChild size="sm" variant="outline">
            <Link href="/champions/builder?tab=plans">Edit plans</Link>
        </Button>
      </div>

      {criticalCount > 0 ? (
        <p className="mt-3 text-xs font-medium text-rose-400">
          {criticalCount} critical issue{criticalCount === 1 ? "" : "s"} to address first.
        </p>
      ) : null}

      <ul className="mt-3 space-y-2">
        {warnings.map((warning) => {
          const Icon = warning.severity === "critical" ? CircleAlert : AlertTriangle;
          return (
            <li
              key={`${warning.planId}-${warning.message}`}
              className={cn(
                "flex items-start gap-2 rounded-xl border px-3 py-2 text-sm",
                warning.severity === "critical"
                  ? "border-rose-500/30 bg-rose-500/8"
                  : "border-amber-500/25 bg-amber-500/8",
              )}
            >
              <Icon
                className={cn(
                  "mt-0.5 h-4 w-4 shrink-0",
                  warning.severity === "critical" ? "text-rose-500" : "text-amber-500",
                )}
              />
              <span className="text-foreground">{warning.message}</span>
            </li>
          );
        })}
      </ul>
    </article>
  );
}
