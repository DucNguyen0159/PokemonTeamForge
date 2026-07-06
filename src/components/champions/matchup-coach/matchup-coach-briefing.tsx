import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, ClipboardList, Copy, Swords } from "lucide-react";

import { PokemonSprite } from "@/components/shared/pokemon-sprite";
import { Button } from "@/components/ui/button";
import { formatSupportLabel } from "@/data/champions-presets";
import { formatLabel } from "@/lib/champions/battle-plan-utils";
import { formatCoachBriefingExport } from "@/lib/champions/coach-briefing-export";
import type {
  MegaDependencyInsight,
  PlanCoachWarning,
  ReadinessSummary,
  ThreatChecklistEntry,
  WeaknessEntry,
} from "@/lib/champions/matchup-coach-analysis";
import type { ChampionsBattlePlan, ChampionsTeam } from "@/types/champions";
import type { PokemonDetail } from "@/types/pokemon";
import { cn } from "@/utils";

function ReadinessMeter({ score }: { score: number }) {
  const pct = (score / 10) * 100;
  const tone =
    score >= 7.5 ? "bg-emerald-500" : score >= 5 ? "bg-amber-500" : "bg-rose-500";

  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Readiness
        </span>
        <span className="text-sm font-semibold tabular-nums text-foreground">{score}/10</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted/60">
        <div className={cn("h-full rounded-full transition-all", tone)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function MatchupCoachBriefing({
  team,
  pokemonBySlot,
  readiness,
  isLoading,
  selectedPlan,
  selectedPlanId,
  onSelectPlan,
  bringSlots,
  weaknessMap,
  threatChecklist,
  planWarnings,
  megaInsight,
}: {
  team: ChampionsTeam;
  pokemonBySlot: Map<number, PokemonDetail>;
  readiness: ReadinessSummary;
  isLoading: boolean;
  selectedPlan: ChampionsBattlePlan | null;
  selectedPlanId: string | null;
  onSelectPlan: (planId: string | null) => void;
  bringSlots: Set<number>;
  weaknessMap: WeaknessEntry[];
  threatChecklist: ThreatChecklistEntry[];
  planWarnings: PlanCoachWarning[];
  megaInsight: MegaDependencyInsight;
}) {
  const filledSlots = team.pokemon.filter((slot) => slot.pokemonName.trim().length > 0);
  const analyzingPlan = selectedPlan !== null;
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  async function handleExportBriefing() {
    const text = formatCoachBriefingExport({
      team,
      readiness,
      weaknessMap,
      threatChecklist,
      selectedPlan,
      planWarnings,
      megaInsight,
    });
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback("Briefing copied to clipboard.");
      window.setTimeout(() => setCopyFeedback(null), 2500);
    } catch {
      setCopyFeedback("Unable to copy — check browser permissions.");
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-border/60 bg-card/70 p-4 md:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">{team.name || "Untitled team"}</h2>
            <span className="rounded-full border border-border/50 bg-background/40 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
              {formatSupportLabel(team.formatSupport)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {filledSlots.length}/6 roster · {team.battlePlans.length} battle plan
            {team.battlePlans.length === 1 ? "" : "s"}
            {analyzingPlan ? (
              <>
                {" "}
                · Analyzing{" "}
                <span className="font-medium text-foreground">
                  {selectedPlan.name} ({formatLabel(selectedPlan.format)})
                </span>
              </>
            ) : (
              " · Full roster view"
            )}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-foreground">{readiness.label}</p>
            {readiness.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border/50 bg-background/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {team.battlePlans.length > 0 ? (
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="sr-only">Battle plan</span>
              <select
                value={selectedPlanId ?? ""}
                onChange={(event) => onSelectPlan(event.target.value || null)}
                className="rounded-lg border border-border/60 bg-background/60 px-2 py-1.5 text-xs text-foreground"
              >
                <option value="">Full roster</option>
                {team.battlePlans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} ({formatLabel(plan.format)})
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <Button asChild size="sm" variant="outline">
            <Link href="/champions/builder">
              <Swords className="mr-1.5 h-3.5 w-3.5" />
              Builder
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/champions/builder?tab=plans">
              <ClipboardList className="mr-1.5 h-3.5 w-3.5" />
              Plans
            </Link>
          </Button>
          <Button size="sm" variant="outline" onClick={() => void handleExportBriefing()}>
            <Copy className="mr-1.5 h-3.5 w-3.5" />
            Export briefing
          </Button>
        </div>
      </div>

      {copyFeedback ? (
        <p className="text-xs text-emerald-300" role="status">
          {copyFeedback}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1fr_minmax(180px,220px)]">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {team.pokemon.map((slot) => {
            const detail = pokemonBySlot.get(slot.slot);
            const hasName = slot.pokemonName.trim().length > 0;
            const inBring = analyzingPlan && bringSlots.has(slot.slot);
            const benchedInPlan = analyzingPlan && hasName && !bringSlots.has(slot.slot);
            return (
              <div
                key={slot.slot}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl border p-2 text-center transition-colors",
                  inBring
                    ? "border-primary/50 bg-primary/10 ring-1 ring-primary/25"
                    : hasName
                      ? "border-border/50 bg-background/40"
                      : "border-dashed border-border/35 bg-muted/20",
                  benchedInPlan && "opacity-45",
                )}
              >
                <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-muted/40">
                  {detail ? (
                    <PokemonSprite
                      src={detail.spriteNormal}
                      alt={detail.name}
                      size={40}
                      className="h-full w-full object-contain"
                    />
                  ) : isLoading && hasName ? (
                    <div className="h-full w-full animate-pulse rounded-lg bg-muted/60" />
                  ) : (
                    <span className="text-[10px] text-muted-foreground">{hasName ? "?" : "—"}</span>
                  )}
                </div>
                <p className="w-full truncate text-[10px] font-medium text-foreground">
                  {hasName ? slot.pokemonName : `Slot ${slot.slot}`}
                </p>
                {inBring ? (
                  <span className="text-[9px] font-semibold uppercase tracking-wide text-primary">
                    Bring
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>

        <ReadinessMeter score={readiness.score} />
      </div>

      {readiness.alerts.length > 0 ? (
        <ul className="space-y-1.5">
          {readiness.alerts.map((alert) => (
            <li
              key={alert}
              className="flex items-start gap-2 rounded-xl border border-amber-500/25 bg-amber-500/8 px-3 py-2 text-xs text-foreground"
            >
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
              <span>{alert}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
