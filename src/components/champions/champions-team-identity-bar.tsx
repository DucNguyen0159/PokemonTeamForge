"use client";

import Link from "next/link";
import { ArrowRight, ShieldAlert } from "lucide-react";

import { ChampionsRosterSlotTile } from "@/components/champions/champions-roster-slot-tile";
import { ChampionsMetricPills } from "@/components/champions/shared/champions-metric-pills";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { slotHasLegalityError } from "@/lib/champions/legality-anchors";
import {
  type ActiveTeamNextStep,
  type ActiveTeamSnapshot,
} from "@/lib/champions/active-team-snapshot";
import type { ChampionsTeam } from "@/types/champions";
import type { PokemonSummary } from "@/types/pokemon";
import { cn } from "@/utils";

type IdentityBarVariant = "expanded" | "compact" | "mini";

export function ChampionsTeamIdentityBar({
  team,
  summariesBySlot,
  snapshot,
  variant = "expanded",
  focusedSlot,
  isSummariesLoading = false,
  onSlotSelect,
  nextStep,
  onLegalityClick,
  headerActions,
  legalityIssues = [],
}: {
  team: ChampionsTeam;
  summariesBySlot: Record<number, PokemonSummary>;
  snapshot: ActiveTeamSnapshot;
  variant?: IdentityBarVariant;
  focusedSlot?: number;
  isSummariesLoading?: boolean;
  onSlotSelect?: (slot: number) => void;
  nextStep?: ActiveTeamNextStep;
  onLegalityClick?: () => void;
  headerActions?: React.ReactNode;
  legalityIssues?: Array<{ severity: "error" | "warning"; message: string }>;
}) {
  const isMini = variant === "mini";
  const isCompact = variant === "compact";

  const slotStrip = (
    <div
      className={cn(
        "flex gap-2",
        isMini ? "overflow-x-auto pb-1" : "flex-wrap sm:flex-nowrap",
      )}
      role="list"
      aria-label="Team roster slots"
    >
      {team.pokemon.map((slot) => (
        <ChampionsRosterSlotTile
          key={slot.id}
          slot={slot}
          summary={summariesBySlot[slot.slot] ?? null}
          spTotal={snapshot.spBySlot[slot.slot]}
          isSelected={focusedSlot === slot.slot}
          isLoading={isSummariesLoading}
          hasLegalityError={slotHasLegalityError(legalityIssues, slot.slot)}
          size={isMini ? "sm" : isCompact ? "md" : "md"}
          href={
            onSlotSelect || isMini
              ? undefined
              : `${ROUTES.championsBuilder}?slot=${slot.slot}`
          }
          onSelect={onSlotSelect}
        />
      ))}
    </div>
  );

  if (isMini) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card/60 p-3">
        <p className="mb-2 truncate text-sm font-semibold text-foreground">{team.name}</p>
        {slotStrip}
      </div>
    );
  }

  return (
    <section
      className={cn(
        "rounded-2xl border border-border/60 bg-card/70",
        isCompact ? "p-3" : "p-5",
        isCompact && "sticky top-[4.5rem] z-20 backdrop-blur supports-[backdrop-filter]:bg-card/90",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          {!isCompact ? (
            <>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Active Team
              </p>
              <h2 className="truncate text-lg font-semibold text-foreground">{team.name}</h2>
              {team.teamNotes?.trim() ? (
                <p className="line-clamp-2 text-xs text-muted-foreground">{team.teamNotes}</p>
              ) : null}
            </>
          ) : (
            <p className="truncate text-sm font-semibold text-foreground">{team.name}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ChampionsMetricPills
            rosterFilled={snapshot.rosterFilled}
            rosterTotal={snapshot.rosterTotal}
            spAllocated={snapshot.spAllocatedTotal}
            spBudget={snapshot.spBudgetTotal}
            planCount={snapshot.battlePlanCount}
            cloudState={snapshot.cloudState}
          />
          {snapshot.errorCount + snapshot.warningCount > 0 && onLegalityClick ? (
            <button
              type="button"
              onClick={onLegalityClick}
              className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[10px] font-medium text-amber-100"
            >
              <ShieldAlert className="size-3" aria-hidden />
              {snapshot.errorCount > 0 ? `${snapshot.errorCount} errors` : null}
              {snapshot.errorCount > 0 && snapshot.warningCount > 0 ? " · " : null}
              {snapshot.warningCount > 0 ? `${snapshot.warningCount} warnings` : null}
            </button>
          ) : null}
          {headerActions}
        </div>
      </div>

      <div className={cn("mt-4", isCompact && "mt-3")}>{slotStrip}</div>

      {!isCompact && nextStep ? (
        <div className="mt-4 flex flex-col gap-3 border-t border-border/40 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium text-primary">Suggested next step</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{nextStep.reason}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" className="rounded-xl">
              <Link href={nextStep.href}>
                {nextStep.label}
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </Button>
            {nextStep.secondary ? (
              <Button asChild size="sm" variant="secondary" className="rounded-xl">
                <Link href={nextStep.secondary.href}>{nextStep.secondary.label}</Link>
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
