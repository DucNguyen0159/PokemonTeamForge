"use client";

import { useMemo, useState } from "react";

import { ChampionsBattlePlanEditor } from "@/components/champions/champions-battle-plan-editor";
import { ChampionsEmptyState } from "@/components/champions/shared/champions-empty-state";
import { ChampionsRulesStrip } from "@/components/champions/shared/champions-rules-strip";
import { Button } from "@/components/ui/button";
import { CHAMPIONS_BATTLE_PLAN_TEMPLATES } from "@/data/champions-battle-plan-templates";
import { CHAMPIONS_BUILDER_PLANS_HREF } from "@/data/champions";
import { buildSlotOptions } from "@/lib/champions/battle-plan-utils";
import { useChampionsTeamStore } from "@/store/champions-team-store";
import type { PokemonDetail } from "@/types/pokemon";
import { cn } from "@/utils";
import { ClipboardList } from "lucide-react";

export function ChampionsBuilderPlansPanel({
  pokemonDetailsBySlot,
}: {
  pokemonDetailsBySlot: Record<number, PokemonDetail>;
}) {
  const team = useChampionsTeamStore((state) => state.team);
  const addBattlePlan = useChampionsTeamStore((state) => state.addBattlePlan);
  const addBattlePlanFromTemplate = useChampionsTeamStore((state) => state.addBattlePlanFromTemplate);
  const slotOptions = buildSlotOptions(team);
  const sortedPlans = useMemo(
    () =>
      [...team.battlePlans].sort((left, right) => {
        if (left.format !== right.format) {
          return left.format === "single" ? -1 : 1;
        }
        return left.name.localeCompare(right.name);
      }),
    [team.battlePlans],
  );
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(
    sortedPlans[0]?.id ?? null,
  );
  const activePlan =
    sortedPlans.find((plan) => plan.id === selectedPlanId) ?? sortedPlans[0] ?? null;

  return (
    <div className="grid gap-4 xl:grid-cols-[14rem_minmax(0,1fr)]">
      <section className="space-y-3 rounded-2xl border border-border/60 bg-card/70 p-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Plans</h2>
          <p className="mt-1 text-[11px] text-muted-foreground">3v3 / 4v4 bring lists</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Button size="sm" variant="secondary" className="h-7 rounded-lg text-xs" onClick={() => addBattlePlan("single")}>
            + Singles
          </Button>
          <Button size="sm" variant="secondary" className="h-7 rounded-lg text-xs" onClick={() => addBattlePlan("double")}>
            + Doubles
          </Button>
        </div>
        <div className="flex flex-wrap gap-1">
          {CHAMPIONS_BATTLE_PLAN_TEMPLATES.map((template) => (
            <Button
              key={template.id}
              size="sm"
              variant="outline"
              className="h-7 rounded-full px-2 text-[10px]"
              onClick={() => {
                addBattlePlanFromTemplate(template);
                setSelectedPlanId(null);
              }}
            >
              {template.name}
            </Button>
          ))}
        </div>
        <ul className="space-y-1">
          {sortedPlans.map((plan) => (
            <li key={plan.id}>
              <button
                type="button"
                className={cn(
                  "w-full rounded-lg px-2 py-2 text-left text-xs transition-colors",
                  activePlan?.id === plan.id
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-background/50 text-foreground",
                )}
                onClick={() => setSelectedPlanId(plan.id)}
              >
                <span className="font-medium">{plan.name}</span>
                <span className="mt-0.5 block text-[10px] text-muted-foreground">
                  {plan.format === "single" ? "Singles 3v3" : "Doubles 4v4"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        {sortedPlans.length === 0 ? (
          <ChampionsEmptyState
            icon={ClipboardList}
            title="No battle plans yet"
            description="Add a Singles or Doubles plan, or start from a template. Plans power Matchup Coach analysis."
            primaryHref={CHAMPIONS_BUILDER_PLANS_HREF}
            primaryLabel="Create first plan"
            secondaryHref="/champions/coach"
            secondaryLabel="Open Matchup Coach"
          />
        ) : activePlan ? (
          <ChampionsBattlePlanEditor
            key={activePlan.id}
            plan={activePlan}
            slotOptions={slotOptions}
            pokemonDetailsBySlot={pokemonDetailsBySlot}
          />
        ) : null}

        <details className="rounded-2xl border border-border/60 bg-card/70 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-foreground">
            How battle plans work
          </summary>
          <div className="mt-3 space-y-2 text-xs text-muted-foreground">
            <p>Singles 3v3: pick 3 Pokémon and 1 lead. Doubles 4v4: pick 4 Pokémon and 2 leads.</p>
            <ChampionsRulesStrip compact />
          </div>
        </details>
      </section>
    </div>
  );
}
