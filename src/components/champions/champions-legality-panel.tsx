"use client";

import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import type { ChampionsLegalityIssue } from "@/lib/champions/legality";
import { cn } from "@/utils";

function extractSlotFromIssue(message: string): number | null {
  const match = message.match(/Slot (\d+)/);
  return match ? Number(match[1]) : null;
}

export function ChampionsLegalityPanel({
  issues,
  className,
  onClose,
}: {
  issues: ChampionsLegalityIssue[];
  className?: string;
  onClose?: () => void;
}) {
  if (issues.length === 0) {
    return (
      <aside className={cn("rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4", className)}>
        <p className="text-sm font-medium text-emerald-100">All legality checks passed.</p>
        {onClose ? (
          <button
            type="button"
            className="mt-2 text-xs text-emerald-200/80 underline"
            onClick={onClose}
          >
            Close
          </button>
        ) : null}
      </aside>
    );
  }

  return (
    <aside className={cn("rounded-2xl border border-amber-500/35 bg-amber-500/10 p-4", className)}>
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-sm font-semibold text-amber-100">Legality and quality checks</h2>
        {onClose ? (
          <button
            type="button"
            className="text-xs text-amber-100/80 underline"
            onClick={onClose}
          >
            Close
          </button>
        ) : null}
      </div>
      <ul className="mt-2 max-h-80 space-y-1 overflow-y-auto text-xs text-amber-100/90">
        {issues.map((issue) => {
          const slot = extractSlotFromIssue(issue.message);
          return (
            <li key={`${issue.severity}-${issue.message}`}>
              [{issue.severity}]{" "}
              {slot ? (
                <Link
                  href={`${ROUTES.championsBuilder}?slot=${slot}`}
                  className="underline decoration-amber-200/50 underline-offset-2"
                  onClick={onClose}
                >
                  {issue.message}
                </Link>
              ) : (
                issue.message
              )}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
