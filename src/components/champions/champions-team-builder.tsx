"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { FolderOpen, Loader2, Save, Upload, UploadCloud } from "lucide-react";

import { ChampionsBuilderPlansPanel } from "@/components/champions/champions-builder-plans-panel";
import { ChampionsBuilderSettingsPanel } from "@/components/champions/champions-builder-settings-panel";
import { ChampionsBuilderTabs } from "@/components/champions/champions-builder-tabs";
import { ChampionsLegalityPanel } from "@/components/champions/champions-legality-panel";
import { ChampionsLoadTeamDrawer } from "@/components/champions/champions-load-team-drawer";
import { ChampionsRosterOverviewCard } from "@/components/champions/champions-roster-overview-card";
import { ChampionsSlotCard } from "@/components/champions/champions-slot-card";
import { ChampionsTeamIdentityBar } from "@/components/champions/champions-team-identity-bar";
import { ErrorMessage } from "@/components/error/error-message";
import { ChampionsShell } from "@/components/champions/champions-shell";
import { ChampionsPublishConfirmDialog } from "@/components/champions/shared/champions-publish-confirm-dialog";
import { Button } from "@/components/ui/button";
import { usePublishChampionsTeamMutation } from "@/hooks/queries/use-champions-community";
import { useSaveChampionsTeamMutation, useUpdateChampionsTeamMutation } from "@/hooks/queries/use-champions-teams";
import {
  useChampionsRosterCatalog,
  useCompetitiveItems,
} from "@/hooks/queries/use-pokemon-catalog";
import { useActiveTeamSnapshot, useActiveTeamSummaries } from "@/hooks/use-active-team-snapshot";
import { ROUTES } from "@/constants/routes";
import {
  builderTabQueryValue,
  parseBuilderTab,
  type BuilderTab,
} from "@/lib/champions/builder-tabs";
import { evaluateChampionsTeamLegality } from "@/lib/champions/legality";
import { getFirstIssueForSlot, getLegalityAnchor, slotHasLegalityError } from "@/lib/champions/legality-anchors";
import { pokemonKeys } from "@/lib/pokemon/query-keys";
import { resolvePokemonSlug } from "@/lib/pokemon/pokemon-slug-aliases";
import { consumePendingLoadedChampionsTeam } from "@/lib/team/pending-champions-team";
import { useAuthStore } from "@/store/auth-store";
import { useChampionsTeamStore } from "@/store/champions-team-store";
import type { PokemonDetail } from "@/types/pokemon";

