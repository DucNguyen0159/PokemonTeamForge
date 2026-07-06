"use client";

import { useEffect, useMemo, useState } from "react";

import {
  ChampionsCoachAnalysisTabs,
  type CoachAnalysisTab,
} from "@/components/champions/champions-coach-analysis-tabs";
import { ChampionsShell } from "@/components/champions/champions-shell";
import { ChampionsActiveTeamBar } from "@/components/champions/shared/champions-active-team-bar";
import { MatchupCoachBriefing } from "@/components/champions/matchup-coach/matchup-coach-briefing";
import { MatchupCoachEmptyState } from "@/components/champions/matchup-coach/matchup-coach-empty-state";
import { MatchupCoachMegaWarning } from "@/components/champions/matchup-coach/matchup-coach-mega-warning";
import { MatchupCoachOffensiveCoverage } from "@/components/champions/matchup-coach/matchup-coach-offensive-coverage";
import { MatchupCoachPlanWarnings } from "@/components/champions/matchup-coach/matchup-coach-plan-warnings";
import { MatchupCoachPresetCompare } from "@/components/champions/matchup-coach/matchup-coach-preset-compare";
import {
  MatchupCoachLeadSuggestions,
  MatchupCoachSpHints,
} from "@/components/champions/matchup-coach/matchup-coach-sp-hints";
import { MatchupCoachSpeedLadder } from "@/components/champions/matchup-coach/matchup-coach-speed-ladder";
import { MatchupCoachThreatCards } from "@/components/champions/matchup-coach/matchup-coach-threat-cards";
import { MatchupCoachWeaknessHeatmap } from "@/components/champions/matchup-coach/matchup-coach-weakness-heatmap";
import { getChampionsPresetById } from "@/data/champions-presets";
import { useCoachDefensiveAnalysis } from "@/hooks/use-coach-defensive-analysis";
import { useChampionsRosterCatalog } from "@/hooks/queries/use-pokemon-catalog";
import {
  buildActionableSpHints,
  buildAllPlanCoachWarnings,
  buildMegaDependencyInsight,
  buildMemberInsights,
  buildOffensiveCoverage,
  buildPlanLeadSuggestions,
  buildPresetComparison,
  buildReadinessSummary,
  filterSlotsForPlan,
  filterThreatsForScenario,
  getPlanSelectedSlots,
  inferScenarioFromMatchupLabel,
  type MatchupScenarioId,
} from "@/lib/champions/matchup-coach-analysis";
import { useChampionsTeamStore } from "@/store/champions-team-store";

