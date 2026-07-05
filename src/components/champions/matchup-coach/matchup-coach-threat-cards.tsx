import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

import { PokemonSprite } from "@/components/shared/pokemon-sprite";
import { TypeBadge } from "@/components/shared/type-badge";
import { filterChipClass } from "@/lib/champions/preset-ui";
import {
  MATCHUP_SCENARIOS,
  type MatchupScenarioId,
  type ThreatChecklistEntry,
} from "@/lib/champions/matchup-coach-analysis";
import type { PokemonDetail } from "@/types/pokemon";
import { cn } from "@/utils";

const STATUS_CONFIG = {
  covered: {
    label: "Covered",
    icon: CheckCircle2,
    className: "border-emerald-500/30 bg-emerald-500/8",
    iconClass: "text-emerald-500",
    badgeClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  risky: {
    label: "Risky",
    icon: AlertTriangle,
    className: "border-amber-500/30 bg-amber-500/8",
    iconClass: "text-amber-500",
    badgeClass: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  },
  exposed: {
    label: "Exposed",
    icon: XCircle,
    className: "border-rose-500/30 bg-rose-500/8",
    iconClass: "text-rose-500",
    badgeClass: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  },
} as const;

export function MatchupCoachThreatCards({
  threats,
  pokemonBySlot,
  scenarioId,
  onScenarioChange,
}: {
  threats: ThreatChecklistEntry[];
  pokemonBySlot: Map<number, PokemonDetail>;
  scenarioId: MatchupScenarioId;
  onScenarioChange: (scenarioId: MatchupScenarioId) => void;
}) {
  const scenarioLabel =
    MATCHUP_SCENARIOS.find((scenario) => scenario.id === scenarioId)?.label ?? "All meta";

  return (
    <article className="rounded-2xl border border-border/60 bg-card/70 p-4">
      <h2 className="text-base font-semibold text-foreground">Meta threat checklist</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Archetype pressures and which roster members can absorb them. Pick a scenario to filter
        the list below.
      </p>

      <div className="mt-3 space-y-1.5">
        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Matchup scenario
        </p>
        <div className="flex flex-wrap gap-2">
          {MATCHUP_SCENARIOS.map((scenario) => (
            <button
              key={scenario.id}
              type="button"
              onClick={() => onScenarioChange(scenario.id)}
              className={filterChipClass(scenarioId === scenario.id)}
            >
              {scenario.label}
            </button>
          ))}
        </div>
        {scenarioId !== "all" ? (
          <p className="text-xs text-muted-foreground">
            Showing threats relevant to <span className="font-medium text-foreground">{scenarioLabel}</span>.
          </p>
        ) : null}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {threats.map((threat) => {
          const config = STATUS_CONFIG[threat.status];
          const Icon = config.icon;
          return (
            <div
              key={threat.label}
              className={cn("rounded-xl border p-3", config.className)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{threat.label}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {threat.attackingTypes.map((type) => (
                      <TypeBadge key={`${threat.label}-${type}`} type={type} className="px-1.5 text-[9px]" />
                    ))}
                  </div>
                </div>
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                    config.badgeClass,
                  )}
                >
                  <Icon className={cn("h-3 w-3", config.iconClass)} />
                  {config.label}
                </span>
              </div>

              <div className="mt-3">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  Answers ({threat.defensiveCoverage})
                </p>
                {threat.answers.length > 0 ? (
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {threat.answers.map((answer) => {
                      const detail = pokemonBySlot.get(answer.slot);
                      return (
                        <div
                          key={`${threat.label}-${answer.slot}`}
                          className="flex items-center gap-1.5 rounded-lg border border-border/45 bg-background/50 px-2 py-1"
                          title={answer.name}
                        >
                          <div className="relative h-7 w-7 overflow-hidden rounded-md bg-muted/40">
                            {detail ? (
                              <PokemonSprite
                                src={detail.spriteNormal}
                                alt={answer.name}
                                size={28}
                                className="h-full w-full object-contain"
                              />
                            ) : (
                              <span className="flex h-full w-full items-center justify-center text-[9px] text-muted-foreground">
                                ?
                              </span>
                            )}
                          </div>
                          <span className="max-w-[72px] truncate text-xs font-medium text-foreground">
                            {answer.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">No defensive answers on roster.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}