export function ChampionsTeamBuilder() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const team = useChampionsTeamStore((state) => state.team);
  const loadTeam = useChampionsTeamStore((state) => state.loadTeam);
  const setSourcePreset = useChampionsTeamStore((state) => state.setSourcePreset);
  const setPokemonBySlot = useChampionsTeamStore((state) => state.setPokemonBySlot);
  const setAbilityBySlot = useChampionsTeamStore((state) => state.setAbilityBySlot);
  const setItemBySlot = useChampionsTeamStore((state) => state.setItemBySlot);
  const setMoveBySlot = useChampionsTeamStore((state) => state.setMoveBySlot);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const saveMutation = useSaveChampionsTeamMutation();
  const updateMutation = useUpdateChampionsTeamMutation();
  const publishMutation = usePublishChampionsTeamMutation();
  const { snapshot } = useActiveTeamSnapshot();
  const { summariesBySlot, isLoading: isSummariesLoading } = useActiveTeamSummaries();

  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadDrawerOpen, setLoadDrawerOpen] = useState(false);
  const [legalityOpen, setLegalityOpen] = useState(false);
  const [overviewMode, setOverviewMode] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [publishUnpublish, setPublishUnpublish] = useState(false);

  const activeTab = parseBuilderTab(searchParams.get("tab"));
  const urlSlot = Number(searchParams.get("slot"));
  const focusSp = searchParams.get("focus") === "sp";
  const firstEmptySlot =
    team.pokemon.find((slot) => !slot.pokemonName.trim())?.slot ?? 1;
  const [activeSlot, setActiveSlot] = useState(
    urlSlot >= 1 && urlSlot <= 6 ? urlSlot : firstEmptySlot,
  );

  const loadAllDetails = activeTab === "plans" || overviewMode;
  const {
    detailsBySlot: pokemonDetailsBySlot,
    isDetailsLoading,
  } = useChampionsRosterCatalog(team.pokemon, {
    loadDetails: loadAllDetails ? "all" : "focused",
    focusedSlot: activeSlot,
  });
  const { data: competitiveItems = [] } = useCompetitiveItems();
  const legalityIssues = useMemo(() => evaluateChampionsTeamLegality(team), [team]);
  const blockingIssues = useMemo(
    () => legalityIssues.filter((issue) => issue.severity === "error"),
    [legalityIssues],
  );

  const itemOptions = useMemo(() => competitiveItems.map((item) => item.name), [competitiveItems]);
  const activePokemon = team.pokemon.find((slot) => slot.slot === activeSlot) ?? team.pokemon[0];
  const activeSlotDetailLoading =
    isDetailsLoading && !pokemonDetailsBySlot[activeSlot] && Boolean(activePokemon.pokemonName.trim());

  useEffect(() => {
    if (urlSlot >= 1 && urlSlot <= 6) {
      setActiveSlot(urlSlot);
    }
  }, [urlSlot]);

  useEffect(() => {
    if (searchParams.get("issues") === "open") {
      setLegalityOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const pending = consumePendingLoadedChampionsTeam();
    if (pending) {
      loadTeam(pending.team);
      if (pending.sourcePresetId) {
        setSourcePreset(pending.sourcePresetId, pending.sourcePresetName);
      }
    }
  }, [loadTeam, setSourcePreset]);

  useEffect(() => {
    team.pokemon.forEach((slot) => {
      const detail = pokemonDetailsBySlot[slot.slot];
      if (detail && !slot.pokemonId) {
        setPokemonBySlot(slot.slot, { pokemonId: detail.id, pokemonName: detail.name });
      }
    });
  }, [pokemonDetailsBySlot, setPokemonBySlot, team.pokemon]);

  function replaceBuilderParams(mutator: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutator(params);
    const query = params.toString();
    router.replace(query ? `${ROUTES.championsBuilder}?${query}` : ROUTES.championsBuilder, {
      scroll: false,
    });
  }

  function selectTab(tab: BuilderTab) {
    replaceBuilderParams((params) => {
      const queryValue = builderTabQueryValue(tab);
      if (queryValue) {
        params.set("tab", queryValue);
      } else {
        params.delete("tab");
      }
    });
  }

  function selectSlot(slotNumber: number) {
    setActiveSlot(slotNumber);
    replaceBuilderParams((params) => {
      params.set("slot", String(slotNumber));
      if (params.get("focus") === "sp" && slotNumber !== activeSlot) {
        params.delete("focus");
      }
    });
  }

  useEffect(() => {
    if (searchParams.get("save") === "1" && activeTab !== "settings") {
      selectTab("settings");
    }
  }, [activeTab, searchParams]);

  useEffect(() => {
    if (focusSp && activeTab !== "roster") {
      selectTab("roster");
    }
  }, [activeTab, focusSp]);

  useEffect(() => {
    if (activeTab !== "roster") {
      return;
    }
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (event.key === "ArrowLeft" && activeSlot > 1) {
        event.preventDefault();
        selectSlot(activeSlot - 1);
      }
      if (event.key === "ArrowRight" && activeSlot < 6) {
        event.preventDefault();
        selectSlot(activeSlot + 1);
      }
      if (event.key.toLowerCase() === "o") {
        event.preventDefault();
        setOverviewMode((current) => !current);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeSlot, activeTab]);

  useEffect(() => {
    if (searchParams.get("issues") !== "open" || legalityIssues.length === 0) {
      return;
    }
    const firstError = legalityIssues.find((issue) => issue.severity === "error") ?? legalityIssues[0];
    const anchor = getLegalityAnchor(firstError);
    if (anchor.kind === "slot" && anchor.slot >= 1 && anchor.slot <= 6) {
      selectTab("roster");
      selectSlot(anchor.slot);
      if (anchor.field === "sp") {
        replaceBuilderParams((params) => {
          params.set("focus", "sp");
          params.set("slot", String(anchor.slot));
        });
      }
    }
  }, [searchParams, legalityIssues]);

  function handleSelectPokemon(slotNumber: number, detail: PokemonDetail) {
    queryClient.setQueryData(pokemonKeys.detail(detail.slug), detail);
    setPokemonBySlot(slotNumber, { pokemonId: detail.id, pokemonName: detail.name });
    const defaultAbility = detail.abilities.find((ability) => !ability.isHidden) ?? detail.abilities[0];
    if (defaultAbility) {
      setAbilityBySlot(slotNumber, defaultAbility.name);
    }
    setItemBySlot(slotNumber, "");
    [1, 2, 3, 4].forEach((moveSlot) => {
      setMoveBySlot(slotNumber, moveSlot as 1 | 2 | 3 | 4, "");
    });
  }

  function handleClearSlotDetail(slotNumber: number) {
    const slot = team.pokemon.find((entry) => entry.slot === slotNumber);
    if (slot?.pokemonName.trim()) {
      const slug = slot.pokemonId ? String(slot.pokemonId) : resolvePokemonSlug(slot.pokemonName);
      queryClient.removeQueries({ queryKey: pokemonKeys.detail(slug) });
    }
  }

  async function handleSave() {
    if (!isAuthenticated) {
      setError("Please log in to save Champions teams to cloud.");
      return;
    }
    setError(null);
    setFeedback(null);
    if (blockingIssues.length > 0) {
      setError(blockingIssues[0]?.message ?? "Resolve blocking legality errors before saving.");
      setLegalityOpen(true);
      return;
    }
    try {
      if (team.id) {
        const updated = await updateMutation.mutateAsync({ teamId: team.id, team });
        loadTeam(updated);
        setFeedback("Champions cloud team updated.");
      } else {
        const saved = await saveMutation.mutateAsync(team);
        loadTeam(saved);
        setFeedback("Champions team saved as a new cloud team.");
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save Champions team.");
    }
  }

  async function executePublish(isPublic: boolean) {
    if (!team.id) {
      return;
    }
    setPublishDialogOpen(false);
    setError(null);
    setFeedback(null);
    try {
      await publishMutation.mutateAsync({ teamId: team.id, isPublic });
      loadTeam({ ...team, isPublic });
      setFeedback(isPublic ? "Team published to Community." : "Team removed from Community.");
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : "Unable to update publish status.");
    }
  }

  function openPublishDialog(unpublish: boolean) {
    if (!team.id) {
      setError("Save your team first before publishing.");
      return;
    }
    if (blockingIssues.length > 0) {
      setError(blockingIssues[0]?.message ?? "Resolve blocking legality errors before publishing.");
      setLegalityOpen(true);
      return;
    }
    setPublishUnpublish(unpublish);
    setPublishDialogOpen(true);
  }

  async function handlePublish() {
    openPublishDialog(false);
  }

  async function handleUnpublish() {
    openPublishDialog(true);
  }

  const headerActions = (
    <>
      <Button size="sm" variant="secondary" className="h-8 rounded-xl" onClick={() => void handleSave()} disabled={saveMutation.isPending || updateMutation.isPending} title={blockingIssues[0]?.message}>
        {(saveMutation.isPending || updateMutation.isPending) ? (
          <Loader2 className="size-3.5 animate-spin" aria-hidden />
        ) : (
          <Save className="size-3.5" aria-hidden />
        )}
        Save
      </Button>
      {team.id && blockingIssues.length === 0 ? (
        team.isPublic ? (
          <Button
            size="sm"
            variant="outline"
            className="h-8 rounded-xl"
            onClick={() => void handleUnpublish()}
            disabled={publishMutation.isPending}
          >
            {publishMutation.isPending ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
            ) : (
              <UploadCloud className="size-3.5" aria-hidden />
            )}
            Unpublish
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="h-8 rounded-xl"
            onClick={() => void handlePublish()}
            disabled={publishMutation.isPending}
          >
            {publishMutation.isPending ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
            ) : (
              <Upload className="size-3.5" aria-hidden />
            )}
            Publish
          </Button>
        )
      ) : null}
      <Button size="sm" variant="outline" className="h-8 rounded-xl" onClick={() => setLoadDrawerOpen(true)}>
        <FolderOpen className="size-3.5" aria-hidden />
        Load
      </Button>
    </>
  );

  const activeSlotIssue = getFirstIssueForSlot(legalityIssues, activeSlot)?.message ?? null;

  const slotNavControls = {
    onPrev: () => selectSlot(activeSlot - 1),
    onNext: () => selectSlot(activeSlot + 1),
    onToggleOverview: () => setOverviewMode((current) => !current),
    overviewMode,
    activeSlot,
    canGoPrev: activeSlot > 1,
    canGoNext: activeSlot < 6,
  };

  return (
    <ChampionsShell eyebrow="Champions Builder" title="Team Builder" variant="compact">
      <ChampionsTeamIdentityBar
        team={team}
        summariesBySlot={summariesBySlot}
        snapshot={snapshot}
        variant="compact"
        focusedSlot={activeSlot}
        isSummariesLoading={isSummariesLoading}
        legalityIssues={legalityIssues}
        onSlotSelect={(slotNumber) => {
          if (activeTab !== "roster") {
            selectTab("roster");
          }
          selectSlot(slotNumber);
        }}
        onLegalityClick={() => setLegalityOpen(true)}
        headerActions={headerActions}
      />

      <ChampionsBuilderTabs
        activeTab={activeTab}
        planCount={team.battlePlans.length}
        onTabChange={selectTab}
      />

      <ChampionsLoadTeamDrawer open={loadDrawerOpen} onClose={() => setLoadDrawerOpen(false)} />

      {feedback ? (
        <p className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200" role="status">
          {feedback}
        </p>
      ) : null}
      {error ? <ErrorMessage title="Champions Builder" message={error} /> : null}

      {activeTab === "roster" ? (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,900px)_18rem]">
          <div className="mx-auto w-full max-w-[900px] space-y-3">
            {!overviewMode ? (
              <ChampionsSlotCard
                key={`editor-slot-${activeSlot}`}
                slot={activePokemon}
                pokemonDetail={pokemonDetailsBySlot[activeSlot] ?? null}
                isDetailLoading={activeSlotDetailLoading}
                onSelectPokemon={handleSelectPokemon}
                onClearSlot={handleClearSlotDetail}
                itemOptions={itemOptions}
                legalityIssues={legalityIssues}
                isFocused
                focusSp={focusSp && activeSlot === urlSlot}
                slotIssue={activeSlotIssue}
                hasLegalityError={slotHasLegalityError(legalityIssues, activeSlot)}
                navControls={slotNavControls}
              />
            ) : (
              <>
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base font-semibold text-foreground">Roster overview</h2>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 rounded-lg px-2.5"
                    onClick={() => setOverviewMode(false)}
                  >
                    Focus slot {activeSlot}
                  </Button>
                </div>
                <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {team.pokemon.map((slot) => (
                    <ChampionsRosterOverviewCard
                      key={slot.id}
                      slot={slot}
                      pokemonDetail={pokemonDetailsBySlot[slot.slot] ?? null}
                      isActive={activeSlot === slot.slot}
                      hasLegalityError={slotHasLegalityError(legalityIssues, slot.slot)}
                      onSelect={() => {
                        selectSlot(slot.slot);
                        setOverviewMode(false);
                        document.getElementById(`champions-slot-${slot.slot}`)?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }}
                    />
                  ))}
                </section>
              </>
            )}
          </div>

          <div className="hidden space-y-3 xl:sticky xl:top-28 xl:block xl:self-start">
            {(legalityOpen || legalityIssues.length > 0) && (
              <ChampionsLegalityPanel
                issues={legalityIssues}
                onClose={() => setLegalityOpen(false)}
                className={legalityOpen ? undefined : "hidden xl:block"}
              />
            )}
          </div>
        </div>
      ) : null}

      {activeTab === "plans" ? (
        <ChampionsBuilderPlansPanel pokemonDetailsBySlot={pokemonDetailsBySlot} />
      ) : null}

      {activeTab === "settings" ? <ChampionsBuilderSettingsPanel /> : null}

      {legalityOpen ? (
        <>
          <button
            type="button"
            aria-label="Close legality panel"
            className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm xl:hidden"
            onClick={() => setLegalityOpen(false)}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 max-h-[75vh] overflow-y-auto rounded-t-2xl border border-border/60 bg-card p-4 shadow-2xl xl:hidden">
            <ChampionsLegalityPanel issues={legalityIssues} onClose={() => setLegalityOpen(false)} />
          </div>
        </>
      ) : null}
      <ChampionsPublishConfirmDialog
        open={publishDialogOpen}
        isUnpublish={publishUnpublish}
        onCancel={() => setPublishDialogOpen(false)}
        onConfirm={() => void executePublish(!publishUnpublish)}
      />
    </ChampionsShell>
  );
}