export function ChampionsMatchupCoach() {
  const team = useChampionsTeamStore((state) => state.team);
  const sourcePresetId = useChampionsTeamStore((state) => state.sourcePresetId);
  const [analysisTab, setAnalysisTab] = useState<CoachAnalysisTab>("overview");
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [scenarioId, setScenarioId] = useState<MatchupScenarioId>("all");
  const [scenarioTouched, setScenarioTouched] = useState(false);

  const filledSlots = useMemo(
    () => team.pokemon.filter((slot) => slot.pokemonName.trim().length > 0),
    [team.pokemon],
  );
  const hasRoster = filledSlots.length > 0;

  const tabsNeedingDetails: CoachAnalysisTab[] = ["overview", "defensive", "offensive", "speed"];
  const shouldLoadDetails = hasRoster && tabsNeedingDetails.includes(analysisTab);

  const {
    detailsBySlot,
    detailErrorsBySlot,
    isDetailsLoading,
  } = useChampionsRosterCatalog(team.pokemon, {
    loadDetails: shouldLoadDetails ? "all" : "none",
  });
  const pokemonBySlot = useMemo(
    () => new Map(Object.entries(detailsBySlot).map(([slot, detail]) => [Number(slot), detail])),
    [detailsBySlot],
  );
  const isLoading = isDetailsLoading;
  const error = useMemo(() => {
    const failedSlots = Object.keys(detailErrorsBySlot).length;
    return failedSlots > 0
      ? "Unable to load some Pokédex details for matchup coaching."
      : null;
  }, [detailErrorsBySlot]);

  const selectedPlan = useMemo(
    () => team.battlePlans.find((plan) => plan.id === selectedPlanId) ?? null,
    [team.battlePlans, selectedPlanId],
  );

  const sourcePreset = useMemo(
    () => (sourcePresetId ? getChampionsPresetById(sourcePresetId) : null),
    [sourcePresetId],
  );

  const presetComparison = useMemo(
    () => (sourcePreset ? buildPresetComparison(sourcePreset, team) : null),
    [sourcePreset, team],
  );

  useEffect(() => {
    if (selectedPlanId && !team.battlePlans.some((plan) => plan.id === selectedPlanId)) {
      setSelectedPlanId(null);
    }
  }, [selectedPlanId, team.battlePlans]);

  useEffect(() => {
    if (!selectedPlan || scenarioTouched) {
      return;
    }
    setScenarioId(inferScenarioFromMatchupLabel(selectedPlan.matchupLabel));
  }, [selectedPlan, scenarioTouched]);

  const analysisSlots = useMemo(
    () => filterSlotsForPlan(filledSlots, selectedPlan),
    [filledSlots, selectedPlan],
  );

  const bringSlots = useMemo(
    () => new Set(selectedPlan ? getPlanSelectedSlots(selectedPlan) : []),
    [selectedPlan],
  );

  const memberInsights = useMemo(
    () =>
      buildMemberInsights(analysisSlots, (slot) => {
        const detail = pokemonBySlot.get(slot);
        if (!detail) {
          return undefined;
        }
        return {
          primaryType: detail.primaryType,
          secondaryType: detail.secondaryType,
          stats: detail.stats,
        };
      }),
    [analysisSlots, pokemonBySlot],
  );

  const { weaknessMap, threatChecklist, isComputing: isDefensiveComputing } =
    useCoachDefensiveAnalysis(memberInsights);
  const filteredThreats = useMemo(
    () => filterThreatsForScenario(threatChecklist, scenarioId),
    [threatChecklist, scenarioId],
  );
  const offensiveCoverage = useMemo(
    () =>
      buildOffensiveCoverage(analysisSlots, (slot) => pokemonBySlot.get(slot)?.moves),
    [analysisSlots, pokemonBySlot],
  );
  const megaInsight = useMemo(
    () => buildMegaDependencyInsight(team, selectedPlan),
    [team, selectedPlan],
  );
  const planWarnings = useMemo(
    () => buildAllPlanCoachWarnings(team, memberInsights, selectedPlanId),
    [team, memberInsights, selectedPlanId],
  );
  const leadSuggestions = useMemo(
    () => buildPlanLeadSuggestions(selectedPlan, memberInsights),
    [selectedPlan, memberInsights],
  );
  const spHints = useMemo(() => buildActionableSpHints(team.pokemon), [team.pokemon]);
  const readiness = useMemo(
    () =>
      buildReadinessSummary(team, memberInsights, weaknessMap, threatChecklist, {
        selectedPlan,
        megaInsight,
        planWarnings,
      }),
    [team, memberInsights, weaknessMap, threatChecklist, selectedPlan, megaInsight, planWarnings],
  );

  return (
    <ChampionsShell eyebrow="Matchup Coach" title="Matchup Coach" variant="tool">
      <ChampionsActiveTeamBar variant="mini" showWhenEmpty />

      {!hasRoster ? <MatchupCoachEmptyState /> : null}

      {error ? (
        <p className="rounded-2xl border border-destructive/35 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {hasRoster ? (
        <>
          <MatchupCoachBriefing
            team={team}
            pokemonBySlot={pokemonBySlot}
            readiness={readiness}
            isLoading={isLoading || isDefensiveComputing}
            selectedPlan={selectedPlan}
            selectedPlanId={selectedPlanId}
            onSelectPlan={setSelectedPlanId}
            bringSlots={bringSlots}
            weaknessMap={weaknessMap}
            threatChecklist={threatChecklist}
            planWarnings={planWarnings}
            megaInsight={megaInsight}
          />

          <ChampionsCoachAnalysisTabs activeTab={analysisTab} onTabChange={setAnalysisTab} />

          {analysisTab === "overview" ? (
            <>
              {presetComparison && sourcePresetId ? (
                <MatchupCoachPresetCompare comparison={presetComparison} presetId={sourcePresetId} />
              ) : null}
              <MatchupCoachMegaWarning insight={megaInsight} pokemonBySlot={pokemonBySlot} />
              <MatchupCoachThreatCards
                threats={filteredThreats.slice(0, 3)}
                pokemonBySlot={pokemonBySlot}
                scenarioId={scenarioId}
                onScenarioChange={(nextScenario) => {
                  setScenarioTouched(true);
                  setScenarioId(nextScenario);
                }}
              />
            </>
          ) : null}

          {analysisTab === "defensive" ? (
            isLoading && memberInsights.length === 0 ? (
              <p className="rounded-2xl border border-border/60 bg-card/70 px-4 py-6 text-sm text-muted-foreground">
                Loading defensive analysis...
              </p>
            ) : (
              <>
                <MatchupCoachWeaknessHeatmap
                  weaknessMap={weaknessMap}
                  teamSize={memberInsights.length}
                />
                <MatchupCoachThreatCards
                  threats={filteredThreats}
                  pokemonBySlot={pokemonBySlot}
                  scenarioId={scenarioId}
                  onScenarioChange={(nextScenario) => {
                    setScenarioTouched(true);
                    setScenarioId(nextScenario);
                  }}
                />
              </>
            )
          ) : null}

          {analysisTab === "offensive" ? (
            <MatchupCoachOffensiveCoverage
              coverage={offensiveCoverage}
              teamSize={memberInsights.length}
            />
          ) : null}

          {analysisTab === "speed" ? (
            <MatchupCoachSpeedLadder members={memberInsights} />
          ) : null}

          {analysisTab === "plans" ? (
            <>
              <MatchupCoachPlanWarnings warnings={planWarnings} />
              <section className="grid gap-4 md:grid-cols-2">
                <MatchupCoachLeadSuggestions suggestions={leadSuggestions} />
                <MatchupCoachSpHints hints={spHints} />
              </section>
            </>
          ) : null}
        </>
      ) : null}
    </ChampionsShell>
  );
}
